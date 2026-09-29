import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('--- Bắt đầu thử nghiệm Routing OSRM cho tuyến E01 Outbound ---');

  // 1. Đọc dataset 34 stops
  const stopsPath = path.join(__dirname, 'e01_outbound_coordinates.json');
  const stops = JSON.parse(fs.readFileSync(stopsPath, 'utf-8'));
  console.log(`Đã đọc ${stops.length} stops từ ${stopsPath}`);

  // 2. Tạo chuỗi coordinates dạng lng,lat;lng,lat... (OSRM quy định kinh độ trước, vĩ độ sau)
  const coordsParam = stops.map((s) => `${s.lng},${s.lat}`).join(';');
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=full&geometries=geojson&steps=false&annotations=distance,duration`;

  console.log(`Đang gửi request tới OSRM (${stops.length} waypoints)...`);
  
  const startTime = Date.now();
  const response = await fetch(osrmUrl, {
    headers: {
      'User-Agent': 'VinBus-Student-Test/1.0 (academic-testing)',
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

  console.log('\n--- KẾT QUẢ TỔNG QUAN ---');
  console.log(`Trạng thái OSRM: ${data.code}`);
  console.log(`Tổng khoảng cách: ${distanceKm} km`);
  console.log(`Thời gian dự kiến: ${durationMin} phút`);
  console.log(`Số điểm trên polyline: ${geomCoords.length} points`);
  console.log(`Số waypoints khớp: ${data.waypoints ? data.waypoints.length : 0}`);

  // Chuẩn bị dữ liệu lưu vào file
  const resultToSave = {
    route: 'E01',
    direction: 'outbound',
    distance: parseFloat(distanceKm),
    duration: parseFloat(durationMin),
    geometry: {
      type: primaryRoute.geometry.type,
      coordinates: geomCoords, // mảng các cặp [lng, lat]
    },
    waypoints: data.waypoints.map((wp, idx) => ({
      stopOrder: stops[idx].order,
      stopName: stops[idx].name,
      originalLocation: [stops[idx].lng, stops[idx].lat],
      snappedLocation: wp.location,
      distanceToRoad: wp.distance, // khoảng cách từ điểm gốc đến tim đường (m)
      roadName: wp.name,
    })),
  };

  const outputPath = path.join(__dirname, 'test_e01_osrm.json');
  fs.writeFileSync(outputPath, JSON.stringify(resultToSave, null, 2), 'utf-8');
  console.log(`Đã lưu kết quả vào: ${outputPath}`);

  // ==========================================
  // KIỂM TRA BẤT THƯỜNG TRÊN TỪNG CHẶNG (LEGS)
  // ==========================================
  console.log('\n--- PHÂN TÍCH TỪNG CHẶNG GIỮA CÁC ĐIỂM DỪNG (LEGS) ---');
  const legs = primaryRoute.legs || [];
  const anomalies = [];

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    const fromStop = stops[i];
    const toStop = stops[i + 1];
    const legDistanceKm = (leg.distance / 1000).toFixed(2);
    const legDurationMin = (leg.duration / 60).toFixed(1);

    // Tính khoảng cách đường chim bay giữa 2 stop
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

    // Tỉ lệ đường bộ / đường thẳng (detour ratio)
    const detourRatio = straightDistKm > 0.05 ? leg.distance / 1000 / straightDistKm : 1;

    // Cảnh báo nếu đường bộ dài gấp 2.5 lần đường thẳng hoặc leg dài bất thường
    if (detourRatio > 2.5 && leg.distance > 800) {
      anomalies.push({
        legIndex: i + 1,
        from: `[${fromStop.order}] ${fromStop.name}`,
        to: `[${toStop.order}] ${toStop.name}`,
        roadDistanceKm: legDistanceKm,
        straightDistKm: straightDistKm.toFixed(2),
        ratio: detourRatio.toFixed(1),
        issue: `Đi vòng xa (gấp ${detourRatio.toFixed(1)} lần đường thẳng)`,
      });
    }

    // Cảnh báo nếu điểm dừng quá xa tim đường (> 50m)
    const wp = data.waypoints[i];
    if (wp && wp.distance > 50) {
      anomalies.push({
        stop: `[${fromStop.order}] ${fromStop.name}`,
        distanceToRoad: `${wp.distance.toFixed(1)}m`,
        issue: `Điểm dừng cách tim đường khá xa (${wp.distance.toFixed(1)}m), có thể do đặt pin trong ngõ hoặc trong khuôn viên`,
      });
    }
  }

  console.log(`Tổng số chặng phân tích: ${legs.length}`);
  console.log(`Số điểm bất thường phát hiện: ${anomalies.length}`);
  if (anomalies.length > 0) {
    console.log(JSON.stringify(anomalies, null, 2));
  } else {
    console.log('Không phát hiện chặng nào bị đi vòng hoặc bất thường lớn!');
  }
}

run().catch((err) => {
  console.error('Lỗi khi chạy OSRM routing:', err);
  process.exit(1);
});
