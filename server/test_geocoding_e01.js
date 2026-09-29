import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import BusRoute from './src/models/BusRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hàm chuẩn hóa tên điểm dừng để geocoding tìm kiếm tốt hơn
function normalizeStopName(rawName) {
  let name = rawName.trim();

  // 1. Tách thông tin trong ngoặc nếu có địa chỉ cụ thể bên trong (vd: "Times City (478 Minh Khai)")
  const parenMatch = name.match(/\((.*?)\)/);
  if (parenMatch) {
    const inside = parenMatch[1];
    // Nếu trong ngoặc có số nhà hoặc phố (vd: "478 Minh Khai")
    if (/\d+/.test(inside) || /phố|đường/i.test(inside)) {
      name = inside;
    }
  }

  // 2. Loại bỏ các tiền tố định tính thường thấy trong tên điểm dừng xe bus
  name = name
    .replace(/^(đối diện|trước|sau|qua|gần|bến trả|điểm đỗ xe)\s+/i, '')
    .replace(/^tòa nhà\s+/i, '')
    .replace(/^nhà\s+/i, '')
    .replace(/^số\s+/i, '')
    .trim();

  // 3. Xử lý các từ viết tắt phổ biến
  name = name
    .replace(/\bKĐT\b/gi, 'Khu đô thị')
    .replace(/\bUBND\b/gi, 'Ủy ban nhân dân')
    .replace(/\bTHPT\b/gi, 'Trường THPT')
    .replace(/\bKTX\b/gi, 'Ký túc xá')
    .replace(/\bPKKQ\b/gi, 'Phòng không Không quân')
    .replace(/\bOCP\b/gi, 'Ocean Park')
    .replace(/\bBX\b/gi, 'Bến xe')
    .trim();

  return `${name}, Hà Nội, Việt Nam`;
}

// Hàm gửi request tới Nominatim kèm User-Agent hợp lệ
async function geocodeNominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=vn`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'VinBus-Student-Test-Script/1.0 (academic-testing; contact@student-test.vn)',
      'Accept-Language': 'vi,en',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const data = await response.json();
  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  }

  return null;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('--- Bắt đầu thử nghiệm Geocoding cho tuyến E01 ---');
  
  await mongoose.connect(process.env.MONGODB_URI);
  const route = await BusRoute.findOne({ routeNumber: 'E01' });

  if (!route) {
    console.error('Không tìm thấy tuyến E01 trong MongoDB!');
    await mongoose.disconnect();
    return;
  }

  const stops = route.outbound?.stops || [];
  console.log(`Đã đọc ${stops.length} điểm dừng chiều đi (Outbound) của tuyến E01.\n`);

  const results = [];
  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    const normalized = normalizeStopName(stop.name);

    process.stdout.write(`[${i + 1}/${stops.length}] Đang xử lý: "${stop.name}" -> Query: "${normalized}"... `);

    let geoResult = null;
    let errorMsg = null;

    try {
      geoResult = await geocodeNominatim(normalized);

      // Nếu không tìm thấy bằng chuỗi đã chuẩn hóa, thử query thô hoặc query tinh giản
      if (!geoResult && normalized.includes(',')) {
        // Thử bỏ bớt phần chi tiết số nhà/ngõ phức tạp, chỉ lấy tên phố/địa danh chính
        const simplified = stop.name
          .replace(/^(đối diện|trước|sau|qua|gần)\s+/i, '')
          .replace(/-.*$/, '') // bỏ phần sau dấu gạch ngang nếu có
          .trim();
        const fallbackQuery = `${simplified}, Hà Nội, Việt Nam`;
        await sleep(1100);
        geoResult = await geocodeNominatim(fallbackQuery);
      }
    } catch (err) {
      errorMsg = err.message;
    }

    if (geoResult) {
      successCount++;
      console.log(`THÀNH CÔNG (${geoResult.lat.toFixed(5)}, ${geoResult.lng.toFixed(5)})`);
      results.push({
        name: stop.name,
        order: stop.order,
        queryUsed: normalized,
        success: true,
        lat: geoResult.lat,
        lng: geoResult.lng,
        matchedName: geoResult.displayName,
      });
    } else {
      failedCount++;
      console.log(`THẤT BẠI ${errorMsg ? `(Lỗi: ${errorMsg})` : '(Không có kết quả)'}`);
      results.push({
        name: stop.name,
        order: stop.order,
        queryUsed: normalized,
        success: false,
        lat: null,
        lng: null,
        error: errorMsg || 'Không tìm thấy tọa độ phù hợp trên OSM Nominatim',
      });
    }

    // Rate limit 1.1s tuân thủ chính sách của Nominatim
    await sleep(1100);
  }

  await mongoose.disconnect();

  const outputPath = path.join(__dirname, 'test_e01_geocoding.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        routeNumber: route.routeNumber,
        routeName: route.name,
        direction: 'outbound',
        totalStops: stops.length,
        successCount,
        failedCount,
        successRate: `${((successCount / stops.length) * 100).toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        stops: results,
      },
      null,
      2
    ),
    'utf-8'
  );

  console.log('\n=======================================');
  console.log(`Hoàn thành! Đã xuất kết quả ra: ${outputPath}`);
  console.log(`Tổng số stops: ${stops.length}`);
  console.log(`Tìm được: ${successCount}`);
  console.log(`Không tìm được: ${failedCount}`);
  console.log(`Tỷ lệ thành công: ${((successCount / stops.length) * 100).toFixed(1)}%`);
  console.log('=======================================');
}

run().catch((err) => {
  console.error('Lỗi khi chạy script:', err);
  process.exit(1);
});
