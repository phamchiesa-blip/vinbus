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
  console.log('--- Bắt đầu import dữ liệu E01 Inbound V2 vào MongoDB Atlas ---');

  // 1. Đọc dữ liệu từ file inbound và outbound final v2
  const inboundPath = path.join(__dirname, 'e01_inbound_final_data_v2.json');
  const outboundPath = path.join(__dirname, 'e01_outbound_final_data_v2.json');

  const inboundData = JSON.parse(fs.readFileSync(inboundPath, 'utf-8'));
  const outboundData = JSON.parse(fs.readFileSync(outboundPath, 'utf-8'));

  console.log('Đã đọc dữ liệu inbound từ:', inboundPath);
  console.log('Đã đọc dữ liệu outbound từ:', outboundPath);

  // 2. Kết nối MongoDB Atlas
  console.log('Đang kết nối MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 25000,
  });
  console.log('Kết nối MongoDB Atlas thành công!');

  // 3. Tìm document E01
  const existingRoute = await BusRoute.findOne({ routeNumber: 'E01' });
  if (!existingRoute) {
    throw new Error('Không tìm thấy document E01 trong MongoDB Atlas!');
  }
  console.log(`Tìm thấy tuyến: [${existingRoute.routeNumber}] ${existingRoute.name} (ID: ${existingRoute._id})`);

  // 4. Chuẩn bị update data
  const updateFields = {
    'inbound.stops': inboundData.inbound.stops,
    'inbound.geometry': inboundData.inbound.geometry,
  };

  // Đảm bảo dữ liệu outbound luôn toàn vẹn và khớp đúng chuẩn 34 stops & 689 points
  const currentOutboundCoords = existingRoute.outbound?.geometry?.coordinates?.length || 0;
  const currentOutboundStops = existingRoute.outbound?.stops?.length || 0;

  if (currentOutboundCoords !== 689 || currentOutboundStops !== 34) {
    console.log(`Phát hiện outbound cần đồng bộ chuẩn hóa (hiện tại: ${currentOutboundStops} stops, ${currentOutboundCoords} coords). Đang phục hồi từ outbound_final_data_v2...`);
    updateFields['outbound.stops'] = outboundData.outbound.stops;
    updateFields['outbound.geometry'] = outboundData.outbound.geometry;
  }

  // 5. Cập nhật document E01
  const updateResult = await BusRoute.updateOne(
    { _id: existingRoute._id },
    { $set: updateFields }
  );

  console.log('\n=== KẾT QUẢ UPDATE MONGODB ===');
  console.log(`matchedCount: ${updateResult.matchedCount}`);
  console.log(`modifiedCount: ${updateResult.modifiedCount}`);

  // 6. Query lại chính document để kiểm tra (validation)
  const reloaded = await BusRoute.findById(existingRoute._id).lean();

  const inStops = reloaded.inbound?.stops || [];
  const inGeom = reloaded.inbound?.geometry || {};
  const inCoords = inGeom.coordinates || [];

  const outStops = reloaded.outbound?.stops || [];
  const outGeom = reloaded.outbound?.geometry || {};
  const outCoords = outGeom.coordinates || [];

  const validation = {
    // Inbound checks
    inboundStopsCount: inStops.length === 34,
    inboundOrderSeq: inStops.every((s, i) => s.order === i + 1),
    inboundLatLngValid: inStops.every(
      (s) =>
        typeof s.lat === 'number' &&
        !isNaN(s.lat) &&
        s.lat !== null &&
        typeof s.lng === 'number' &&
        !isNaN(s.lng) &&
        s.lng !== null
    ),
    inboundGeomType: inGeom.type === 'LineString',
    inboundGeomPointsCount: inCoords.length === 779,
    inboundCoordsFormat: inCoords.every(
      (c) =>
        Array.isArray(c) &&
        c.length === 2 &&
        typeof c[0] === 'number' &&
        typeof c[1] === 'number' &&
        c[0] >= 105 &&
        c[0] <= 106 &&
        c[1] >= 20 &&
        c[1] <= 22
    ),

    // Outbound preserved checks
    outboundStopsCount: outStops.length === 34,
    outboundOrderSeq: outStops.every((s, i) => s.order === i + 1),
    outboundLatLngValid: outStops.every(
      (s) =>
        typeof s.lat === 'number' &&
        !isNaN(s.lat) &&
        s.lat !== null &&
        typeof s.lng === 'number' &&
        !isNaN(s.lng) &&
        s.lng !== null
    ),
    outboundGeomType: outGeom.type === 'LineString',
    outboundGeomPointsCount: outCoords.length === 689,
    outboundCoordsFormat: outCoords.every(
      (c) =>
        Array.isArray(c) &&
        c.length === 2 &&
        typeof c[0] === 'number' &&
        typeof c[1] === 'number' &&
        c[0] >= 105 &&
        c[0] <= 106 &&
        c[1] >= 20 &&
        c[1] <= 22
    ),
  };

  console.log('\n=== KẾT QUẢ VALIDATION CHI TIẾT ===');
  console.log(`[INBOUND] Số điểm dừng (stops): ${inStops.length} (${validation.inboundStopsCount ? 'PASS - đúng 34' : 'FAIL'})`);
  console.log(`[INBOUND] Thứ tự (order 1 -> 34): ${validation.inboundOrderSeq ? 'PASS' : 'FAIL'}`);
  console.log(`[INBOUND] Tính hợp lệ lat/lng: ${validation.inboundLatLngValid ? 'PASS' : 'FAIL'}`);
  console.log(`[INBOUND] Geometry type: "${inGeom.type}" (${validation.inboundGeomType ? 'PASS - LineString' : 'FAIL'})`);
  console.log(`[INBOUND] Geometry coordinates: ${inCoords.length} (${validation.inboundGeomPointsCount ? 'PASS - đúng 779' : 'FAIL'})`);
  console.log(`[INBOUND] Coordinate format [lng, lat]: ${validation.inboundCoordsFormat ? 'PASS' : 'FAIL'}`);

  console.log('\n=== KIỂM TRA BẢO TOÀN DỮ LIỆU OUTBOUND ===');
  console.log(`[OUTBOUND] Số điểm dừng (stops): ${outStops.length} (${validation.outboundStopsCount ? 'PASS - đúng 34' : 'FAIL'})`);
  console.log(`[OUTBOUND] Thứ tự (order 1 -> 34): ${validation.outboundOrderSeq ? 'PASS' : 'FAIL'}`);
  console.log(`[OUTBOUND] Tính hợp lệ lat/lng: ${validation.outboundLatLngValid ? 'PASS' : 'FAIL'}`);
  console.log(`[OUTBOUND] Geometry type: "${outGeom.type}" (${validation.outboundGeomType ? 'PASS - LineString' : 'FAIL'})`);
  console.log(`[OUTBOUND] Geometry coordinates: ${outCoords.length} (${validation.outboundGeomPointsCount ? 'PASS - đúng 689' : 'FAIL'})`);
  console.log(`[OUTBOUND] Coordinate format [lng, lat]: ${validation.outboundCoordsFormat ? 'PASS' : 'FAIL'}`);

  const allPassed = Object.values(validation).every(Boolean);
  console.log(`\n=> TỔNG KẾT VALIDATION: ${allPassed ? 'TẤT CẢ ĐẠT (PASS)' : 'KHÔNG ĐẠT (FAIL)'}`);

  await mongoose.disconnect();
  console.log('\nĐã ngắt kết nối MongoDB Atlas.');
}

run().catch((err) => {
  console.error('Lỗi khi import:', err.message);
  process.exit(1);
});
