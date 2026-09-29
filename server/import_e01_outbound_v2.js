import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import BusRoute from './src/models/BusRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
  console.log('--- Bắt đầu cập nhật dữ liệu E01 Outbound V2 vào MongoDB Atlas ---');

  // 1. Đọc dữ liệu từ e01_outbound_final_data_v2.json
  const dataPath = path.join(__dirname, 'e01_outbound_final_data_v2.json');
  const importData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log('Đã đọc dữ liệu từ file:', dataPath);

  // 2. Kết nối MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Đã kết nối MongoDB Atlas thành công.');

  const targetId = '6a885a28e30ecf6237b77502';

  // 3. Tìm document E01
  let existingRoute = await BusRoute.findById(targetId);
  if (!existingRoute) {
    // Thử tìm theo routeNumber nếu id khác
    existingRoute = await BusRoute.findOne({ routeNumber: 'E01' });
    if (!existingRoute) {
      throw new Error(`Không tìm thấy document E01 với _id: ${targetId} hoặc routeNumber: E01`);
    }
    console.log(`Tìm thấy E01 theo routeNumber (ID thực tế: ${existingRoute._id})`);
  } else {
    console.log(`Tìm thấy chính xác document E01 với ID: ${existingRoute._id}`);
  }

  // 4. Update chỉ outbound.stops và outbound.geometry
  const updateResult = await BusRoute.updateOne(
    { _id: existingRoute._id },
    {
      $set: {
        'outbound.stops': importData.outbound.stops,
        'outbound.geometry': importData.outbound.geometry,
      },
    }
  );

  console.log('\n=== KẾT QUẢ UPDATE ===');
  console.log(`matchedCount: ${updateResult.matchedCount}`);
  console.log(`modifiedCount: ${updateResult.modifiedCount}`);

  // 5. Query lại chính document đó để validate
  const reloaded = await BusRoute.findById(existingRoute._id).lean();

  const stops = reloaded.outbound?.stops || [];
  const geometry = reloaded.outbound?.geometry || {};
  const coords = geometry.coordinates || [];

  const checks = {
    idMatches: reloaded._id.toString() === existingRoute._id.toString(),
    stopsCount: stops.length === 34,
    orderSequential: stops.every((s, i) => s.order === i + 1),
    stopsLatLngValid: stops.every(
      (s) =>
        typeof s.lat === 'number' &&
        !isNaN(s.lat) &&
        s.lat !== null &&
        typeof s.lng === 'number' &&
        !isNaN(s.lng) &&
        s.lng !== null
    ),
    geomType: geometry.type === 'LineString',
    geomPointsCount: coords.length === 689,
    geomFormat: coords.every(
      (c) =>
        Array.isArray(c) &&
        c.length === 2 &&
        typeof c[0] === 'number' &&
        !isNaN(c[0]) &&
        typeof c[1] === 'number' &&
        !isNaN(c[1]) &&
        c[0] >= 105 &&
        c[0] <= 106 &&
        c[1] >= 20 &&
        c[1] <= 22
    ),
  };

  const allPassed = Object.values(checks).every(Boolean);

  console.log('\n=== KẾT QUẢ VALIDATION ===');
  console.log(`- _id đúng: ${checks.idMatches ? 'PASS' : 'FAIL'} (${reloaded._id})`);
  console.log(`- Số stops: ${stops.length} (${checks.stopsCount ? 'PASS - đúng 34' : 'FAIL'})`);
  console.log(`- Order 1 -> 34: ${checks.orderSequential ? 'PASS' : 'FAIL'}`);
  console.log(`- Tất cả lat/lng là số hợp lệ: ${checks.stopsLatLngValid ? 'PASS' : 'FAIL'}`);
  console.log(`- Geometry type: "${geometry.type}" (${checks.geomType ? 'PASS - LineString' : 'FAIL'})`);
  console.log(`- Số geometry coordinates: ${coords.length} (${checks.geomPointsCount ? 'PASS - đúng 689' : 'FAIL'})`);
  console.log(`- Tất cả coordinate dạng [lng, lat]: ${checks.geomFormat ? 'PASS' : 'FAIL'}`);

  console.log('\n=== TỔNG KẾT ===');
  console.log(`matchedCount: ${updateResult.matchedCount}`);
  console.log(`modifiedCount: ${updateResult.modifiedCount}`);
  console.log(`số stops: ${stops.length}`);
  console.log(`số geometry coordinates: ${coords.length}`);
  console.log(`geometry type: ${geometry.type}`);
  console.log(`validation: ${allPassed ? 'PASS' : 'FAIL'}`);

  // Kiểm tra giữ nguyên các field khác
  console.log('\n=== KIỂM TRA TRƯỜNG DỮ LIỆU KHÁC (GIỮ NGUYÊN) ===');
  console.log(`- routeNumber: ${reloaded.routeNumber}`);
  console.log(`- name: ${reloaded.name}`);
  console.log(`- outbound.start: ${reloaded.outbound?.start}`);
  console.log(`- outbound.end: ${reloaded.outbound?.end}`);
  console.log(`- inbound.stops: ${reloaded.inbound?.stops?.length} stops`);
  console.log(`- fare: ${reloaded.fare || reloaded.ticketPrice || 'N/A'}`);
  console.log(`- operatingHours:`, reloaded.operatingHours);

  await mongoose.disconnect();
  console.log('\nĐã ngắt kết nối MongoDB.');
}

run().catch((err) => {
  console.error('Lỗi:', err.message);
  process.exit(1);
});
