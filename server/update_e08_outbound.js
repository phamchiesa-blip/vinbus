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

const omitOutboundPayload = (route) => {
  const { outbound, ...otherFields } = route;
  if (!outbound) return { ...otherFields, outbound };

  const { stops, geometry, ...outboundFields } = outbound;
  return { ...otherFields, outbound: { ...outboundFields } };
};

const normalizeStops = (stops) =>
  stops.map(({ name, order, lat, lng }) => ({ name, order, lat, lng }));

async function updateE08Outbound() {
  const resultPath = path.join(__dirname, 'test_e08_osrm_outbound.json');
  const inputPath = path.join(__dirname, 'e08_outbound_coordinates.json');
  const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
  const inputStops = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const stops = result.stops;
  const geometry = result.geometry;

  if (
    result.route !== 'E08' ||
    result.direction !== 'outbound' ||
    result.inputStopCount !== 33 ||
    result.waypointCount !== 33 ||
    result.legCount !== 32 ||
    result.waypointOrderMatchesInput !== true ||
    result.reorderedWaypoints?.length !== 0
  ) {
    throw new Error('Input file is not the validated 33-stop E08 outbound OSRM result.');
  }

  if (
    !Array.isArray(inputStops) ||
    inputStops.length !== 33 ||
    !Array.isArray(stops) ||
    stops.length !== 33 ||
    !stops.every(
      (stop, index) =>
        stop.order === index + 1 &&
        typeof stop.name === 'string' &&
        Number.isFinite(stop.lat) &&
        Number.isFinite(stop.lng)
    ) ||
    !isDeepStrictEqual(normalizeStops(stops), inputStops) ||
    stops[0].name !== 'Điểm Đỗ Xe Buýt Nam Thăng Long' ||
    stops[32].name !== 'KĐT Times City'
  ) {
    throw new Error('OSRM result stops do not exactly match the 33-stop input file.');
  }

  if (
    geometry?.type !== 'LineString' ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length !== 619 ||
    !geometry.coordinates.every(
      (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length === 2 &&
        coordinate.every(Number.isFinite)
    )
  ) {
    throw new Error('Outbound geometry must be a valid LineString with 619 [lng, lat] coordinates.');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured.');
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected successfully.');

  try {
    const matchingRoutes = await BusRoute.find({ routeNumber: 'E08' }).select('_id').lean();
    console.log(`Route E08 exists: ${matchingRoutes.length === 1 ? 'yes' : 'no or duplicate'}`);

    if (matchingRoutes.length !== 1) {
      throw new Error(`Expected exactly one existing E08 route, found ${matchingRoutes.length}; no write performed.`);
    }

    const routeId = matchingRoutes[0]._id;
    const beforeUpdate = await BusRoute.findById(routeId).lean();
    if (!beforeUpdate || beforeUpdate.routeNumber !== 'E08') {
      throw new Error('Could not load the existing E08 document; no write performed.');
    }

    const unaffectedRouteSnapshots = await BusRoute.find({
      routeNumber: { $in: ['E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'E07'] },
    })
      .select('_id routeNumber updatedAt')
      .lean();

    const updateResult = await BusRoute.updateOne(
      { _id: routeId, routeNumber: 'E08' },
      {
        $set: {
          'outbound.stops': stops,
          'outbound.geometry': geometry,
        },
      },
      { runValidators: true, timestamps: false }
    );

    if (updateResult.matchedCount !== 1) {
      throw new Error(`Expected to update one E08 route, matched ${updateResult.matchedCount}.`);
    }

    const updatedRoute = await BusRoute.findById(routeId).lean();
    const savedStops = normalizeStops(updatedRoute?.outbound?.stops || []);
    const savedGeometry = updatedRoute?.outbound?.geometry || {};
    const savedCoordinates = savedGeometry.coordinates || [];
    const routesAfterUpdate = await BusRoute.find({
      routeNumber: { $in: ['E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'E07'] },
    })
      .select('_id routeNumber updatedAt')
      .lean();

    if (
      updatedRoute?.routeNumber !== 'E08' ||
      savedStops.length !== 33 ||
      !isDeepStrictEqual(savedStops, inputStops) ||
      savedGeometry.type !== 'LineString' ||
      !Array.isArray(savedCoordinates) ||
      savedCoordinates.length === 0 ||
      !isDeepStrictEqual(savedCoordinates, geometry.coordinates) ||
      savedStops[0].name !== 'Điểm Đỗ Xe Buýt Nam Thăng Long' ||
      savedStops[savedStops.length - 1].name !== 'KĐT Times City' ||
      !isDeepStrictEqual(updatedRoute.inbound, beforeUpdate.inbound) ||
      !isDeepStrictEqual(omitOutboundPayload(updatedRoute), omitOutboundPayload(beforeUpdate)) ||
      !isDeepStrictEqual(routesAfterUpdate, unaffectedRouteSnapshots)
    ) {
      throw new Error('Post-update verification failed: payload mismatch or unrelated route data changed.');
    }

    console.log('=== KẾT QUẢ IMPORT VÀ VERIFY E08 OUTBOUND ===');
    console.log('Operation: UPDATE');
    console.log('Route E08 confirmed in MongoDB: yes');
    console.log(`Outbound stops length: ${savedStops.length} (matched === 33: ${savedStops.length === 33})`);
    console.log(`Outbound geometry type: ${savedGeometry.type} (matched === "LineString": ${savedGeometry.type === 'LineString'})`);
    console.log(`Outbound geometry coordinates count: ${savedCoordinates.length} (coordinates exist: ${savedCoordinates.length > 0})`);
    console.log(`Stop đầu (First stop): ${savedStops[0].name}`);
    console.log(`Stop cuối (Last stop): ${savedStops[savedStops.length - 1].name}`);
    console.log('Inbound unchanged: yes');
    console.log('E01 - E07 unchanged: yes');
    console.log('Other E08 fields unchanged: yes');
    console.log(`matchedCount: ${updateResult.matchedCount}`);
    console.log(`modifiedCount: ${updateResult.modifiedCount}`);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

updateE08Outbound().catch((error) => {
  console.error(`E08 outbound update failed: ${error.message}`);
  process.exitCode = 1;
});

