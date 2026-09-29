import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'test_e01_geocoding.json');
const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

// Phân loại đánh giá từng stop dựa trên kết quả tọa độ và tên match
const reviews = [
  {
    order: 1,
    status: 'CONFIRMED',
    reason: 'Trùng khớp chính xác Bến xe Mỹ Đình trên đường Phạm Hùng.',
  },
  {
    order: 2,
    status: 'CONFIRMED',
    reason: 'Trùng khớp điểm dừng xe bus Phạm Hùng - Đình Thôn.',
  },
  {
    order: 3,
    status: 'CONFIRMED',
    reason: 'Tọa độ nằm trong KĐT Mỹ Đình Sông Đà dọc trục Phạm Hùng.',
  },
  {
    order: 4,
    status: 'CONFIRMED',
    reason: 'Khớp vị trí CT5 KĐT Sông Đà / Mỹ Đình trên đường Phạm Hùng.',
  },
  {
    order: 5,
    status: 'CONFIRMED',
    reason: 'Trùng khớp chính xác Bảo tàng Hà Nội trên đường Phạm Hùng.',
  },
  {
    order: 6,
    status: 'CONFIRMED',
    reason: 'Trùng khớp chính xác Trung tâm Hội nghị Quốc gia.',
  },
  {
    order: 7,
    status: 'CONFIRMED',
    reason: 'Trùng khớp tòa Taisei Square số 289 Khuất Duy Tiến.',
  },
  {
    order: 8,
    status: 'CONFIRMED',
    reason: 'Nằm đúng trên đường Khuất Duy Tiến theo hành lang di chuyển.',
  },
  {
    order: 9,
    status: 'CONFIRMED',
    reason: 'Trùng khớp trụ sở UBND phường Thanh Xuân trên đường Khuất Duy Tiến.',
  },
  {
    order: 10,
    status: 'WRONG',
    reason: 'Sai vị trí nghiêm trọng: Công ty Giày Thượng Đình thực tế ở số 277 Nguyễn Trãi (Thanh Xuân), nhưng bị geocode sang phố Nguyễn Thị Định (Cầu Giấy).',
  },
  {
    order: 11,
    status: 'CONFIRMED',
    reason: 'Trùng khớp chính xác ĐH Khoa học Tự nhiên tại 334 Nguyễn Trãi.',
  },
  {
    order: 12,
    status: 'CONFIRMED',
    reason: 'Trùng khớp chính xác Ga tàu điện Thượng Đình trên đường Nguyễn Trãi.',
  },
  {
    order: 13,
    status: 'CONFIRMED',
    reason: 'Trùng khớp trường THPT Huỳnh Thúc Kháng tại 131 Nguyễn Trãi.',
  },
  {
    order: 14,
    status: 'WRONG',
    reason: 'Sai vị trí: Số 69A Nguyễn Trãi thực tế nằm gần Ngã Tư Sở (phía Đông), nhưng bị geocode ngược về đoạn Phùng Khoang / Đại Mỗ (phía Tây giáp Hà Đông).',
  },
  {
    order: 15,
    status: 'CONFIRMED',
    reason: 'Trùng khớp số 225 đường Trường Chinh (đoạn qua Ngã Tư Sở).',
  },
  {
    order: 16,
    status: 'CONFIRMED',
    reason: 'Trùng khớp chính xác Bảo tàng PK-KQ tại 173C Trường Chinh.',
  },
  {
    order: 17,
    status: 'CONFIRMED',
    reason: 'Nằm đúng trục đường Trường Chinh đoạn gần ngã tư Vọng.',
  },
  {
    order: 18,
    status: 'CONFIRMED',
    reason: 'Nằm đúng trên phố Đại La (tiếp nối đường Trường Chinh).',
  },
  {
    order: 19,
    status: 'CONFIRMED',
    reason: 'Nằm đúng trên phố Đại La (phường Bạch Mai).',
  },
  {
    order: 20,
    status: 'CONFIRMED',
    reason: 'Trùng khớp số 32 phố Minh Khai (đoạn Chợ Mơ).',
  },
  {
    order: 21,
    status: 'WRONG',
    reason: 'Sai vị trí nghiêm trọng: Bị geocode sang xã Minh Khai ngoại thành (vĩ độ 20.69, cách 40km) thay vì phố Minh Khai, quận Hai Bà Trưng.',
  },
  {
    order: 22,
    status: 'CONFIRMED',
    reason: 'Trùng khớp số 308 phố Minh Khai gần cầu Mai Động.',
  },
  {
    order: 23,
    status: 'CONFIRMED',
    reason: 'Trùng khớp đoạn 386-388 phố Minh Khai, phường Vĩnh Tuy.',
  },
  {
    order: 24,
    status: 'WRONG',
    reason: 'Sai vị trí nghiêm trọng: Bị geocode sang xã Minh Khai ngoại thành (vĩ độ 20.69) thay vì KĐT Times City (số 458-478 Minh Khai, Hai Bà Trưng).',
  },
  {
    order: 25,
    status: 'CONFIRMED',
    reason: 'Trùng khớp chính xác TTTM Aeon Mall Long Biên trên đường Cổ Linh.',
  },
  {
    order: 26,
    status: 'CONFIRMED',
    reason: 'Trùng khớp số 42 phố Ngọc Trì / Cổ Linh, Long Biên.',
  },
  {
    order: 27,
    status: 'CONFIRMED',
    reason: 'Trùng khớp khu vực trường Tiểu học Thạch Bàn, Long Biên.',
  },
  {
    order: 28,
    status: 'CONFIRMED',
    reason: 'Trùng khớp trường Vinschool trong KĐT Vinhomes Ocean Park, Gia Lâm.',
  },
  {
    order: 29,
    status: 'WRONG',
    reason: 'False match: Điểm dừng của tuyến E01 ở Vinhomes Ocean Park (Gia Lâm, kinh độ ~105.94), nhưng bị nhầm sang tòa S2.01 Vinhomes Smart City (Tây Mỗ, Nam Từ Liêm, kinh độ 105.73).',
  },
  {
    order: 30,
    status: 'FAILED',
    reason: 'Không tìm thấy tọa độ: Tên địa danh nội bộ Vinhomes ("Bến trả Ocean Park 2, 3") không tồn tại trên cơ sở dữ liệu OpenStreetMap.',
  },
  {
    order: 31,
    status: 'CONFIRMED',
    reason: 'Trùng khớp chính xác trường Đại học VinUni trong Vinhomes Ocean Park.',
  },
  {
    order: 32,
    status: 'CONFIRMED',
    reason: 'Trùng khớp KTX Đại học VinUni trong Vinhomes Ocean Park.',
  },
  {
    order: 33,
    status: 'CONFIRMED',
    reason: 'Trùng khớp số 139 đường Hải Âu 2, Vinhomes Ocean Park.',
  },
  {
    order: 34,
    status: 'REVIEW',
    reason: 'Cần kiểm tra lại: Tọa độ trả về phân khu Sapphire 2 Ocean Park do query chung chung "Ocean Park", trong khi điểm đỗ xe cuối tuyến/depot nằm ở khu vực bãi đỗ riêng.',
  },
];

