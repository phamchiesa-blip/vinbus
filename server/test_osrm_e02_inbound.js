import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const expectedStopCount = 39;

const stops = [
  { name: 'Điểm đỗ xe OCP', order: 1, lat: 20.99155998893358, lng: 105.96052074432964 },
  { name: '152 Hải Âu 2', order: 2, lat: 20.992371278812183, lng: 105.95517980504995 },
  { name: 'Đối diện KTX Đại học VinUni', order: 3, lat: 20.99002267499523, lng: 105.94836236877622 },
  { name: 'Đối diện Đại học VinUni', order: 4, lat: 20.991356158686802, lng: 105.94604129144228 },
  { name: 'Tòa Ruby', order: 5, lat: 21.00074221274145, lng: 105.94279788384601 },
  { name: 'Bệnh viện Đa khoa Gia Lâm', order: 6, lat: 21.007348903371955, lng: 105.94406830792317 },
  { name: 'Khu Hành chính Gia Lâm - Tòa nhà Handico5', order: 7, lat: 21.010208369199624, lng: 105.93910085683136 },
  { name: 'Cửa hàng Xăng dầu số 100 - 255 Ngô Xuân Quảng', order: 8, lat: 21.01363865430161, lng: 105.93631672387473 },
  { name: 'Nhà văn hóa TDP Chính Trung - 139 Ngô Xuân Quảng', order: 9, lat: 21.017314907105472, lng: 105.93683383194258 },
  { name: 'Bưu cục Trâu Quỳ', order: 10, lat: 21.021761531426524, lng: 105.93679628101985 },
  { name: 'Cầu Thanh Trì - Nguyễn Đức Thuận', order: 11, lat: 21.023866685636698, lng: 105.93173260501118 },
  { name: 'Ngã 3 cầu Thanh Trì - Nguyễn Văn Linh', order: 12, lat: 21.027154417067592, lng: 105.92377128034259 },
  { name: 'Công ty May 10', order: 13, lat: 21.0289109185971, lng: 105.9183627357275 },
  { name: 'Số 707 Nguyễn Văn Linh', order: 14, lat: 21.02991234424293, lng: 105.91481685540032 },
  { name: '32 Sài Đồng', order: 15, lat: 21.033335678178563, lng: 105.90960098221494 },
  { name: 'Trung tâm sát hạch lái xe Sài Đồng', order: 16, lat: 21.037481855433825, lng: 105.91197020732471 },
  { name: '190 Sài Đồng', order: 17, lat: 21.040105425377124, lng: 105.91325766765777 },
  { name: 'Ngã 3 Trần Danh Tuyên-Hoa Hồng', order: 18, lat: 21.045462571642933, lng: 105.91110117162468 },
  { name: 'Đoàn Khuê ( Số 7 Bằng Lăng 1 )', order: 19, lat: 21.05155546541398, lng: 105.90763039316798 },
  { name: 'Ngã 4 Đoàn Khuê - Lệ Mật', order: 20, lat: 21.057412819242536, lng: 105.90431518281693 },
  { name: 'Đối diện Bệnh viện đa khoa Đức Giang', order: 21, lat: 21.062343831523734, lng: 105.89794225420394 },
  { name: 'Số 285 Ngô Gia Tự', order: 22, lat: 21.061297569475443, lng: 105.89370436396122 },
  { name: '79 Ngô Gia Tự - Bưu cục Long Biên', order: 23, lat: 21.05802857893767, lng: 105.8904481622198 },
  { name: 'Công ty Xe Lửa Gia Lâm', order: 24, lat: 21.052526700726133, lng: 105.88584012712934 },
  { name: '549 Nguyễn Văn Cừ', order: 25, lat: 21.04970309189963, lng: 105.88348514760845 },
  { name: 'Trường THPT Nguyễn Gia Thiều', order: 26, lat: 21.04553563469483, lng: 105.8752474610984 },
  { name: 'Trường tiểu học Ái Mộ', order: 27, lat: 21.042363317908688, lng: 105.87048369277018 },
  { name: 'Đối diện Ô Quan Chưởng (373 Hồng Hà)', order: 28, lat: 21.03773809411788, lng: 105.85294627834553 },
  { name: 'Điểm Trung Chuyển Long Biên (điểm E1.3)', order: 29, lat: 21.041375242451846, lng: 105.84957850318138 },
  { name: 'Ngã 4 Nguyễn Hữu Huân - Hàng Mắm', order: 30, lat: 21.03346893180479, lng: 105.85435366608156 },
  { name: 'Cung thiếu Nhi Hà Nội', order: 31, lat: 21.02810303775384, lng: 105.85562886390242 },
  { name: 'Trung tâm thương mại Tràng Tiền Plaza', order: 32, lat: 21.024105738721687, lng: 105.85361731037949 },
  { name: 'Bệnh viện Hữu Nghị Việt Nam - Cu Ba', order: 33, lat: 21.02498855127718, lng: 105.8504871995408 },
  { name: 'Bệnh viện Phụ sản Trung ương', order: 34, lat: 21.02622310070984, lng: 105.84642613359199 },
  { name: 'Cửa Nam - Phố ẩm thực Tống Duy Tân', order: 35, lat: 21.029480820041048, lng: 105.84235736921151 },
  { name: 'Vườn hoa Lênin - Cột Cờ Hà Nội', order: 36, lat: 21.031074481717994, lng: 105.83942254795359 },
  { name: '60 Trần Phú - Bệnh Viện Xanh Pôn', order: 37, lat: 21.031750130378086, lng: 105.83585040623521 },
  { name: 'Tòa nhà PTA-Số 1 Kim Mã', order: 38, lat: 21.031914754824914, lng: 105.82961328161383 },
  { name: 'Ngã 3 Hào Nam - An Trạch', order: 39, lat: 21.0282094961544, lng: 105.82744069233327 },
];

