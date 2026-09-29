import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import BusRoute from './src/models/BusRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('--- Bắt đầu import dữ liệu E01 Outbound vào MongoDB Atlas ---');

  // 1. Đọc dữ liệu từ e01_outbound_final_data.json
  const dataPath = path.join(__dirname, 'e01_outbound_final_data.json');
  const importData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log('Đã đọc dữ liệu từ file:', dataPath);

  // 2. Kết nối MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Đã kết nối MongoDB thành công.');

  // 3. Tìm document E01
  const existingRoute = await BusRoute.findOne({ routeNumber: 'E01' });
  if (!existingRoute) {
    throw new Error('Không tìm thấy document E01 trong MongoDB!');
  }
  console.log(`Tìm thấy tuyến: [${existingRoute.routeNumber}] ${existingRoute.name} (ID: ${existingRoute._id})`);

  // 4. Cập nhật chỉ outbound.stops và outbound.geometry
  const updateResult = await BusRoute.updateOne(
    { _id: existingRoute._id },
    {
      $set: {
        'outbound.stops': importData.outbound.stops,
        'outbound.geometry': importData.outbound.geometry,
      },
    }
  );

  console.log('Kết quả updateOne:', {
    matchedCount: updateResult.matchedCount,
    modifiedCount: updateResult.modifiedCount,
    acknowledged: updateResult.acknowledged,
  });

  // 5. Đọc lại document từ MongoDB để kiểm định
  const updatedRoute = await BusRoute.findById(existingRoute._id);

  console.log('\n=== KẾT QUẢ VALIDATION SAU KHI IMPORT ===');
  
  // Kiểm tra 1: Số stops
  const stops = updatedRoute.outbound?.stops || [];
  console.log(`1. outbound.stops.length: ${stops.length} ${stops.length === 34 ? '(VALID - đúng 34)' : '(INVALID)'}`);

  // Kiểm tra 2: Thứ tự 1 -> 34
  let isSequential = true;
  for (let i = 0; i < stops.length; i++) {
    if (stops[i].order !== i + 1) {
      isSequential = false;
      break;
    }
  }
  console.log(`2. Thứ tự order 1 -> 34: ${isSequential ? 'VALID' : 'INVALID'}`);

  // Kiểm tra 3: Tọa độ lat/lng
  const hasCoords = stops.every(
    (s) =>
      typeof s.lat === 'number' &&
      !isNaN(s.lat) &&
      typeof s.lng === 'number' &&
      !isNaN(s.lng)
  );
  console.log(`3. Tất cả stops có lat/lng hợp lệ: ${hasCoords ? 'VALID' : 'INVALID'}`);

  // Kiểm tra 4: Geometry type
  const geomType = updatedRoute.outbound?.geometry?.type;
  console.log(`4. outbound.geometry.type: "${geomType}" ${geomType === 'LineString' ? '(VALID)' : '(INVALID)'}`);

  // Kiểm tra 5: Geometry coordinates length
  const coordsLen = updatedRoute.outbound?.geometry?.coordinates?.length || 0;
  console.log(`5. outbound.geometry.coordinates.length: ${coordsLen} ${coordsLen === 844 ? '(VALID - đúng 844)' : '(INVALID)'}`);

  // Kiểm tra tính toàn vẹn của các trường khác
  console.log('\n=== KIỂM TRA TÍNH TOÀN VẸN CÁC FIELD KHÁC ===');
  console.log(`- _id giữ nguyên: ${updatedRoute._id.toString() === existingRoute._id.toString() ? 'ĐÚNG' : 'SAI'}`);
  console.log(`- routeNumber giữ nguyên: ${updatedRoute.routeNumber === 'E01' ? 'ĐÚNG (E01)' : 'SAI'}`);
  console.log(`- name giữ nguyên: ${updatedRoute.name}`);
  console.log(`- outbound.start/end giữ nguyên: ${updatedRoute.outbound.start} -> ${updatedRoute.outbound.end}`);
  console.log(`- inbound.stops giữ nguyên: ${updatedRoute.inbound?.stops?.length} stops`);

  await mongoose.disconnect();
  console.log('\nĐã ngắt kết nối MongoDB. Hoàn tất quá trình import!');
}

run().catch((err) => {
  console.error('Lỗi khi import:', err.message);
  process.exit(1);
});
