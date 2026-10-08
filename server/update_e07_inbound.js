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

async function updateE07Inbound() {
  const resultPath = path.join(__dirname, 'test_e07_osrm_inbound.json');
  const inputPath = path.join(__dirname, 'e07_inbound_coordinates.json');
  const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
  const inputStops = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const stops = result.stops;
  const geometry = result.geometry;

  if (
    result.route !== 'E07' ||
    result.direction !== 'inbound' ||
    result.inputStopCount !== 28 ||
    result.waypointCount !== 28 ||
    result.legCount !== 27 ||
    result.waypointOrderMatchesInput !== true ||
    result.reorderedWaypoints?.length !== 0
  ) {
    throw new Error('Input file is not the validated 28-stop E07 inbound OSRM result.');
  }

  if (
    !Array.isArray(inputStops) ||
    inputStops.length !== 28 ||
    !Array.isArray(stops) ||
    stops.length !== 28 ||
    !stops.every(
      (stop, index) =>
        stop.order === index + 1 &&
        typeof stop.name === 'string' &&
        Number.isFinite(stop.lat) &&
        Number.isFinite(stop.lng)
    ) ||
    !isDeepStrictEqual(normalizeStops(stops), inputStops) ||
    stops[0].name !== 'Điểm đỗ xe buýt Smart City (Đầu bến)' ||
    stops[27].name !== 'Long Biên (Điểm đỗ xe buýt Yên Phụ)'
  ) {
    throw new Error('OSRM result stops do not exactly match the 28-stop input file.');
  }

  if (
    geometry?.type !== 'LineString' ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length !== 628 ||
    !geometry.coordinates.every(
      (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length === 2 &&
        coordinate.every(Number.isFinite)
    )
  ) {
    throw new Error('Inbound geometry must be a valid LineString with 628 [lng, lat] coordinates.');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured.');
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected successfully.');

  try {
    const matchingRoutes = await BusRoute.find({ routeNumber: 'E07' }).select('_id').lean();
    console.log(`Route E07 exists: ${matchingRoutes.length === 1 ? 'yes' : 'no or duplicate'}`);

    if (matchingRoutes.length !== 1) {
      throw new Error(`Expected exactly one existing E07 route, found ${matchingRoutes.length}; no write performed.`);
    }

    const routeId = matchingRoutes[0]._id;
    const beforeUpdate = await BusRoute.findById(routeId).lean();
    if (!beforeUpdate || beforeUpdate.routeNumber !== 'E07') {
      throw new Error('Could not load the existing E07 document; no write performed.');
    }

    const unaffectedRouteSnapshots = await BusRoute.find({
      routeNumber: { $in: ['E01', 'E02', 'E03', 'E04', 'E05', 'E06'] },
    })
      .select('_id routeNumber updatedAt')
      .lean();

    const updateResult = await BusRoute.updateOne(
      { _id: routeId, routeNumber: 'E07' },
      {
        $set: {
          'inbound.stops': stops,
          'inbound.geometry': geometry,
        },
      },
      { runValidators: true, timestamps: false }
    );

    if (updateResult.matchedCount !== 1) {
      throw new Error(`Expected to update one E07 route, matched ${updateResult.matchedCount}.`);
    }

    const updatedRoute = await BusRoute.findById(routeId).lean();
    const savedStops = normalizeStops(updatedRoute?.inbound?.stops || []);
    const savedGeometry = updatedRoute?.inbound?.geometry || {};
    const savedCoordinates = savedGeometry.coordinates || [];
    const routesAfterUpdate = await BusRoute.find({
      routeNumber: { $in: ['E01', 'E02', 'E03', 'E04', 'E05', 'E06'] },
    })
      .select('_id routeNumber updatedAt')
      .lean();

    if (
      updatedRoute?.routeNumber !== 'E07' ||
      savedStops.length !== 28 ||
      !isDeepStrictEqual(savedStops, inputStops) ||
      savedGeometry.type !== 'LineString' ||
      !Array.isArray(savedCoordinates) ||
      savedCoordinates.length === 0 ||
      !isDeepStrictEqual(savedCoordinates, geometry.coordinates) ||
      savedStops[0].name !== 'Điểm đỗ xe buýt Smart City (Đầu bến)' ||
      savedStops[savedStops.length - 1].name !== 'Long Biên (Điểm đỗ xe buýt Yên Phụ)' ||
      !isDeepStrictEqual(updatedRoute.outbound, beforeUpdate.outbound) ||
      !isDeepStrictEqual(omitInboundPayload(updatedRoute), omitInboundPayload(beforeUpdate)) ||
      !isDeepStrictEqual(routesAfterUpdate, unaffectedRouteSnapshots)
    ) {
      throw new Error('Post-update verification failed: payload mismatch or unrelated route data changed.');
    }

    console.log('=== KẾT QUẢ IMPORT VÀ VERIFY E07 INBOUND ===');
    console.log('Operation: UPDATE');
    console.log('Route E07 confirmed in MongoDB: yes');
    console.log(`Inbound stops length: ${savedStops.length} (matched === 28: ${savedStops.length === 28})`);
    console.log(`Inbound geometry type: ${savedGeometry.type} (matched === "LineString": ${savedGeometry.type === 'LineString'})`);
    console.log(`Inbound geometry coordinates count: ${savedCoordinates.length} (coordinates exist: ${savedCoordinates.length > 0})`);
    console.log(`Stop đầu (First stop): ${savedStops[0].name}`);
    console.log(`Stop cuối (Last stop): ${savedStops[savedStops.length - 1].name}`);
    console.log('Outbound unchanged: yes');
    console.log('E01 - E06 unchanged: yes');
    console.log('Other E07 fields unchanged: yes');
    console.log(`matchedCount: ${updateResult.matchedCount}`);
    console.log(`modifiedCount: ${updateResult.modifiedCount}`);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

updateE07Inbound().catch((error) => {
  console.error(`E07 inbound update failed: ${error.message}`);
  process.exitCode = 1;
});

