import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Công thức Haversine tính khoảng cách đường chim bay (mét)
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 34 stops E01 Inbound chính xác theo dữ liệu người dùng cung cấp
const inboundStops = [
  { order: 1, name: "Điểm đỗ xe OCP", lat: 20.99151266880165, lng: 105.96055011447811 },
  { order: 2, name: "152 Hải Âu 2", lat: 20.992356077464198, lng: 105.95520761354987 },
  { order: 3, name: "Đối diện KTX Đại học VinUni", lat: 20.99002211039423, lng: 105.94833890160129 },
  { order: 4, name: "Đối diện Đại học VinUni", lat: 20.991374093303957, lng: 105.94551614233444 },
  { order: 5, name: "Tòa nhà S2.15", lat: 20.990858226694368, lng: 105.94371906229854 },
  { order: 6, name: "Tòa nhà S2.01", lat: 20.98930560771127, lng: 105.94118705700748 },
  { order: 7, name: "Trường Trung học VinSchool Ocean Park", lat: 20.99439043018455, lng: 105.93671111198758 },
  { order: 8, name: "Trường Tiểu Học Thạch Bàn A", lat: 21.01881634183345, lng: 105.9122554669082 },
  { order: 9, name: "Mầm Non Hoa Mai-Ngọc Trì", lat: 21.02272180002909, lng: 105.90639561579884 },
  { order: 10, name: "Aeon Mall Long Biên", lat: 21.025577415312526, lng: 105.90018013815973 },
  { order: 11, name: "Đối diện Vinhomes Times City", lat: 20.99806793159778, lng: 105.8665363340623 },
  { order: 12, name: "259 Minh Khai", lat: 20.997097986173255, lng: 105.86393295534482 },
  { order: 13, name: "199 Minh Khai", lat: 20.996119575547997, lng: 105.86095809683123 },
  { order: 14, name: "139 - 141 Minh Khai", lat: 20.99564869552143, lng: 105.85499629914993 },
  { order: 15, name: "Số 5 Minh Khai (chợ Mơ)", lat: 20.99612968742031, lng: 105.85065486911624 },
  { order: 16, name: "66 Đại La", lat: 20.996383522204486, lng: 105.84802963096541 },
  { order: 17, name: "128C Đại La", lat: 20.99742396257731, lng: 105.84377422421784 },
  { order: 18, name: "86 Trường Chinh", lat: 20.998669561072973, lng: 105.83865751017383 },
  { order: 19, name: "Đối diện Bảo tàng PKKQ", lat: 21.000294222967106, lng: 105.83109473369885 },
  { order: 20, name: "Số 610 Trường Chinh", lat: 21.002854879762207, lng: 105.82199373654461 },
  { order: 21, name: "Số 108 Nguyễn Trãi", lat: 20.999651882943006, lng: 105.81478159224335 },
  { order: 22, name: "Ga Thượng Đình", lat: 20.997886686702433, lng: 105.8121633961262 },
  { order: 23, name: "Đại học Khoa học - Tự nhiên", lat: 20.99589705712559, lng: 105.8091465491455 },
  { order: 24, name: "Cục Sở hữu trí tuệ", lat: 20.993485028813875, lng: 105.80570784040742 },
  { order: 25, name: "90 Khuất Duy Tiến", lat: 20.99575478505356, lng: 105.8002130848413 },
  { order: 26, name: "162 Khuất Duy Tiến", lat: 20.99817704494809, lng: 105.79829291315862 },
  { order: 27, name: "Đối diện 289A Khuất Duy Tiến", lat: 21.00378023422531, lng: 105.79379594916078 },
  { order: 28, name: "Đối diện Trung tâm Hội nghị Quốc Gia", lat: 21.006894867045034, lng: 105.79129724145632 },
  { order: 29, name: "Đối diện Bảo tàng Hà Nội", lat: 21.01276673914485, lng: 105.78646516505506 },
  { order: 30, name: "Tòa nhà Landmark 72", lat: 21.015543237063838, lng: 105.78425395071051 },
  { order: 31, name: "Đối diện nhà CT5 - KĐT Sông Đà", lat: 21.018829907637755, lng: 105.78159907377594 },
  { order: 32, name: "Qua Phạm Hùng - Đình Thôn", lat: 21.022987839681303, lng: 105.77911101398225 },
  { order: 33, name: "Đối diện Bến xe Mỹ Đình (Cột trước)", lat: 21.02756308750259, lng: 105.77936301432699 },
  { order: 34, name: "Bến xe Mỹ Đình", lat: 21.028046730173013, lng: 105.77853785082614 },
];

