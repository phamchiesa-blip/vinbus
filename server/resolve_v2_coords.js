import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targets = [
  {
    order: 6,
    name: 'Trung tâm Hội nghị Quốc gia',
    url: 'https://maps.app.goo.gl/pSvqniyyJgGB6Yh9A',
  },
  {
    order: 11,
    name: 'ĐH Khoa học Tự nhiên',
    url: 'https://maps.app.goo.gl/aVqHbV91Nw5rwBav6',
  },
  {
    order: 12,
    name: 'Ga Thượng Đình',
    url: 'https://maps.app.goo.gl/UsZcHS43S8iLmJGS9',
  },
];

function extractCoords(url) {
  const pinMatch = url.match(/!3d([0-9.-]+)!4d([0-9.-]+)/);
  if (pinMatch) {
    return { lat: parseFloat(pinMatch[1]), lng: parseFloat(pinMatch[2]), source: 'pin' };
  }
  const qMatch = url.match(/[?&]q=([0-9.-]+),([0-9.-]+)/);
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]), source: 'query' };
  }
  const atMatch = url.match(/@([0-9.-]+),([0-9.-]+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]), source: 'at' };
  }
  return null;
}

async function run() {
  const extracted = {};

  for (const t of targets) {
    console.log(`Đang phân giải Stop ${t.order}: ${t.name}...`);
    const res = await fetch(t.url, {
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    console.log(`Final URL: ${res.url}`);
    const coords = extractCoords(res.url);
    if (!coords) {
      throw new Error(`FAILED: Không thể trích xuất tọa độ từ URL cho Stop ${t.order}`);
    }
    console.log(`-> Tọa độ tìm thấy: lat=${coords.lat}, lng=${coords.lng} (source: ${coords.source})`);
    extracted[t.order] = coords;
  }

  // Đọc file cũ e01_outbound_coordinates.json
  const v1Path = path.join(__dirname, 'e01_outbound_coordinates.json');
  const v1Stops = JSON.parse(fs.readFileSync(v1Path, 'utf-8'));

  const v2Stops = v1Stops.map((stop) => {
    if (extracted[stop.order]) {
      return {
        name: stop.name,
        order: stop.order,
        lat: extracted[stop.order].lat,
        lng: extracted[stop.order].lng,
      };
    }
    return { ...stop };
  });

  const v2Path = path.join(__dirname, 'e01_outbound_coordinates_v2.json');
  fs.writeFileSync(v2Path, JSON.stringify(v2Stops, null, 2), 'utf-8');
  console.log(`\nĐã tạo thành công dataset v2 tại: ${v2Path}`);

  // In bảng đối chiếu tọa độ cũ và mới
  console.log('\n--- ĐỐI CHIẾU TỌA ĐỘ CŨ VÀ MỚI ---');
  for (const t of targets) {
    const oldStop = v1Stops.find((s) => s.order === t.order);
    const newStop = v2Stops.find((s) => s.order === t.order);
    console.log(`Stop ${t.order}: ${t.name}`);
    console.log(`  Cũ : lat = ${oldStop.lat}, lng = ${oldStop.lng}`);
    console.log(`  Mới: lat = ${newStop.lat}, lng = ${newStop.lng}`);
  }
}

run().catch((err) => {
  console.error('Lỗi:', err.message);
  process.exit(1);
});