async function run() {
  if (stops.length !== expectedStopCount) {
    throw new Error(`Expected ${expectedStopCount} input stops, got ${stops.length}.`);
  }

  if (
    !stops.every(
      (stop, index) =>
        stop.order === index + 1 &&
        typeof stop.name === 'string' &&
        Number.isFinite(stop.lat) &&
        Number.isFinite(stop.lng)
    )
  ) {
    throw new Error('Input stops are invalid or not ordered from 1 to 39.');
  }

  const coordinates = stops.map(({ lat, lng }) => `${lng},${lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false&annotations=distance,duration`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'VinBus-E02-Inbound-OSRM-Test/1.0' },
  });

  if (!response.ok) {
    throw new Error(`OSRM HTTP error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.code !== 'Ok' || !Array.isArray(data.routes) || data.routes.length === 0) {
    throw new Error(`OSRM routing failed: ${data.code || 'unknown error'}`);
  }

  if (!Array.isArray(data.waypoints) || data.waypoints.length !== expectedStopCount) {
    throw new Error(`Expected ${expectedStopCount} OSRM waypoints, got ${data.waypoints?.length ?? 0}.`);
  }

  const route = data.routes[0];
  const geometry = route.geometry;
  if (
    geometry?.type !== 'LineString' ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length === 0 ||
    !geometry.coordinates.every(
      (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length === 2 &&
        coordinate.every(Number.isFinite)
    )
  ) {
    throw new Error('OSRM did not return a valid GeoJSON LineString geometry.');
  }

  const output = {
    route: 'E02',
    direction: 'inbound',
    inputStopCount: stops.length,
    waypointCount: data.waypoints.length,
    distance: Number((route.distance / 1000).toFixed(2)),
    duration: Number((route.duration / 60).toFixed(1)),
    stops,
    geometry: {
      type: 'LineString',
      coordinates: geometry.coordinates,
    },
    waypoints: data.waypoints.map((waypoint, index) => ({
      stopOrder: stops[index].order,
      stopName: stops[index].name,
      originalLocation: [stops[index].lng, stops[index].lat],
      snappedLocation: waypoint.location,
      distanceToRoad: waypoint.distance,
      roadName: waypoint.name,
    })),
  };

  const outputPath = path.join(__dirname, 'test_e02_osrm_inbound.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`Input stops: ${output.inputStopCount}`);
  console.log(`OSRM waypoints: ${output.waypointCount}`);
  console.log(`Distance: ${output.distance} km`);
  console.log(`Duration: ${output.duration} minutes`);
  console.log(`Geometry coordinates: ${geometry.coordinates.length}`);
  console.log(`Output: ${outputPath}`);
}

run().catch((error) => {
  console.error(`E02 inbound OSRM test failed: ${error.message}`);
  process.exitCode = 1;
});