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

async function update43Inbound() {
  const resultPath = path.join(__dirname, 'test_43_osrm_inbound.json');
  const inputPath = path.join(__dirname, '43_inbound_coordinates.json');
  const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
  const inputStops = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const stops = result.stops;
  const geometry = result.geometry;

  if (
    result.route !== '43' ||
    result.direction !== 'inbound' ||
    result.inputStopCount !== 33 ||
    result.waypointCount !== 33 ||
    result.legCount !== 32 ||
    result.waypointOrderMatchesInput !== true ||
    result.reorderedWaypoints?.length !== 0
  ) {
    throw new Error('Input file is not the validated 33-stop route 43 inbound OSRM result.');
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
    stops[0].name !== '(B) Thị trấn Đông Anh' ||
    stops[32].name !== '(A) Điểm đầu cuối Kim Mã'
  ) {
    throw new Error('OSRM result stops do not exactly match the 33-stop input file.');
  }

  if (
    geometry?.type !== 'LineString' ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length !== 797 ||
    !geometry.coordinates.every(
      (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length === 2 &&
        coordinate.every(Number.isFinite)
    )
  ) {
    throw new Error('Inbound geometry must be a valid LineString with 797 [lng, lat] coordinates.');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured.');
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected successfully.');

  try {
    const matchingRoutes = await BusRoute.find({ routeNumber: '43' }).select('_id').lean();
    console.log(`Route 43 exists: ${matchingRoutes.length === 1 ? 'yes' : 'no or duplicate'}`);

    if (matchingRoutes.length !== 1) {
      throw new Error(`Expected exactly one existing route 43, found ${matchingRoutes.length}; no write performed.`);
    }

    const routeId = matchingRoutes[0]._id;
    const beforeUpdate = await BusRoute.findById(routeId).lean();
    if (!beforeUpdate || beforeUpdate.routeNumber !== '43') {
      throw new Error('Could not load the existing route 43 document; no write performed.');
    }

    const otherRoutes = ['08A', '08B', '09A', '09B', '19', '21A', '21B', '37', '125', 'E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'E07', 'E08', 'E09', 'E10', 'E11'];
    const unaffectedRouteSnapshots = await BusRoute.find({
      routeNumber: { $in: otherRoutes },
    })
      .select('_id routeNumber updatedAt')
      .lean();

    const updateResult = await BusRoute.updateOne(
      { _id: routeId, routeNumber: '43' },
      {
        $set: {
          'inbound.stops': stops,
          'inbound.geometry': geometry,
        },
      },
      { runValidators: true, timestamps: false }
    );

    if (updateResult.matchedCount !== 1) {
      throw new Error(`Expected to update one route 43, matched ${updateResult.matchedCount}.`);
    }

    const updatedRoute = await BusRoute.findById(routeId).lean();
    const savedStops = normalizeStops(updatedRoute?.inbound?.stops || []);
    const savedGeometry = updatedRoute?.inbound?.geometry || {};
    const savedCoordinates = savedGeometry.coordinates || [];
    const routesAfterUpdate = await BusRoute.find({
      routeNumber: { $in: otherRoutes },
    })
      .select('_id routeNumber updatedAt')
      .lean();

    if (
      updatedRoute?.routeNumber !== '43' ||
      savedStops.length !== 33 ||
      !isDeepStrictEqual(savedStops, inputStops) ||
      savedGeometry.type !== 'LineString' ||
      !Array.isArray(savedCoordinates) ||
      savedCoordinates.length === 0 ||
      !isDeepStrictEqual(savedCoordinates, geometry.coordinates) ||
      savedStops[0].name !== '(B) Thị trấn Đông Anh' ||
      savedStops[savedStops.length - 1].name !== '(A) Điểm đầu cuối Kim Mã' ||
      !isDeepStrictEqual(updatedRoute.outbound, beforeUpdate.outbound) ||
      !isDeepStrictEqual(omitInboundPayload(updatedRoute), omitInboundPayload(beforeUpdate)) ||
      !isDeepStrictEqual(routesAfterUpdate, unaffectedRouteSnapshots)
    ) {
      throw new Error('Post-update verification failed: payload mismatch or unrelated route data changed.');
    }

    console.log('=== KẾT QUẢ IMPORT VÀ VERIFY ROUTE 43 INBOUND ===');
    console.log('Operation: UPDATE');
    console.log('Route 43 confirmed in MongoDB: yes');
    console.log(`Inbound stops length: ${savedStops.length} (matched === 33: ${savedStops.length === 33})`);
    console.log(`Inbound geometry type: ${savedGeometry.type} (matched === "LineString": ${savedGeometry.type === 'LineString'})`);
    console.log(`Inbound geometry coordinates count: ${savedCoordinates.length} (coordinates exist: ${savedCoordinates.length > 0})`);
    console.log(`Stop đầu (First stop): ${savedStops[0].name}`);
    console.log(`Stop cuối (Last stop): ${savedStops[savedStops.length - 1].name}`);
    console.log('Outbound unchanged: yes');
    console.log('Other routes unchanged: yes');
    console.log('Other route 43 fields unchanged: yes');
    console.log(`matchedCount: ${updateResult.matchedCount}`);
    console.log(`modifiedCount: ${updateResult.modifiedCount}`);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

update43Inbound().catch((error) => {
  console.error(`Route 43 inbound update failed: ${error.message}`);
  process.exitCode = 1;
});

