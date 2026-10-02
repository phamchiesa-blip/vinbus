import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import BusRoute from './src/models/BusRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function updateE02Outbound() {
  const dataPath = path.join(__dirname, 'e02_outbound_final_data.json');
  const importData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const outbound = importData.outbound;
  const stops = outbound?.stops;
  const geometry = outbound?.geometry;

  if (!Array.isArray(stops) || stops.length !== 41) {
    throw new Error(`Expected 41 outbound stops, got ${stops?.length ?? 0}.`);
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
    throw new Error('Outbound stops are invalid or not ordered from 1 to 41.');
  }

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
    throw new Error('Outbound geometry is not a valid GeoJSON LineString.');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured.');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const existingRoute = await BusRoute.findOne({ routeNumber: 'E02' }).select('_id');
    console.log(`Route E02 exists: ${Boolean(existingRoute) ? 'yes' : 'no'}`);

    if (!existingRoute) {
      throw new Error('Route E02 does not exist; no document was created.');
    }

    const updateResult = await BusRoute.updateOne(
      { _id: existingRoute._id },
      {
        $set: {
          'outbound.stops': stops,
          'outbound.geometry': geometry,
        },
      },
      { timestamps: false }
    );

    if (updateResult.matchedCount !== 1) {
      throw new Error(`Expected to update one E02 route, matched ${updateResult.matchedCount}.`);
    }

    const updatedRoute = await BusRoute.findById(existingRoute._id)
      .select('routeNumber outbound.stops outbound.geometry')
      .lean();

    const savedStops = updatedRoute?.outbound?.stops || [];
    const savedGeometry = updatedRoute?.outbound?.geometry || {};
    const coordinates = savedGeometry.coordinates || [];

    if (
      updatedRoute?.routeNumber !== 'E02' ||
      savedStops.length !== stops.length ||
      savedGeometry.type !== 'LineString' ||
      coordinates.length !== geometry.coordinates.length
    ) {
      throw new Error('Post-update verification failed.');
    }

    console.log(`Outbound stops: ${savedStops.length}`);
    console.log(`Geometry type: ${savedGeometry.type}`);
    console.log(`Geometry coordinates: ${coordinates.length}`);
    console.log(`modifiedCount: ${updateResult.modifiedCount}`);
  } finally {
    await mongoose.disconnect();
  }
}

updateE02Outbound().catch((error) => {
  console.error(`E02 outbound update failed: ${error.message}`);
  process.exitCode = 1;
});
