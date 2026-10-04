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

async function updateE04Outbound() {
  const dataPath = path.join(__dirname, 'test_e04_osrm_outbound.json');
  const importData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const stops = importData.stops;
  const geometry = importData.geometry;

  if (
    importData.route !== 'E04' ||
    importData.direction !== 'outbound' ||
    importData.inputStopCount !== 45 ||
    importData.waypointCount !== 45 ||
    importData.legCount !== 44 ||
    importData.waypointOrderMatchesInput !== true ||
    importData.reorderedWaypoints?.length !== 0
  ) {
    throw new Error('Input file is not the validated 45-stop E04 outbound OSRM result.');
  }

  if (
    !Array.isArray(stops) ||
    stops.length !== 45 ||
    !stops.every(
      (stop, index) =>
        stop.order === index + 1 &&
        typeof stop.name === 'string' &&
        Number.isFinite(stop.lat) &&
        Number.isFinite(stop.lng)
    ) ||
    stops[0].name !== 'Điểm đỗ xe buýt Smart City (Đầu bến)' ||
    stops[44].name !== 'Vincom Long Biên'
  ) {
    throw new Error('Outbound stops do not match the expected 45-stop E04 sequence.');
  }

  if (
    geometry?.type !== 'LineString' ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length !== 850 ||
    !geometry.coordinates.every(
      (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length === 2 &&
        coordinate.every(Number.isFinite)
    )
  ) {
    throw new Error('Outbound geometry must be a valid LineString with 850 [lng, lat] coordinates.');
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

    const unaffectedRouteSnapshots = await BusRoute.find({
      routeNumber: { $in: ['E01', 'E02', 'E03'] },
    })
      .select('_id routeNumber updatedAt')
      .lean();

    const updateResult = await BusRoute.updateOne(
      { _id: routeId, routeNumber: 'E04' },
      {
        $set: {
          'outbound.stops': stops,
          'outbound.geometry': geometry,
        },
      },
      { runValidators: true, timestamps: false }
    );

    if (updateResult.matchedCount !== 1) {
      throw new Error(`Expected to update one E04 route, matched ${updateResult.matchedCount}.`);
    }

    const updatedRoute = await BusRoute.findById(routeId).lean();
    const savedStops = normalizeStops(updatedRoute?.outbound?.stops || []);
    const savedGeometry = updatedRoute?.outbound?.geometry || {};
    const savedCoordinates = savedGeometry.coordinates || [];
    const routesAfterUpdate = await BusRoute.find({
      routeNumber: { $in: ['E01', 'E02', 'E03'] },
    })
      .select('_id routeNumber updatedAt')
      .lean();

    if (
      updatedRoute?.routeNumber !== 'E04' ||
      !isDeepStrictEqual(savedStops, stops) ||
      savedGeometry.type !== 'LineString' ||
      !isDeepStrictEqual(savedCoordinates, geometry.coordinates) ||
      !isDeepStrictEqual(updatedRoute.inbound, beforeUpdate.inbound) ||
      !isDeepStrictEqual(omitOutboundPayload(updatedRoute), omitOutboundPayload(beforeUpdate)) ||
      !isDeepStrictEqual(routesAfterUpdate, unaffectedRouteSnapshots)
    ) {
      throw new Error('Post-update verification failed: payload mismatch or unrelated route data changed.');
    }

    console.log('Operation: UPDATE');
    console.log('Route E04 confirmed in MongoDB: yes');
    console.log(`Outbound stops: ${savedStops.length}`);
    console.log(`Geometry type: ${savedGeometry.type}`);
    console.log(`Geometry coordinates: ${savedCoordinates.length}`);
    console.log('Inbound unchanged: yes');
    console.log('E01, E02, E03 unchanged: yes');
    console.log('Other E04 fields unchanged: yes');
    console.log(`modifiedCount: ${updateResult.modifiedCount}`);
  } finally {
    await mongoose.disconnect();
  }
}

updateE04Outbound().catch((error) => {
  console.error(`E04 outbound update failed: ${error.message}`);
  process.exitCode = 1;
});
