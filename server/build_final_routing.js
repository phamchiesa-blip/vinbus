import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('--- Bắt đầu tạo E01 Outbound Routing FINAL ---');

  // 1. Đọc dataset cơ sở
  const basePath = path.join(__dirname, 'e01_outbound_coordinates.json');
  const baseStops = JSON.parse(fs.readFileSync(basePath, 'utf-8'));
  console.log(`Đã đọc ${baseStops.length} stops từ ${basePath}`);

  // 2. Cập nhật chính xác 6 stops (3 từ V2, 3 từ V3)
  const finalUpdates = {
    6: { lat: 21.00683, lng: 105.790634 },     // V2
    11: { lat: 20.9953045, lng: 105.8091397 }, // V2
    12: { lat: 20.9978745, lng: 105.8129738 }, // V2
    13: { lat: 20.99945, lng: 105.8153 },      // V3
    17: { lat: 20.99898, lng: 105.8354 },      // V3
    19: { lat: 20.99682, lng: 105.8443 },      // V3
  };

  const finalStops = baseStops.map((stop) => {
    if (finalUpdates[stop.order]) {
      return {
        name: stop.name,
        order: stop.order,
        lat: finalUpdates[stop.order].lat,
        lng: finalUpdates[stop.order].lng,
      };
    }
    return { ...stop };
  });

  // Lưu file e01_outbound_coordinates_final.json
  const finalCoordsPath = path.join(__dirname, 'e01_outbound_coordinates_final.json');
  fs.writeFileSync(finalCoordsPath, JSON.stringify(finalStops, null, 2), 'utf-8');
  console.log(`Đã lưu file tọa độ hoàn chỉnh: ${finalCoordsPath}`);

  // Cập nhật đồng bộ luôn file e01_outbound_coordinates.json để người dùng lưu lại nhất quán
  fs.writeFileSync(basePath, JSON.stringify(finalStops, null, 2), 'utf-8');
  console.log(`Đã đồng bộ cập nhật vào file: ${basePath}`);

  // 3. Gửi request OSRM
  console.log('Đang gửi request OSRM cho 34 stops...');
  const coordsParam = finalStops.map((s) => `${s.lng},${s.lat}`).join(';');
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=full&geometries=geojson&steps=false&annotations=distance,duration`;

  const startTime = Date.now();
  const response = await fetch(osrmUrl, {
    headers: {
      'User-Agent': 'VinBus-Student-Final/1.0 (academic-testing)',
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
    version: 'final',
    distance: parseFloat(distanceKm),
    duration: parseFloat(durationMin),
    geometry: {
      type: primaryRoute.geometry.type,
      coordinates: geomCoords,
    },
    waypoints: data.waypoints.map((wp, idx) => ({
      stopOrder: finalStops[idx].order,
      stopName: finalStops[idx].name,
      originalLocation: [finalStops[idx].lng, finalStops[idx].lat],
      snappedLocation: wp.location,
      distanceToRoad: wp.distance,
      roadName: wp.name,
    })),
  };

  const finalResultPath = path.join(__dirname, 'test_e01_osrm_final.json');
  fs.writeFileSync(finalResultPath, JSON.stringify(resultToSave, null, 2), 'utf-8');
  console.log(`Đã lưu kết quả OSRM FINAL vào: ${finalResultPath}`);

  // 4. Phân tích chi tiết các Legs được kiểm tra
  const legs = primaryRoute.legs || [];
  const leg6_7 = legs[5];    // Leg 6: Stop 6 -> 7
  const leg11_12 = legs[10]; // Leg 11: Stop 11 -> 12
  const leg12_13 = legs[11]; // Leg 12: Stop 12 -> 13
  const leg16_17 = legs[15]; // Leg 16: Stop 16 -> 17
  const leg19_20 = legs[18]; // Leg 19: Stop 19 -> 20

  console.log('\n=== KẾT QUẢ ROUTING FINAL ===');
  console.log(`- Tổng distance: ${distanceKm} km`);
  console.log(`- Tổng duration: ${durationMin} phút`);
  console.log(`- Số stop: ${finalStops.length}`);
  console.log(`- Số waypoint: ${data.waypoints.length}`);
  console.log(`- Số điểm trên polyline: ${geomCoords.length} points`);

  console.log('\n=== KHOẢNG CÁCH 5 CHẶNG QUAN TRỌNG ===');
  console.log(`- Leg 6 (Stop 6 -> 7):   ${(leg6_7.distance / 1000).toFixed(2)} km (${Math.round(leg6_7.distance)} m)`);
  console.log(`- Leg 11 (Stop 11 -> 12): ${(leg11_12.distance / 1000).toFixed(2)} km (${Math.round(leg11_12.distance)} m)`);
  console.log(`- Leg 12 (Stop 12 -> 13): ${(leg12_13.distance / 1000).toFixed(2)} km (${Math.round(leg12_13.distance)} m)`);
  console.log(`- Leg 16 (Stop 16 -> 17): ${(leg16_17.distance / 1000).toFixed(2)} km (${Math.round(leg16_17.distance)} m)`);
  console.log(`- Leg 19 (Stop 19 -> 20): ${(leg19_20.distance / 1000).toFixed(2)} km (${Math.round(leg19_20.distance)} m)`);
}

run().catch((err) => {
  console.error('Lỗi khi chạy:', err.message);
  process.exit(1);
});
