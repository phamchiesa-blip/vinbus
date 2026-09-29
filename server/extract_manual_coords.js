import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetStops = [
  {
    name: "Công ty Giày Thượng Đình",
    order: 10,
    googleMapsUrl: "https://maps.app.goo.gl/BvTC2ihmjtFGjmkB7",
  },
  {
    name: "Số 69A Nguyễn Trãi",
    order: 14,
    googleMapsUrl: "https://maps.app.goo.gl/UWWuQh3gA7s5nneH7",
  },
  {
    name: "Số 212-214 Minh Khai",
    order: 21,
    googleMapsUrl: "https://maps.app.goo.gl/ZdCbF2uYotu4y33z5",
  },
  {
    name: "Times City (478 Minh Khai)",
    order: 24,
    googleMapsUrl: "https://maps.app.goo.gl/Jp4TmSXw65ahj6Ts8",
  },
  {
    name: "Đối diện Tòa nhà S2.01",
    order: 29,
    googleMapsUrl: "https://maps.app.goo.gl/o3uy584MexAmPPUP6",
  },
  {
    name: "Bến trả Ocean Park 2, 3",
    order: 30,
    googleMapsUrl: "https://maps.app.goo.gl/wkzUvb3CrUhbdCqz5",
  },
  {
    name: "Điểm đỗ xe OCP",
    order: 34,
    googleMapsUrl: "https://maps.app.goo.gl/4VuthnXrFsFzqrci6",
  },
];

function extractCoordinatesFromUrl(finalUrl) {
  // 1. Tìm trong data parameter: !3d<lat>!4d<lng> (Tọa độ chính xác của pin điểm đến)
  const pinMatch = finalUrl.match(/!3d([0-9.-]+)!4d([0-9.-]+)/);
  if (pinMatch) {
    return {
      lat: parseFloat(pinMatch[1]),
      lng: parseFloat(pinMatch[2]),
      type: "pin",
    };
  }

  // 2. Tìm trong query param ?q=<lat>,<lng>
  const qMatch = finalUrl.match(/[?&]q=([0-9.-]+),([0-9.-]+)/);
  if (qMatch) {
    return {
      lat: parseFloat(qMatch[1]),
      lng: parseFloat(qMatch[2]),
      type: "query",
    };
  }

  // 3. Fallback: viewport center @<lat>,<lng>
  const atMatch = finalUrl.match(/@([0-9.-]+),([0-9.-]+)/);
  if (atMatch) {
    return {
      lat: parseFloat(atMatch[1]),
      lng: parseFloat(atMatch[2]),
      type: "viewport",
    };
  }

  return null;
}

function extractPlaceNameFromUrl(finalUrl) {
  const match = finalUrl.match(/\/maps\/place\/([^/@?]+)/);
  if (match) {
    try {
      return decodeURIComponent(match[1].replace(/\+/g, " "));
    } catch {
      return match[1];
    }
  }
  return "";
}

async function run() {
  console.log("--- Bắt đầu trích xuất tọa độ từ 7 Google Maps links ---");
  const results = [];

  for (const item of targetStops) {
    process.stdout.write(`Đang xử lý Stop ${item.order}: ${item.name}... `);
    try {
      const response = await fetch(item.googleMapsUrl, {
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      const finalUrl = response.url;
      const coords = extractCoordinatesFromUrl(finalUrl);
      const placeName = extractPlaceNameFromUrl(finalUrl);

      if (coords && !isNaN(coords.lat) && !isNaN(coords.lng)) {
        console.log(`FOUND (${coords.lat.toFixed(7)}, ${coords.lng.toFixed(7)}) - ${placeName}`);
        results.push({
          name: item.name,
          order: item.order,
          lat: coords.lat,
          lng: coords.lng,
          googleMapsUrl: item.googleMapsUrl,
          status: "FOUND",
          note: `Trích xuất từ Google Maps: ${placeName}`,
        });
      } else {
        console.log("FAILED (Không tìm thấy pattern tọa độ trong URL)");
        results.push({
          name: item.name,
          order: item.order,
          lat: null,
          lng: null,
          googleMapsUrl: item.googleMapsUrl,
          status: "FAILED",
          note: `Không thể trích xuất tọa độ từ URL: ${finalUrl}`,
        });
      }
    } catch (err) {
      console.log(`FAILED (${err.message})`);
      results.push({
        name: item.name,
        order: item.order,
        lat: null,
        lng: null,
        googleMapsUrl: item.googleMapsUrl,
        status: "FAILED",
        note: `Lỗi kết nối: ${err.message}`,
      });
    }
  }

  const outputPath = path.join(__dirname, "test_e01_manual_coordinates.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\nĐã xuất kết quả ra file: ${outputPath}`);
}

run();