async function run() {
  console.log('--- Bắt đầu xử lý E01 Inbound (KĐT Ocean Park -> Bến xe Mỹ Đình) ---');

  // 1. Lưu file tọa độ inbound
  const coordsPath = path.join(__dirname, 'e01_inbound_coordinates.json');
  fs.writeFileSync(coordsPath, JSON.stringify(inboundStops, null, 2), 'utf-8');
  console.log(`Đã lưu ${inboundStops.length} stops vào: ${coordsPath}`);

  // 2. Chuẩn bị params gọi OSRM
  const coordsParam = inboundStops.map((s) => `${s.lng},${s.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=full&geometries=geojson&steps=true&annotations=distance,duration`;

  console.log('Đang gọi OSRM API...');
  const res = await fetch(url, {
    headers: { 'User-Agent': 'VinBus-Analysis/Inbound-1.0' },
  });

  if (!res.ok) {
    throw new Error(`OSRM HTTP error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error(`OSRM error code: ${data.code}`);
  }

  const primaryRoute = data.routes[0];
  const distanceKm = (primaryRoute.distance / 1000).toFixed(2);
  const durationMin = (primaryRoute.duration / 60).toFixed(1);
  const geomCoords = primaryRoute.geometry.coordinates;

  // 3. Tạo cấu trúc file kết quả OSRM theo chuẩn pipeline
  const resultToSave = {
    route: 'E01',
    direction: 'inbound',
    version: 'final_v2',
    distance: parseFloat(distanceKm),
    duration: parseFloat(durationMin),
    geometry: {
      type: primaryRoute.geometry.type,
      coordinates: geomCoords,
    },
    waypoints: data.waypoints.map((wp, idx) => ({
      stopOrder: inboundStops[idx].order,
      stopName: inboundStops[idx].name,
      originalLocation: [inboundStops[idx].lng, inboundStops[idx].lat],
      snappedLocation: wp.location,
      distanceToRoad: wp.distance,
      roadName: wp.name,
    })),
  };

  const outputPath = path.join(__dirname, 'test_e01_inbound_osrm_final_v2.json');
  fs.writeFileSync(outputPath, JSON.stringify(resultToSave, null, 2), 'utf-8');
  console.log(`Đã lưu kết quả OSRM vào: ${outputPath}`);

  // 4. Phân tích chi tiết 33 legs
  let uturnCount = 0;
  const uturnList = [];
  const legsAnalysis = [];

  primaryRoute.legs.forEach((leg, i) => {
    const fromStop = inboundStops[i];
    const toStop = inboundStops[i + 1];
    const directDist = haversine(fromStop.lat, fromStop.lng, toStop.lat, toStop.lng);
    const osrmDist = leg.distance;
    const ratio = directDist > 0 ? osrmDist / directDist : 1;

    const stepUturns = [];
    const streetNames = [];
    leg.steps.forEach((step) => {
      if (step.name && !streetNames.includes(step.name)) {
        streetNames.push(step.name);
      }
      const mod = step.maneuver?.modifier?.toLowerCase() || '';
      const typ = step.maneuver?.type?.toLowerCase() || '';
      if (mod.includes('uturn') || typ.includes('uturn')) {
        uturnCount++;
        stepUturns.push({
          location: step.maneuver.location,
          instruction: `${step.maneuver.type} ${step.maneuver.modifier || ''}`,
          street: step.name || 'unnamed',
        });
      }
    });

    if (stepUturns.length > 0) {
      uturnList.push({
        legIndex: i + 1,
        from: `[${fromStop.order}] ${fromStop.name}`,
        to: `[${toStop.order}] ${toStop.name}`,
        uturns: stepUturns,
      });
    }

    legsAnalysis.push({
      legIndex: i + 1,
      fromOrder: fromStop.order,
      fromName: fromStop.name,
      toOrder: toStop.order,
      toName: toStop.name,
      osrmDist: Math.round(osrmDist),
      directDist: Math.round(directDist),
      ratio: parseFloat(ratio.toFixed(2)),
      durationSec: Math.round(leg.duration),
      hasUturn: stepUturns.length > 0,
      streets: streetNames,
    });
  });

  console.log('\n=== TỔNG QUAN ROUTING E01 INBOUND ===');
  console.log(`1. Tổng distance: ${distanceKm} km`);
  console.log(`2. Tổng duration: ${durationMin} phút`);
  console.log(`3. Số điểm geometry: ${geomCoords.length}`);
  console.log(`4. Số waypoint: ${data.waypoints.length}`);
  console.log(`5. Số legs: ${primaryRoute.legs.length}`);
  console.log(`6. Tổng số U-turn phát hiện: ${uturnCount}`);

  // In toàn bộ 33 legs theo thứ tự để rà soát
  console.log('\n=== CHI TIẾT 33 LEGS ===');
  legsAnalysis.forEach((l) => {
    const flag = l.ratio > 1.8 || l.hasUturn ? '⚠️ CẦN CHÚ Ý' : 'OK';
    console.log(
      `Leg ${l.legIndex.toString().padStart(2, ' ')}: [${l.fromOrder}] ${l.fromName} -> [${l.toOrder}] ${l.toName}`
    );
    console.log(
      `        OSRM: ${l.osrmDist}m | Thẳng: ${l.directDist}m | Ratio: ${l.ratio} | Uturn: ${l.hasUturn ? 'CÓ' : 'Không'} | [${flag}]`
    );
    console.log(`        Đường: ${l.streets.join(' -> ')}`);
  });

  // Top 10 legs có tỷ lệ đi vòng (ratio) cao nhất
  const topRatio = [...legsAnalysis].sort((a, b) => b.ratio - a.ratio).slice(0, 10);
  console.log('\n=== TOP 10 LEGS CÓ TỶ LỆ ĐI VÒNG (RATIO) CAO NHẤT ===');
  topRatio.forEach((l, i) => {
    console.log(
      `${i + 1}. Leg ${l.legIndex} [${l.fromName} -> ${l.toName}]: OSRM = ${l.osrmDist}m, Thẳng = ${l.directDist}m, Ratio = ${l.ratio} - Uturn: ${l.hasUturn ? 'CÓ' : 'KHÔNG'}`
    );
  });

  if (uturnList.length > 0) {
    console.log('\n=== CHI TIẾT CÁC U-TURN PHÁT HIỆN ===');
    console.log(JSON.stringify(uturnList, null, 2));
  } else {
    console.log('\n=== KHÔNG PHÁT HIỆN U-TURN TRÊN TUYẾN ===');
  }
}

run().catch((err) => {
  console.error('Lỗi khi chạy OSRM Inbound:', err.message);
  process.exit(1);
});
