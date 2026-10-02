import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import BusRoute from './src/models/BusRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function updateE03Inbound() {
  const dataPath = path.join(__dirname, 'test_e03_osrm_inbound.json');
  const importData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const stops = importData.stops;
  const geometry = importData.geometry;

  if (
    importData.route !== 'E03' ||
    importData.direction !== 'inbound' ||
    importData.inputStopCount !== 43 ||
    importData.waypointCount !== 43 ||
    importData.legCount !== 42 ||
    importData.waypointOrderMatchesInput !== true ||
    importData.reorderedWaypoints?.length !== 0
  ) {
    throw new Error('Input file is not the validated 43-stop E03 inbound OSRM result.');
  }

  if (
    !Array.isArray(stops) ||
    stops.length !== 43 ||
    !stops.every(
      (stop, index) =>
        stop.order === index + 1 &&
        typeof stop.name === 'string' &&
        Number.isFinite(stop.lat) &&
        Number.isFinite(stop.lng)
    )
  ) {
    throw new Error('Inbound stops are invalid or not ordered from 1 to 43.');
  }

  if (
    geometry?.type !== 'LineString' ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length !== 994 ||
    !geometry.coordinates.every(
      (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length === 2 &&
        coordinate.every(Number.isFinite)
    )
  ) {
    throw new Error('Inbound geometry must be a valid LineString with 994 [lng, lat] coordinates.');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured.');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const matchingRoutes = await BusRoute.find({ routeNumber: 'E03' }).select('_id').lean();
    console.log(`Route E03 exists: ${matchingRoutes.length === 1 ? 'yes' : 'no or duplicate'}`);

    if (matchingRoutes.length !== 1) {
      throw new Error(`Expected exactly one existing E03 route, found ${matchingRoutes.length}; no write performed.`);
    }

    const routeId = matchingRoutes[0]._id;
    const beforeUpdate = await BusRoute.findById(routeId).lean();
    if (!beforeUpdate || beforeUpdate.routeNumber !== 'E03') {
      throw new Error('Could not load the existing E03 document; no write performed.');
    }

    const beforeNonInboundFields = { ...beforeUpdate };
    delete beforeNonInboundFields.inbound;

    const updateResult = await BusRoute.updateOne(
      { _id: routeId, routeNumber: 'E03' },
      {
        $set: {
          'inbound.stops': stops,
          'inbound.geometry': geometry,
        },
      },
      { runValidators: true, timestamps: false }
    );

    if (updateResult.matchedCount !== 1) {
      throw new Error(`Expected to update one E03 route, matched ${updateResult.matchedCount}.`);
    }

    const updatedRoute = await BusRoute.findById(routeId).lean();
    const savedStops = (updatedRoute?.inbound?.stops || []).map(
      ({ name, order, lat, lng }) => ({ name, order, lat, lng })
    );
    const savedGeometry = updatedRoute?.inbound?.geometry || {};
    const savedCoordinates = savedGeometry.coordinates || [];
    const afterNonInboundFields = { ...updatedRoute };
    delete afterNonInboundFields.inbound;

    if (
      updatedRoute?.routeNumber !== 'E03' ||
      JSON.stringify(savedStops) !== JSON.stringify(stops) ||
      savedGeometry.type !== 'LineString' ||
      JSON.stringify(savedCoordinates) !== JSON.stringify(geometry.coordinates) ||
      JSON.stringify(afterNonInboundFields) !== JSON.stringify(beforeNonInboundFields) ||
      JSON.stringify(updatedRoute.outbound) !== JSON.stringify(beforeUpdate.outbound)
    ) {
      throw new Error('Post-update verification failed: inbound payload mismatch or non-inbound data changed.');
    }

    console.log('Operation: UPDATE');
    console.log('Route E03 confirmed in MongoDB: yes');
    console.log(`Inbound stops: ${savedStops.length}`);
    console.log(`Geometry type: ${savedGeometry.type}`);
    console.log(`Geometry coordinates: ${savedCoordinates.length}`);
    console.log('Outbound unchanged: yes');
    console.log('Other fields unchanged: yes');
    console.log(`modifiedCount: ${updateResult.modifiedCount}`);
  } finally {
    await mongoose.disconnect();
  }
}

updateE03Inbound().catch((error) => {
  console.error(`E03 inbound update failed: ${error.message}`);
  process.exitCode = 1;
});
