import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import BusRoute from './src/models/BusRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function updateE03Outbound() {
  const dataPath = path.join(__dirname, 'e03_outbound_final_data.json');
  const importData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const stops = importData.outbound?.stops;
  const geometry = importData.outbound?.geometry;

  if (!Array.isArray(stops) || stops.length !== 42) {
    throw new Error(`Expected 42 outbound stops, got ${stops?.length ?? 0}.`);
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
    throw new Error('Outbound stops are invalid or not ordered from 1 to 42.');
  }

  if (
    geometry?.type !== 'LineString' ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length !== 957 ||
    !geometry.coordinates.every(
      (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length === 2 &&
        coordinate.every(Number.isFinite)
    )
  ) {
    throw new Error('Outbound geometry must be a valid LineString with 957 [lng, lat] coordinates.');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured.');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const matchingRoutes = await BusRoute.find({ routeNumber: 'E03' }).select('_id routeNumber');
    console.log(`Route E03 exists: ${matchingRoutes.length === 1 ? 'yes' : 'no or duplicate'}`);

    if (matchingRoutes.length !== 1) {
      throw new Error(`Expected exactly one existing E03 route, found ${matchingRoutes.length}; no write performed.`);
    }

    const routeId = matchingRoutes[0]._id;
    const updateResult = await BusRoute.updateOne(
      { _id: routeId, routeNumber: 'E03' },
      {
        $set: {
          'outbound.stops': stops,
          'outbound.geometry': geometry,
        },
      },
      { runValidators: true, timestamps: false }
    );

    if (updateResult.matchedCount !== 1) {
      throw new Error(`Expected to update one E03 route, matched ${updateResult.matchedCount}.`);
    }

    const updatedRoute = await BusRoute.findById(routeId)
      .select('routeNumber outbound.stops outbound.geometry')
      .lean();
    const savedStops = (updatedRoute?.outbound?.stops || []).map(
      ({ name, order, lat, lng }) => ({ name, order, lat, lng })
    );
    const savedGeometry = updatedRoute?.outbound?.geometry || {};
    const savedCoordinates = savedGeometry.coordinates || [];

    if (
      updatedRoute?.routeNumber !== 'E03' ||
      JSON.stringify(savedStops) !== JSON.stringify(stops) ||
      savedGeometry.type !== 'LineString' ||
      JSON.stringify(savedCoordinates) !== JSON.stringify(geometry.coordinates)
    ) {
      throw new Error('Post-update verification failed: MongoDB data differs from the import fixture.');
    }

    console.log('Operation: UPDATE');
    console.log('Route E03 confirmed in MongoDB: yes');
    console.log(`Outbound stops: ${savedStops.length}`);
    console.log(`Geometry type: ${savedGeometry.type}`);
    console.log(`Geometry coordinates: ${savedCoordinates.length}`);
    console.log(`modifiedCount: ${updateResult.modifiedCount}`);
  } finally {
    await mongoose.disconnect();
  }
}

updateE03Outbound().catch((error) => {
  console.error(`E03 outbound update failed: ${error.message}`);
  process.exitCode = 1;
});
