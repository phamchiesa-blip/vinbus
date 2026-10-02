import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const expectedStopCount = 41;

const stops = [
  { name: 'Hào Nam (Ga Cát Linh)', order: 1, lat: 21.028265788381557, lng: 105.82746029761078 },
  { name: 'Tòa nhà PTA - Số 1 Kim Mã', order: 2, lat: 21.03226086385933, lng: 105.82945610188706 },
  { name: 'Số 145 Nguyễn Thái Học', order: 3, lat: 21.031087289566603, lng: 105.83361773639827 },
  { name: 'Trường Tiểu Học Lý thường Kiệt - Ngã 3 Hoàng Diệu', order: 4, lat: 21.02948373826359, lng: 105.8389249619157 },
  { name: 'Cửa Nam - Số 7 Nguyễn Thái Học', order: 5, lat: 21.028362075688843, lng: 105.84297095008877 },
  { name: 'Tháp Hà Nội - Bệnh viện Phụ sản Trung ương', order: 6, lat: 21.02598158236947, lng: 105.84663976900919 },
  { name: 'Bệnh viện Hữu Nghị Việt Nam - Cu Ba.', order: 7, lat: 21.024980130643787, lng: 105.85011081199873 },
  { name: 'Tràng Tiền Plaza - 16 Hai Bà Trưng', order: 8, lat: 21.023799174392888, lng: 105.8540664776678 },
  { name: 'Nhà hát Lớn Hà Nội (Đối diện 6C Phan Chu Trinh)', order: 9, lat: 21.02361390356984, lng: 105.85687743270826 },
  { name: 'Ngân hàng Nhà nước Việt Nam - Vườn hoa con Cóc_ CĐ', order: 10, lat: 21.026754567784266, lng: 105.8562541046539 },
  { name: '23 Hàng Tre - Ngã 4 Lò Sũ', order: 11, lat: 21.031973610278218, lng: 105.85569947777888 },
  { name: 'Hàng Muối - Cầu Chương Dương', order: 12, lat: 21.03458225637342, lng: 105.85465878068253 },
  { name: 'Điểm Trung Chuyển Long Biên (điểm E3.1)', order: 13, lat: 21.04111669716125, lng: 105.84961854143265 },
  { name: 'Tổng cục Hải Quan', order: 14, lat: 21.042622299801234, lng: 105.87111523125068 },
  { name: '370 Nguyễn Văn Cừ', order: 15, lat: 21.045534355268764, lng: 105.87597559500365 },
  { name: '436 - 438 Nguyễn Văn Cừ (E10)', order: 16, lat: 21.04704139582646, lng: 105.87887295298259 },
  { name: '548 Nguyễn Văn Cừ', order: 17, lat: 21.048443640427273, lng: 105.88181717243134 },
  { name: '654 Nguyễn Văn Cừ', order: 18, lat: 21.05236343239686, lng: 105.886080259338638 },
  { name: 'Bưu điện Đức Giang', order: 19, lat: 21.056544430133837, lng: 105.88969233323317 },
  { name: 'UBND phường Việt Hưng', order: 20, lat: 21.06125389633884, lng: 105.89421388856084 },
  { name: 'Bệnh viện đa khoa Đức Giang', order: 21, lat: 21.062241744697825, lng: 105.89822611698624 },
  { name: 'Ngã 4 Lệ Mật - Đoàn Khuê', order: 22, lat: 21.057389461630763, lng: 105.90398446963918 },
  { name: 'Đoàn Khuê ( đối diện số 7 Bằng Lăng 1 )', order: 23, lat: 21.05156328106203, lng: 105.90730475650876 },
  { name: 'Ngã 3 Trần Danh Tuyên - Hoa Hồng', order: 24, lat: 21.045328361369698, lng: 105.91086284376848 },
  { name: 'Đối diện 190 Sài Đồng', order: 25, lat: 21.040142699917077, lng: 105.9128767036352 },
  { name: 'Đối diện Trung tâm sát hạch lái xe Sài Đồng', order: 26, lat: 21.037414853882023, lng: 105.91179748131952 },
  { name: 'Số 3 Sài Đồng', order: 27, lat: 21.033472401542046, lng: 105.90949445185622 },
  { name: '523 Nguyễn Văn Linh - Khu CN Sài Đồng', order: 28, lat: 21.031785501317245, lng: 105.90978362146369 },
  { name: '693 Nguyễn Văn Linh - ngã 3 Thạch Bàn', order: 29, lat: 21.02973012951467, lng: 105.91448184373692 },
  { name: 'Đối diện Công ty May 10', order: 30, lat: 21.02813480358606, lng: 105.92004903159882 },
  { name: 'Ngã 3 cầu Thanh Trì - Nguyễn Đức Thuận', order: 31, lat: 21.02347811795722, lng: 105.93180140865356 },
  { name: 'Bưu cục Trâu Quỳ', order: 32, lat: 21.021607261293262, lng: 105.93646928346803 },
  { name: 'Ngã 3 Ngô Xuân Quảng - Nguyễn Mậu Tài', order: 33, lat: 21.0186046658963, lng: 105.9370201981217 },
  { name: 'Cửa hàng Xăng dầu số 100 - 234 Ngô Xuân Quảng', order: 34, lat: 21.013234901620578, lng: 105.93604425066763 },
  { name: 'Khu Hành Chính Gia Lâm - 64 Thành Trung', order: 35, lat: 21.010053441995193, lng: 105.93909085907855 },
  { name: 'Bệnh viện Đa khoa Gia Lâm', order: 36, lat: 21.007209884960243, lng: 105.944013672861 },
  { name: 'Đối diện Tòa Ruby', order: 37, lat: 21.000162970881856, lng: 105.94300224967928 },
  { name: 'Đại học VinUni', order: 38, lat: 20.991280691130974, lng: 105.94576504955252 },
  { name: 'KTX Đại học VinUni', order: 39, lat: 20.989481787442887, lng: 105.9489125349114 },
  { name: '139 Hải Âu 2', order: 40, lat: 20.992169976275072, lng: 105.95515112676117 },
  { name: 'Điểm đỗ xe OCP', order: 41, lat: 20.991494792796075, lng: 105.96054474714633 },
];

