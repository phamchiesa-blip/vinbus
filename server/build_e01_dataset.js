import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đọc dữ liệu review đã có
const reviewFilePath = path.join(__dirname, 'test_e01_geocoding_review.json');
const reviewData = JSON.parse(fs.readFileSync(reviewFilePath, 'utf-8'));

// 7 tọa độ thủ công chuẩn xác từ Google Maps
const manualCoordinates = {
  10: { lat: 20.9932624, lng: 105.8062199 },
  14: { lat: 21.0017345, lng: 105.818801 },
  21: { lat: 20.9952238, lng: 105.8546609 },
  24: { lat: 20.9977819, lng: 105.8670945 },
  29: { lat: 20.9895078, lng: 105.9408467 },
  30: { lat: 20.9905026, lng: 105.943966 },
  34: { lat: 20.9915143, lng: 105.9605405 },
};

const mergedStops = reviewData.stops.map((stop) => {
  if (manualCoordinates[stop.order]) {
    return {
      name: stop.name,
      order: stop.order,
      lat: manualCoordinates[stop.order].lat,
      lng: manualCoordinates[stop.order].lng,
    };
  }

  return {
    name: stop.name,
    order: stop.order,
    lat: stop.lat,
    lng: stop.lng,
  };
});

// Sắp xếp đảm bảo thứ tự 1 -> 34
mergedStops.sort((a, b) => a.order - b.order);

// ========================
// VALIDATION
// ========================
const totalStops = mergedStops.length;

// Kiểm tra duplicate order hoặc name
const orders = mergedStops.map((s) => s.order);
const names = mergedStops.map((s) => s.name);
const hasDuplicateOrder = new Set(orders).size !== orders.length;
const hasDuplicateName = new Set(names).size !== names.length;

// Kiểm tra null / undefined / NaN
const hasNullCoords = mergedStops.some(
  (s) =>
    s.lat === null ||
    s.lng === null ||
    s.lat === undefined ||
    s.lng === undefined ||
    isNaN(s.lat) ||
    isNaN(s.lng)
);

// Kiểm tra thứ tự tuần tự 1 -> 34
let isSequential = true;
for (let i = 0; i < totalStops; i++) {
  if (mergedStops[i].order !== i + 1) {
    isSequential = false;
    break;
  }
}

// Min/Max Lat & Lng
const lats = mergedStops.map((s) => s.lat);
const lngs = mergedStops.map((s) => s.lng);
const minLat = Math.min(...lats);
const maxLat = Math.max(...lats);
const minLng = Math.min(...lngs);
const maxLng = Math.max(...lngs);

// Xuất file
const outputPath = path.join(__dirname, 'e01_outbound_coordinates.json');
fs.writeFileSync(outputPath, JSON.stringify(mergedStops, null, 2), 'utf-8');

console.log('=== KẾT QUẢ VALIDATION DATASET E01 OUTBOUND ===');
console.log('Đã xuất file:', outputPath);
console.log('Tổng số stops:', totalStops);
console.log('Có duplicate không:', hasDuplicateOrder ? 'CÓ (lỗi)' : 'KHÔNG (Hợp lệ)');
console.log('Có null/NaN coordinates không:', hasNullCoords ? 'CÓ (lỗi)' : 'KHÔNG (Hợp lệ)');
console.log('Thứ tự order liên tục 1 -> 34:', isSequential ? 'ĐÚNG (1 -> 34)' : 'SAI');
console.log('Min Latitude:', minLat);
console.log('Max Latitude:', maxLat);
console.log('Min Longitude:', minLng);
console.log('Max Longitude:', maxLng);
