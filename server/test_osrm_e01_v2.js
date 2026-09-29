import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('--- Bắt đầu chạy Routing OSRM cho dataset V2 ---');

  // Đọc dataset V2
  const v2Path = path.join(__dirname, 'e01_outbound_coordinates_v2.json');
  const stops = JSON.parse(fs.readFileSync(v2Path, 'utf-8'));
  console.log(`Đã đọc ${stops.length} stops từ ${v2Path}`);

  // Chuỗi coordinates
  const coordsParam = stops.map((s) => `${s.lng},${s.lat}`).join(';');
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=full&geometries=geojson&steps=false&annotations=distance,duration`;

  const startTime = Date.now();
  const response = await fetch(osrmUrl, {
    headers: {
      'User-Agent': 'VinBus-Student-Test/2.0 (academic-testing)',
    },
  });

  const durationMs = Date.now() - startTime;
  console.log(`Thời gian phản hồi từ OSRM: ${durationMs}ms`);

  if (!response.ok) {
    throw new Error(`OSRM HTTP error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error(`OSRM Routing failed with code: ${data.code}`);
  }

  const primaryRoute = data.routes[0];
  const distanceKm = (primaryRoute.distance / 1000).toFixed(2);
  const durationMin = (primaryRoute.duration / 60).toFixed(1);
  const geomCoords = primaryRoute.geometry.coordinates;

  const resultToSave = {
    route: 'E01',
    direction: 'outbound',
    version: 'v2',
    distance: parseFloat(distanceKm),
    duration: parseFloat(durationMin),
    geometry: {
      type: primaryRoute.geometry.type,
      coordinates: geomCoords,
    },
    waypoints: data.waypoints.map((wp, idx) => ({
      stopOrder: stops[idx].order,
      stopName: stops[idx].name,
      originalLocation: [stops[idx].lng, stops[idx].lat],
      snappedLocation: wp.location,
      distanceToRoad: wp.distance,
      roadName: wp.name,
    })),
  };

  const outputPath = path.join(__dirname, 'test_e01_osrm_v2.json');
  fs.writeFileSync(outputPath, JSON.stringify(resultToSave, null, 2), 'utf-8');
  console.log(`Đã lưu kết quả v2 vào: ${outputPath}`);

  // Kiểm tra 3 chặng cụ thể:
  // Leg 6: Stop 6 -> Stop 7 (index 5)
  // Leg 11: Stop 11 -> Stop 12 (index 10)
  // Leg 12: Stop 12 -> Stop 13 (index 11)
  const legs = primaryRoute.legs || [];

  const leg6_7 = legs[5];
  const leg11_12 = legs[10];
  const leg12_13 = legs[11];

  console.log('\n=== KẾT QUẢ SO SÁNH V1 vs V2 ===');
  console.log(`Distance: V1 = 37.16 km  -->  V2 = ${distanceKm} km (Giảm: ${(37.16 - distanceKm).toFixed(2)} km)`);
  console.log(`Duration: V1 = 67.3 phút -->  V2 = ${durationMin} phút (Giảm: ${(67.3 - durationMin).toFixed(1)} phút)`);
  console.log(`Geometry points: V1 = 1039 points --> V2 = ${geomCoords.length} points`);

  console.log('\n=== CHI TIẾT 3 CHẶNG ĐƯỢC ĐIỀU CHỈNH ===');
  console.log(`1. Stop 6 -> Stop 7:`);
  console.log(`   V1: 2.06 km`);
  console.log(`   V2: ${(leg6_7.distance / 1000).toFixed(2)} km`);
  console.log(`2. Stop 11 -> Stop 12:`);
  console.log(`   V1: 2.49 km`);
  console.log(`   V2: ${(leg11_12.distance / 1000).toFixed(2)} km`);
  console.log(`3. Stop 12 -> Stop 13:`);
  console.log(`   V1: 0.98 km`);
  console.log(`   V2: ${(leg12_13.distance / 1000).toFixed(2)} km`);

  // Kiểm tra toàn bộ các chặng khác xem còn chặng nào bất thường không
  console.log('\n=== KIỂM TRA TOÀN BỘ 33 CHẶNG TRÊN V2 ===');
  let hasAnomaly = false;
  for (let i = 0; i < legs.length; i++) {
    const fromStop = stops[i];
    const toStop = stops[i + 1];
    const dLat = (toStop.lat - fromStop.lat) * (Math.PI / 180);
    const dLng = (toStop.lng - fromStop.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(fromStop.lat * (Math.PI / 180)) *
        Math.cos(toStop.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDistKm = 6371 * c;
    const roadDistKm = legs[i].distance / 1000;
    const ratio = straightDistKm > 0.05 ? roadDistKm / straightDistKm : 1;

    if (ratio > 2.5 && legs[i].distance > 800) {
      hasAnomaly = true;
      console.log(`Chặng [${fromStop.order} -> ${toStop.order}] ${fromStop.name} -> ${toStop.name}: ${roadDistKm.toFixed(2)}km (đường thẳng ${straightDistKm.toFixed(2)}km, tỉ lệ ${ratio.toFixed(1)})`);
    }
  }

  if (!hasAnomaly) {
    console.log('Tất cả các chặng đều bám sát lộ trình đường bộ, không còn đoạn nào bị đi vòng bất thường!');
  }
}

run().catch((err) => {
  console.error('Lỗi OSRM V2:', err.message);
  process.exit(1);
});
