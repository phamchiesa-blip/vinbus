import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const expectedStopCount = 37;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

function getStraightLineDistanceMeters(from, to) {
  const latitudeDelta = toRadians(to.lat - from.lat);
  const longitudeDelta = toRadians(to.lng - from.lng);
  const fromLatitude = toRadians(from.lat);
  const toLatitude = toRadians(to.lat);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 6371000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

async function run() {
  const inputPath = path.join(__dirname, 'e09_outbound_coordinates.json');
  const stops = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  if (stops.length !== expectedStopCount) {
    throw new Error(`Expected ${expectedStopCount} input stops, got ${stops.length}.`);
  }

  if (
    !stops.every(
      (stop, index) =>
        stop.order === index + 1 &&
        typeof stop.name === 'string' &&
        Number.isFinite(stop.lat) &&
        Number.isFinite(stop.lng)
    )
  ) {
    throw new Error('Input stops are invalid or not ordered from 1 to 37.');
  }

  const coordinates = stops.map(({ lat, lng }) => `${lng},${lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true&annotations=distance,duration`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'VinBus-E09-Outbound-OSRM-Test/1.0' },
  });

  if (!response.ok) {
    throw new Error(`OSRM HTTP error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.code !== 'Ok' || !Array.isArray(data.routes) || data.routes.length === 0) {
    throw new Error(`OSRM routing failed: ${data.code || 'unknown error'}`);
  }

  if (!Array.isArray(data.waypoints) || data.waypoints.length !== expectedStopCount) {
    throw new Error(`Expected ${expectedStopCount} OSRM waypoints, got ${data.waypoints?.length ?? 0}.`);
  }

  const route = data.routes[0];
  if (!Array.isArray(route.legs) || route.legs.length !== expectedStopCount - 1) {
    throw new Error(`Expected ${expectedStopCount - 1} route legs, got ${route.legs?.length ?? 0}.`);
  }

  if (
    !data.waypoints.every(
      (waypoint) =>
        Array.isArray(waypoint.location) &&
        waypoint.location.length === 2 &&
        waypoint.location.every(Number.isFinite) &&
        Number.isFinite(waypoint.distance)
    )
  ) {
    throw new Error('OSRM returned invalid waypoint locations or snap distances.');
  }

  const geometry = route.geometry;
  if (
    geometry?.type !== 'LineString' ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length === 0 ||
    !geometry.coordinates.every(
      (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length === 2 &&
        coordinate.every(Number.isFinite)
    )
  ) {
    throw new Error('OSRM did not return a valid GeoJSON LineString geometry.');
  }

  const maxWaypointSnapDistanceMeters = Math.max(...data.waypoints.map((waypoint) => waypoint.distance));
  const legDetails = route.legs.map((leg, index) => {
    const straightLineDistanceMeters = getStraightLineDistanceMeters(stops[index], stops[index + 1]);
    const distanceMeters = leg.distance;

    return {
      legNumber: index + 1,
      fromStopOrder: stops[index].order,
      fromStopName: stops[index].name,
      toStopOrder: stops[index + 1].order,
      toStopName: stops[index + 1].name,
      distanceMeters,
      durationSeconds: leg.duration,
      straightLineDistanceMeters,
      distanceToStraightLineRatio: distanceMeters / Math.max(straightLineDistanceMeters, 1),
      roads: [...new Set(leg.steps.map((step) => step.name).filter(Boolean))],
      uTurns: leg.steps
        .filter((step) => step.maneuver?.modifier === 'uturn' || step.maneuver?.type === 'uturn')
        .map((step) => ({
          roadName: step.name || null,
          type: step.maneuver.type,
          distanceMeters: step.distance,
          location: step.maneuver.location,
          bearingBefore: step.maneuver.bearing_before ?? null,
          bearingAfter: step.maneuver.bearing_after ?? null,
        })),
    };
  });

  const output = {
    route: 'E09',
    direction: 'outbound',
    inputStopCount: stops.length,
    waypointCount: data.waypoints.length,
    legCount: route.legs.length,
    waypointOrderMatchesInput: true,
    reorderedWaypoints: [],
    distance: Number((route.distance / 1000).toFixed(2)),
    duration: Number((route.duration / 60).toFixed(1)),
    maxWaypointSnapDistanceMeters,
    stops,
    geometry: {
      type: 'LineString',
      coordinates: geometry.coordinates,
    },
    waypoints: data.waypoints.map((waypoint, index) => ({
      stopOrder: stops[index].order,
      stopName: stops[index].name,
      originalLocation: [stops[index].lng, stops[index].lat],
      snappedLocation: waypoint.location,
      distanceToRoad: waypoint.distance,
      roadName: waypoint.name,
    })),
    legs: legDetails,
  };

  const outputPath = path.join(__dirname, 'test_e09_osrm_outbound.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`Input stops: ${output.inputStopCount}`);
  console.log(`OSRM waypoints: ${output.waypointCount}`);
  console.log(`Route legs: ${output.legCount}`);
  console.log(`Distance: ${output.distance} km`);
  console.log(`Duration: ${output.duration} minutes`);
  console.log(`Geometry coordinates: ${geometry.coordinates.length}`);
  console.log(`Maximum waypoint snap distance: ${maxWaypointSnapDistanceMeters.toFixed(2)} m`);
  console.log('OSRM waypoint order: matches input order; no stops skipped or reordered.');

  const uTurnLegs = legDetails.filter((leg) => leg.uTurns.length > 0);
  const highDetourLegs = legDetails.filter((leg) => leg.distanceToStraightLineRatio > 2.5 && leg.distanceMeters > 500);

  console.log(`Legs with U-turn maneuvers: ${uTurnLegs.length === 0 ? 'none' : uTurnLegs.map((leg) => leg.legNumber).join(', ')}`);
  console.log(`Legs with distance ratio > 2.5 and > 500 m: ${highDetourLegs.length === 0 ? 'none' : highDetourLegs.map((leg) => leg.legNumber).join(', ')}`);
  
  if (uTurnLegs.length > 0 || highDetourLegs.length > 0) {
    console.log('\n--- Details of noteworthy legs ---');
    const warningLegs = [...new Set([...uTurnLegs, ...highDetourLegs])];
    warningLegs.forEach((l) => {
      console.log(`Leg ${l.legNumber}: [${l.fromStopOrder}] "${l.fromStopName}" -> [${l.toStopOrder}] "${l.toStopName}"`);
      console.log(`  OSRM: ${l.distanceMeters}m | Straight: ${Math.round(l.straightLineDistanceMeters)}m | Ratio: ${l.distanceToStraightLineRatio.toFixed(2)}`);
      console.log(`  Roads: ${l.roads.join(' -> ')}`);
      if (l.uTurns.length > 0) {
        console.log(`  U-turns:`, JSON.stringify(l.uTurns));
      }
    });
  }

  console.log(`\nOutput: ${outputPath}`);
}

run().catch((error) => {
  console.error(`E09 outbound OSRM test failed: ${error.message}`);
  process.exitCode = 1;
});

