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
  stops.map(({ name, order, lat, lng }) => ({ name: name.trim(), order, lat, lng }));

async function update21BOutbound() {
  const resultPath = path.join(__dirname, 'test_21b_osrm_outbound.json');
  const inputPath = path.join(__dirname, '21b_outbound_coordinates.json');
  const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
  const inputStops = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const stops = result.stops;
  const geometry = result.geometry;

  if (
    result.route !== '21B' ||
    result.direction !== 'outbound' ||
    result.inputStopCount !== 40 ||
    result.waypointCount !== 40 ||
    result.legCount !== 39 ||
    result.waypointOrderMatchesInput !== true ||
    result.reorderedWaypoints?.length !== 0
  ) {
    throw new Error('Input file is not the validated 40-stop route 21B outbound OSRM result.');
  }

  if (
    !Array.isArray(inputStops) ||
    inputStops.length !== 40 ||
    !Array.isArray(stops) ||
    stops.length !== 40 ||
    !stops.every(
      (stop, index) =>
        stop.order === index + 1 &&
        typeof stop.name === 'string' &&
        Number.isFinite(stop.lat) &&
        Number.isFinite(stop.lng)
    ) ||
    !isDeepStrictEqual(normalizeStops(stops), normalizeStops(inputStops)) ||
    stops[0].name !== '(A) UBND xã Duyên Thái' ||
    stops[39].name !== '(B) BX Mỹ Đình'
  ) {
    throw new Error('OSRM result stops do not exactly match the 40-stop input file.');
  }

  if (
    geometry?.type !== 'LineString' ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length !== 742 ||
    !geometry.coordinates.every(
      (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length === 2 &&
        coordinate.every(Number.isFinite)
    )
  ) {
    throw new Error('Outbound geometry must be a valid LineString with 742 [lng, lat] coordinates.');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured.');
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected successfully.');

  try {
    const matchingRoutes = await BusRoute.find({ routeNumber: '21B' }).select('_id').lean();
    console.log(`Route 21B exists: ${matchingRoutes.length === 1 ? 'yes' : 'no or duplicate'}`);

    if (matchingRoutes.length !== 1) {
      throw new Error(`Expected exactly one existing route 21B, found ${matchingRoutes.length}; no write performed.`);
    }

    const routeId = matchingRoutes[0]._id;
    const beforeUpdate = await BusRoute.findById(routeId).lean();
    if (!beforeUpdate || beforeUpdate.routeNumber !== '21B') {
      throw new Error('Could not load the existing route 21B document; no write performed.');
    }

    const otherRoutes = ['08A', '08B', '09A', '09B', '19', '21A', '37', '43', '125', 'E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'E07', 'E08', 'E09', 'E10', 'E11'];
    const unaffectedRouteSnapshots = await BusRoute.find({
      routeNumber: { $in: otherRoutes },
    })
      .select('_id routeNumber updatedAt')
      .lean();

    const updateResult = await BusRoute.updateOne(
      { _id: routeId, routeNumber: '21B' },
      {
        $set: {
          'outbound.stops': stops,
          'outbound.geometry': geometry,
        },
      },
      { runValidators: true, timestamps: false }
    );

    if (updateResult.matchedCount !== 1) {
      throw new Error(`Expected to update one route 21B, matched ${updateResult.matchedCount}.`);
    }

    const updatedRoute = await BusRoute.findById(routeId).lean();
    const savedStops = normalizeStops(updatedRoute?.outbound?.stops || []);
    const savedGeometry = updatedRoute?.outbound?.geometry || {};
    const savedCoordinates = savedGeometry.coordinates || [];
    const routesAfterUpdate = await BusRoute.find({
      routeNumber: { $in: otherRoutes },
    })
      .select('_id routeNumber updatedAt')
      .lean();

    if (
      updatedRoute?.routeNumber !== '21B' ||
      savedStops.length !== 40 ||
      !isDeepStrictEqual(savedStops, normalizeStops(inputStops)) ||
      savedGeometry.type !== 'LineString' ||
      !Array.isArray(savedCoordinates) ||
      savedCoordinates.length === 0 ||
      !isDeepStrictEqual(savedCoordinates, geometry.coordinates) ||
      savedStops[0].name !== '(A) UBND xã Duyên Thái' ||
      savedStops[savedStops.length - 1].name !== '(B) BX Mỹ Đình' ||
      !isDeepStrictEqual(updatedRoute.inbound, beforeUpdate.inbound) ||
      !isDeepStrictEqual(omitOutboundPayload(updatedRoute), omitOutboundPayload(beforeUpdate)) ||
      !isDeepStrictEqual(routesAfterUpdate, unaffectedRouteSnapshots)
    ) {
      throw new Error('Post-update verification failed: payload mismatch or unrelated route data changed.');
    }

    console.log('=== KẾT QUẢ IMPORT VÀ VERIFY ROUTE 21B OUTBOUND ===');
    console.log('Operation: UPDATE');
    console.log('Route 21B confirmed in MongoDB: yes');
    console.log(`Outbound stops length: ${savedStops.length} (matched === 40: ${savedStops.length === 40})`);
    console.log(`Outbound geometry type: ${savedGeometry.type} (matched === "LineString": ${savedGeometry.type === 'LineString'})`);
    console.log(`Outbound geometry coordinates count: ${savedCoordinates.length} (coordinates count matched: ${savedCoordinates.length === 742})`);
    console.log(`Stop đầu (First stop): ${savedStops[0].name}`);
    console.log(`Stop cuối (Last stop): ${savedStops[savedStops.length - 1].name}`);
    console.log('Inbound unchanged: yes');
    console.log('Other routes unchanged: yes');
    console.log('Other route 21B fields unchanged: yes');
    console.log(`matchedCount: ${updateResult.matchedCount}`);
    console.log(`modifiedCount: ${updateResult.modifiedCount}`);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

update21BOutbound().catch((error) => {
  console.error(`Route 21B outbound update failed: ${error.message}`);
  process.exitCode = 1;
});

