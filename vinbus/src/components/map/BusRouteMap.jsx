import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';

// Xử lý đường dẫn asset icon mặc định của Leaflet trong môi trường bundler (Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const defaultMarkerIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/**
 * Component hỗ trợ tự động căn chỉnh khung hình bản đồ vừa vặn với toàn bộ tuyến đường
 */
const MapBoundsFitter = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [30, 30],
          maxZoom: 16,
        });
      }
    }
  }, [map, positions]);

  return null;
};

/**
 * BusRouteMap Component
 * @param {Object} props
 * @param {Object} props.geometry - GeoJSON LineString geometry của tuyến ({ type: "LineString", coordinates: [[lng, lat], ...] })
 * @param {Array} props.stops - Danh sách các điểm dừng kèm tọa độ [{ name, order, lat, lng }]
 */
const BusRouteMap = ({ geometry, stops }) => {
  // Tọa độ trung tâm mặc định (khu vực Hà Nội)
  const defaultCenter = [21.0285, 105.82];
  const defaultZoom = 12;

  // Chuyển đổi tọa độ từ chuẩn GeoJSON [lng, lat] sang chuẩn Leaflet [lat, lng]
  const polylinePositions = useMemo(() => {
    if (
      !geometry?.coordinates ||
      !Array.isArray(geometry.coordinates) ||
      geometry.coordinates.length === 0
    ) {
      return [];
    }

    return geometry.coordinates
      .filter(
        (coord) =>
          Array.isArray(coord) &&
          coord.length >= 2 &&
          !isNaN(coord[0]) &&
          !isNaN(coord[1])
      )
      .map(([lng, lat]) => [lat, lng]);
  }, [geometry]);

  // Lọc và chuẩn hóa danh sách các điểm dừng có tọa độ hợp lệ
  const validStops = useMemo(() => {
    if (!Array.isArray(stops) || stops.length === 0) {
      return [];
    }

    return stops
      .map((stop, index) => {
        if (!stop) return null;
        const lat = typeof stop.lat === 'number' ? stop.lat : Number(stop.lat);
        const lng = typeof stop.lng === 'number' ? stop.lng : Number(stop.lng);

        if (
          stop.lat === null ||
          stop.lng === null ||
          isNaN(lat) ||
          isNaN(lng)
        ) {
          return null;
        }

        return {
          ...stop,
          order: stop.order ?? index + 1,
          lat,
          lng,
        };
      })
      .filter(Boolean);
  }, [stops]);

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {polylinePositions.length > 0 && (
          <>
            <Polyline
              positions={polylinePositions}
              pathOptions={{
                color: '#2563eb', // Màu xanh dương
                weight: 5,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <MapBoundsFitter positions={polylinePositions} />
          </>
        )}

        {validStops.map((stop) => (
          <Marker
            key={`stop-${stop.order}-${stop.lat}-${stop.lng}`}
            position={[stop.lat, stop.lng]}
            icon={defaultMarkerIcon}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-slate-900">
                  Điểm dừng {stop.order}
                </div>
                <div className="text-slate-600 mt-0.5">
                  {stop.name || 'Không có tên'}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BusRouteMap;

