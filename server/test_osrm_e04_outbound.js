import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const expectedStopCount = 45;

async function run() {
  const inputPath = path.join(__dirname, 'e04_outbound_coordinates.json');
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
    throw new Error('Input stops are invalid or not ordered from 1 to 45.');
  }

  const coordinates = stops.map(({ lat, lng }) => `${lng},${lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false&annotations=distance,duration`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'VinBus-E04-Outbound-OSRM-Test/1.0' },
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
        waypoint.location.every(Number.isFinite)
    )
  ) {
    throw new Error('OSRM returned an invalid waypoint location.');
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

  const output = {
    route: 'E04',
    direction: 'outbound',
    inputStopCount: stops.length,
    waypointCount: data.waypoints.length,
    legCount: route.legs.length,
    waypointOrderMatchesInput: true,
    reorderedWaypoints: [],
    distance: Number((route.distance / 1000).toFixed(2)),
    duration: Number((route.duration / 60).toFixed(1)),
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
  };

  const outputPath = path.join(__dirname, 'test_e04_osrm_outbound.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`Input stops: ${output.inputStopCount}`);
  console.log(`OSRM waypoints: ${output.waypointCount}`);
  console.log(`Route legs: ${output.legCount}`);
  console.log(`Distance: ${output.distance} km`);
  console.log(`Duration: ${output.duration} minutes`);
  console.log(`Geometry coordinates: ${geometry.coordinates.length}`);
  console.log('OSRM waypoint order: matches input order; no stops skipped or reordered.');
  console.log(`Output: ${outputPath}`);
}

run().catch((error) => {
  console.error(`E04 outbound OSRM test failed: ${error.message}`);
  process.exitCode = 1;
});