async function buildE02Outbound() {
  if (stops.length !== expectedStopCount) {
    throw new Error(`Expected ${expectedStopCount} stops, got ${stops.length}.`);
  }

  if (stops.some((stop, index) => stop.order !== index + 1)) {
    throw new Error('Stop orders must be sequential from 1 to 41.');
  }

  const coordinates = stops.map(({ lat, lng }) => `${lng},${lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'VinBus-E02-Routing/1.0' },
  });

  if (!response.ok) {
    throw new Error(`OSRM HTTP error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  if (result.code !== 'Ok' || !result.routes?.length) {
    throw new Error(`OSRM routing failed: ${result.code || 'unknown error'}`);
  }

  if (!Array.isArray(result.waypoints) || result.waypoints.length !== expectedStopCount) {
    throw new Error(`Expected ${expectedStopCount} OSRM waypoints, got ${result.waypoints?.length ?? 0}.`);
  }

  const route = result.routes[0];
  if (
    route.geometry?.type !== 'LineString' ||
    !Array.isArray(route.geometry.coordinates) ||
    route.geometry.coordinates.length === 0
  ) {
    throw new Error('OSRM did not return a valid GeoJSON LineString geometry.');
  }

  const output = {
    outbound: {
      stops,
      geometry: {
        type: 'LineString',
        coordinates: route.geometry.coordinates,
      },
    },
  };
  const outputPath = path.join(__dirname, 'e02_outbound_final_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`Input stops: ${stops.length}`);
  console.log(`OSRM waypoints: ${result.waypoints.length}`);
  console.log(`Route distance: ${(route.distance / 1000).toFixed(2)} km`);
  console.log(`Route duration: ${(route.duration / 60).toFixed(1)} minutes`);
  console.log(`Geometry coordinates: ${route.geometry.coordinates.length}`);
  console.log(`Output: ${outputPath}`);
}

buildE02Outbound().catch((error) => {
  console.error(`E02 outbound routing failed: ${error.message}`);
  process.exitCode = 1;
});