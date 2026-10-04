import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import mongoose from 'mongoose';
import BusRoute from './src/models/BusRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const omitInboundPayload = (route) => {
  const { inbound, ...otherFields } = route;
  if (!inbound) return { ...otherFields, inbound };

  const { stops, geometry, ...inboundFields } = inbound;
  return { ...otherFields, inbound: { ...inboundFields } };
};

const normalizeStops = (stops) =>
  stops.map(({ name, order, lat, lng }) => ({ name, order, lat, lng }));

async function updateE04Inbound() {
  const dataPath = path.join(__dirname, 'test_e04_osrm_inbound.json');
  const importData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const stops = importData.stops;
  const geometry = importData.geometry;

  if (
    importData.route !== 'E04' ||
    importData.direction !== 'inbound' ||
    importData.inputStopCount !== 40 ||
    importData.waypointCount !== 40 ||
    importData.legCount !== 39 ||
    importData.waypointOrderMatchesInput !== true ||
    importData.reorderedWaypoints?.length !== 0
  ) {
    throw new Error('Input file is not the validated 40-stop E04 inbound OSRM result.');
  }

  if (
    !Array.isArray(stops) ||
    stops.length !== 40 ||
    !stops.every(
      (stop, index) =>
        stop.order === index + 1 &&
        typeof stop.name === 'string' &&
        Number.isFinite(stop.lat) &&
        Number.isFinite(stop.lng)
    ) ||
    stops[0].name !== 'Vincom Long Biên' ||
    stops[39].name !== 'Điểm đỗ xe buýt Smart City (Đầu bến)'
  ) {
    throw new Error('Inbound stops do not match the expected 40-stop E04 sequence.');
  }

  if (
    geometry?.type !== 'LineString' ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length !== 715 ||
    !geometry.coordinates.every(
      (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length === 2 &&
        coordinate.every(Number.isFinite)
    )
  ) {
    throw new Error('Inbound geometry must be a valid LineString with 715 [lng, lat] coordinates.');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured.');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const matchingRoutes = await BusRoute.find({ routeNumber: 'E04' }).select('_id').lean();
    console.log(`Route E04 exists: ${matchingRoutes.length === 1 ? 'yes' : 'no or duplicate'}`);

    if (matchingRoutes.length !== 1) {
      throw new Error(`Expected exactly one existing E04 route, found ${matchingRoutes.length}; no write performed.`);
    }

    const routeId = matchingRoutes[0]._id;
    const beforeUpdate = await BusRoute.findById(routeId).lean();
    if (!beforeUpdate || beforeUpdate.routeNumber !== 'E04') {
      throw new Error('Could not load the existing E04 document; no write performed.');
    }

    const updateResult = await BusRoute.updateOne(
      { _id: routeId, routeNumber: 'E04' },
      {
        $set: {
          'inbound.stops': stops,
          'inbound.geometry': geometry,
        },
      },
      { runValidators: true, timestamps: false }
    );

    if (updateResult.matchedCount !== 1) {
      throw new Error(`Expected to update one E04 route, matched ${updateResult.matchedCount}.`);
    }

    const updatedRoute = await BusRoute.findById(routeId).lean();
    const savedStops = normalizeStops(updatedRoute?.inbound?.stops || []);
    const savedGeometry = updatedRoute?.inbound?.geometry || {};
    const savedCoordinates = savedGeometry.coordinates || [];

    if (
      updatedRoute?.routeNumber !== 'E04' ||
      !isDeepStrictEqual(savedStops, stops) ||
      savedGeometry.type !== 'LineString' ||
      !isDeepStrictEqual(savedCoordinates, geometry.coordinates) ||
      !isDeepStrictEqual(updatedRoute.outbound, beforeUpdate.outbound) ||
      !isDeepStrictEqual(omitInboundPayload(updatedRoute), omitInboundPayload(beforeUpdate))
    ) {
      throw new Error('Post-update verification failed: inbound mismatch or unrelated E04 data changed.');
    }

    console.log('Operation: UPDATE');
    console.log('Route E04 confirmed in MongoDB: yes');
    console.log(`Inbound stops: ${savedStops.length}`);
    console.log(`Geometry type: ${savedGeometry.type}`);
    console.log(`Geometry coordinates: ${savedCoordinates.length}`);
    console.log('Outbound unchanged: yes');
    console.log('Other E04 fields unchanged: yes');
    console.log(`modifiedCount: ${updateResult.modifiedCount}`);
  } finally {
    await mongoose.disconnect();
  }
}

updateE04Inbound().catch((error) => {
  console.error(`E04 inbound update failed: ${error.message}`);
  process.exitCode = 1;
});
