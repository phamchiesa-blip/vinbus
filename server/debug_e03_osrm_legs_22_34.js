import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const sourcePath = path.join(__dirname, 'test_e03_osrm_outbound.json');
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

  if (source.route !== 'E03' || source.direction !== 'outbound' || source.stops.length !== 42) {
    throw new Error('Expected the 42-stop E03 outbound OSRM result.');
  }

  const coordinates = source.stops.map(({ lat, lng }) => `${lng},${lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true&annotations=distance,duration`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'VinBus-E03-Outbound-Leg-Debug/1.0' },
  });

  if (!response.ok) {
    throw new Error(`OSRM HTTP error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error(`OSRM routing failed: ${data.code || 'unknown error'}`);
  }

  const route = data.routes[0];
  if (data.waypoints?.length !== 42 || route.legs?.length !== 41) {
    throw new Error(`Unexpected OSRM response: ${data.waypoints?.length ?? 0} waypoints, ${route.legs?.length ?? 0} legs.`);
  }

  const selectedLegs = [22, 34].map((legNumber) => {
    const index = legNumber - 1;
    const leg = route.legs[index];
    const uTurnStepIndexes = leg.steps
      .map((step, stepIndex) => step.maneuver.modifier === 'uturn' ? stepIndex : -1)
      .filter((stepIndex) => stepIndex >= 0);

    if (uTurnStepIndexes.length !== 1) {
      throw new Error(`Expected one U-turn step in leg ${legNumber}, got ${uTurnStepIndexes.length}.`);
    }

    const uTurnStepIndex = uTurnStepIndexes[0];
    const uTurnStep = leg.steps[uTurnStepIndex];
    const incomingStep = leg.steps[uTurnStepIndex - 1];
    const nextStep = leg.steps[uTurnStepIndex + 1];
    const uTurnCoordinates = uTurnStep.geometry.coordinates;
    const legCoordinates = [];

    for (const step of leg.steps) {
      for (const coordinate of step.geometry.coordinates) {
        const previous = legCoordinates.at(-1);
        if (!previous || previous[0] !== coordinate[0] || previous[1] !== coordinate[1]) {
          legCoordinates.push(coordinate);
        }
      }
    }

    const longitudes = uTurnCoordinates.map(([lng]) => lng);
    const latitudes = uTurnCoordinates.map(([, lat]) => lat);
    const fromStop = source.stops[index];
    const toStop = source.stops[index + 1];

    return {
      legNumber,
      from: {
        name: fromStop.name,
        order: fromStop.order,
        originalCoordinate: [fromStop.lng, fromStop.lat],
        snappedCoordinate: data.waypoints[index].location,
        snapDistanceMeters: data.waypoints[index].distance,
      },
      to: {
        name: toStop.name,
        order: toStop.order,
        originalCoordinate: [toStop.lng, toStop.lat],
        snappedCoordinate: data.waypoints[index + 1].location,
        snapDistanceMeters: data.waypoints[index + 1].distance,
      },
      distanceMeters: leg.distance,
      durationSeconds: leg.duration,
      geometry: {
        type: 'LineString',
        coordinates: legCoordinates,
      },
      steps: leg.steps.map((step, stepIndex) => ({
        stepIndex,
        roadName: step.name || null,
        distanceMeters: step.distance,
        durationSeconds: step.duration,
        maneuver: {
          type: step.maneuver.type,
          modifier: step.maneuver.modifier || null,
          bearingBefore: step.maneuver.bearing_before ?? null,
          bearingAfter: step.maneuver.bearing_after ?? null,
          location: step.maneuver.location,
        },
        geometry: step.geometry,
      })),
      uTurn: {
        roadName: uTurnStep.name || null,
        maneuverType: uTurnStep.maneuver.type,
        maneuverModifier: uTurnStep.maneuver.modifier,
        bearingBefore: uTurnStep.maneuver.bearing_before ?? null,
        bearingAfter: uTurnStep.maneuver.bearing_after ?? null,
        maneuverLocation: uTurnStep.maneuver.location,
        incomingStepEndCoordinate: incomingStep?.geometry.coordinates.at(-1) ?? null,
        outgoingStepStartCoordinate: uTurnCoordinates[0],
        outgoingStepEndCoordinate: uTurnCoordinates.at(-1),
        nextManeuverCoordinate: nextStep?.maneuver.location ?? null,
        nextRoadName: nextStep?.name || null,
        distanceToNextManeuverMeters: uTurnStep.distance,
        durationToNextManeuverSeconds: uTurnStep.duration,
        outgoingStepCoordinateBounds: {
          minLng: Math.min(...longitudes),
          maxLng: Math.max(...longitudes),
          minLat: Math.min(...latitudes),
          maxLat: Math.max(...latitudes),
        },
        geometry: {
          type: 'LineString',
          coordinates: uTurnCoordinates,
        },
        geometryMeaning: 'OSRM represents the U-turn at maneuverLocation. This step geometry runs from that maneuver to the next maneuver; its full distance is not necessarily U-turn arc length or excess detour.',
      },
    };
  });

  const output = {
    route: 'E03',
    direction: 'outbound',
    sourceFile: path.basename(sourcePath),
    osrmProfile: 'driving',
    replay: {
      inputWaypoints: data.waypoints.length,
      returnedLegs: route.legs.length,
      totalDistanceMeters: route.distance,
      totalDurationSeconds: route.duration,
      geometryCoordinateOrder: '[lng, lat]',
      stepGeometryNote: 'Each step geometry begins at its maneuver and runs to the next maneuver.',
    },
    selectedLegs,
  };

  const outputPath = path.join(__dirname, 'debug_e03_osrm_legs_22_34.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`Debug legs: ${selectedLegs.map(({ legNumber }) => legNumber).join(', ')}`);
  console.log(`OSRM waypoints/legs: ${data.waypoints.length}/${route.legs.length}`);
  console.log(`Output: ${outputPath}`);
}

run().catch((error) => {
  console.error(`E03 leg debug failed: ${error.message}`);
  process.exitCode = 1;
});