const reviewedStops = rawData.stops.map((stop) => {
  const rev = reviews.find((r) => r.order === stop.order);
  return {
    name: stop.name,
    order: stop.order,
    lat: stop.lat,
    lng: stop.lng,
    status: rev ? rev.status : 'REVIEW',
    reason: rev ? rev.reason : 'Cần rà soát thêm.',
  };
});

const summary = {
  routeNumber: rawData.routeNumber,
  routeName: rawData.routeName,
  direction: rawData.direction,
  totalStops: reviewedStops.length,
  confirmedCount: reviewedStops.filter((s) => s.status === 'CONFIRMED').length,
  reviewCount: reviewedStops.filter((s) => s.status === 'REVIEW').length,
  wrongCount: reviewedStops.filter((s) => s.status === 'WRONG').length,
  failedCount: reviewedStops.filter((s) => s.status === 'FAILED').length,
  timestamp: new Date().toISOString(),
  stops: reviewedStops,
};

const outputPath = path.join(__dirname, 'test_e01_geocoding_review.json');
fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf-8');

console.log('Đã tạo thành công file:', outputPath);
console.log('CONFIRMED:', summary.confirmedCount);
console.log('REVIEW:', summary.reviewCount);
console.log('WRONG:', summary.wrongCount);
console.log('FAILED:', summary.failedCount);
