import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import BusRoute from './src/models/BusRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const route = await BusRoute.findOne({ routeNumber: 'E11' }).lean();
  console.log('=== ROUTE E11 IN MONGODB ===');
  console.log('Route _id:', route?._id);
  console.log('Route name:', route?.name);
  console.log('\n--- OUTBOUND ---');
  console.log('outbound.start:', route?.outbound?.start);
  console.log('outbound.end:', route?.outbound?.end);
  console.log('outbound.stops length:', route?.outbound?.stops?.length);
  console.log('outbound.geometry exists:', !!route?.outbound?.geometry);
  console.log('outbound.geometry type:', route?.outbound?.geometry?.type);
  console.log('outbound.geometry coords length:', route?.outbound?.geometry?.coordinates?.length);
  console.log('Stop đầu:', route?.outbound?.stops?.[0]?.name);
  console.log('Stop cuối:', route?.outbound?.stops?.[route?.outbound?.stops?.length - 1]?.name);

  console.log('\n--- INBOUND ---');
  console.log('inbound.start:', route?.inbound?.start);
  console.log('inbound.end:', route?.inbound?.end);
  console.log('inbound.stops length:', route?.inbound?.stops?.length);
  console.log('inbound.geometry exists:', !!route?.inbound?.geometry);
  console.log('inbound.geometry type:', route?.inbound?.geometry?.type);
  console.log('inbound.geometry coords length:', route?.inbound?.geometry?.coordinates?.length);

  await mongoose.disconnect();
}

check().catch(console.error);

