import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('--- Bắt đầu chạy Routing OSRM cho E01 Outbound V3 ---');

  // Đọc dataset e01_outbound_coordinates.json (đã cập nhật Stop 13, 17, 19)
  const stopsPath = path.join(__dirname, 'e01_outbound_coordinates.json');
  const stops = JSON.parse(fs.readFileSync(stopsPath, 'utf-8'));
  console.log(`Đã đọc ${stops.length} stops từ ${stopsPath}`);

  // Chuỗi coordinates lng,lat
  const coordsParam = stops.map((s) => `${s.lng},${s.lat}`).join(';');
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=full&geometries=geojson&steps=false&annotations=distance,duration`;

  const startTime = Date.now();
  const response = await fetch(osrmUrl, {
    headers: {
      'User-Agent': 'VinBus-Student-Test/3.0 (academic-testing)',
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
    version: 'v3',
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

  const outputPath = path.join(__dirname, 'test_e01_osrm_v3.json');
  fs.writeFileSync(outputPath, JSON.stringify(resultToSave, null, 2), 'utf-8');
  console.log(`Đã lưu kết quả v3 vào: ${outputPath}`);

  const legs = primaryRoute.legs || [];
  const leg12 = legs[11]; // index 11: Stop 12 -> Stop 13
  const leg16 = legs[15]; // index 15: Stop 16 -> Stop 17
  const leg19 = legs[18]; // index 18: Stop 19 -> Stop 20

  console.log('\n=== KẾT QUẢ ROUTING V3 ===');
  console.log(`1. Tổng distance: ${distanceKm} km`);
  console.log(`2. Tổng duration: ${durationMin} phút`);
  console.log(`3. Distance Leg 12 (Stop 12 -> 13): ${(leg12.distance / 1000).toFixed(2)} km (${Math.round(leg12.distance)} m)`);
  console.log(`4. Distance Leg 16 (Stop 16 -> 17): ${(leg16.distance / 1000).toFixed(2)} km (${Math.round(leg16.distance)} m)`);
  console.log(`5. Distance Leg 19 (Stop 19 -> 20): ${(leg19.distance / 1000).toFixed(2)} km (${Math.round(leg19.distance)} m)`);

  // Phân tích U-turn chi tiết ở 3 chặng này
  // Leg 12:
  console.log('\n=== KIỂM TRA U-TURN Ở 3 LEGS ===');
  console.log(`- Leg 12 ([12] ${stops[11].name} -> [13] ${stops[12].name}): ${(leg12.distance / 1000).toFixed(2)} km`);
  console.log(`- Leg 16 ([16] ${stops[15].name} -> [17] ${stops[16].name}): ${(leg16.distance / 1000).toFixed(2)} km`);
  console.log(`- Leg 19 ([19] ${stops[18].name} -> [20] ${stops[19].name}): ${(leg19.distance / 1000).toFixed(2)} km`);
}

run().catch((err) => {
  console.error('Lỗi OSRM V3:', err.message);
  process.exit(1);
});
