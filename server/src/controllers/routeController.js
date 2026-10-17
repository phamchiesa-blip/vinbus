import BusRoute from "../models/BusRoute.js";
import ApiFeatures from "../utils/apiFeatures.js";

// next(error) cho nó vào lỗi tiếp theo, nơi mà middleware xử lý

// tạo data
export const createRoute = async (req, res, next) => {
    try {
        const route = await BusRoute.create(req.body);

        res.status(201).json({
            success: true,
            data: route,
        });
    } catch (error) {
      next(error);
    }
}

// lấy data khi search ở FE
export const getRoutes = async (req, res, next) => {
  try {
    const { search, from, to } = req.query; // tìm search, from, to trong URL (sau dấu ?)

    // =====================
      // FILTER
    // =====================
    const filter = {};

    // $options: "i" cho phép không phân biệt chữ hoa/chữ thường.
    // $or: search xuất hiện trong name HOẶC routeNumber

    // SEARCH
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { routeNumber: { $regex: search, $options: "i" } },
        { operator: { $regex: search, $options: "i" } },

        { "outbound.start": { $regex: search, $options: "i" } },
        { "outbound.end": { $regex: search, $options: "i" } },
        { "outbound.stops.name": { $regex: search, $options: "i" } },

        { "inbound.start": { $regex: search, $options: "i" } },
        { "inbound.end": { $regex: search, $options: "i" } },
        { "inbound.stops.name": { $regex: search, $options: "i" } },
      ];
    }

    // Filter điểm đi
    if (from) {
      filter.$and = filter.$and || [];

      filter.$and.push({
        $or: [
          { "outbound.start": { $regex: from, $options: "i" } },
          { "inbound.start": { $regex: from, $options: "i" } },
        ],
      });
    }

    // Filter điểm đến
    if (to) {
      filter.$and = filter.$and || [];

      filter.$and.push({
        $or: [
          { "outbound.end": { $regex: to, $options: "i" } },
          { "inbound.end": { $regex: to, $options: "i" } },
        ],
      });
    }

    // Tổng số tuyến sau khi filter
    const totalRoutes = await BusRoute.countDocuments(filter);
    
    const features = new ApiFeatures(
    BusRoute.find(filter),
    req.query
    )
    .sort()
    .setPagination();
   
    const totalPages = Math.ceil(totalRoutes / features.limit); // làm tròn lên

    features.paginate(totalPages);

    const routes = await features.query;
  
    res.status(200).json({
      success: true,
      pagination: {
                page: features.page,
                limit: features.limit,
                totalRoutes,
                totalPages,
              },
      data: routes,
    });

  } catch (error) {
    next(error);
  }
};

// lấy data theo id
export const getRouteById = async (req, res, next) => {
  try {
    const route = await BusRoute.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Đéo có tuyến bus đó !!!",
      });
    }

    res.status(200).json({
      success: true,
      data: route,
    });
  } catch (error) {
    next(error);
  }
};

// cập nhật giá trị cho xe bus
export const updateRoute = async (req, res, next) => {
  try {
    const existingRoute = await BusRoute.findById(req.params.id).lean();

    if (!existingRoute) {
      return res.status(404).json({
        success: false,
        message: "Đéo tìm được tuyến này !!!",
      });
    }

    // Bảo vệ dữ liệu outbound (geometry và tọa độ điểm dừng)
    if (req.body.outbound) {
      const hasIncomingGeometry =
        req.body.outbound.geometry &&
        Array.isArray(req.body.outbound.geometry.coordinates) &&
        req.body.outbound.geometry.coordinates.length > 0;

      if (!hasIncomingGeometry && existingRoute.outbound?.geometry) {
        req.body.outbound.geometry = {
          type: existingRoute.outbound.geometry.type || "LineString",
          coordinates: existingRoute.outbound.geometry.coordinates || [],
        };
      } else if (hasIncomingGeometry && !req.body.outbound.geometry.type) {
        req.body.outbound.geometry.type = "LineString";
      }

      // Helper kiểm tra tọa độ hợp lệ
      const isValidCoordinate = (val) =>
        val !== undefined &&
        val !== null &&
        typeof val !== "boolean" &&
        String(val).trim() !== "" &&
        !isNaN(Number(val)) &&
        isFinite(Number(val));

      // Bảo toàn tọa độ các điểm dừng hiện có nếu payload không truyền tọa độ mới
      if (
        Array.isArray(req.body.outbound.stops) &&
        Array.isArray(existingRoute.outbound?.stops)
      ) {
        const existingStopsById = new Map();

        existingRoute.outbound.stops.forEach((s) => {
          if (s._id) existingStopsById.set(s._id.toString(), s);
        });

        // Validate tọa độ đầu vào chiều đi
        for (const stop of req.body.outbound.stops) {
          const hasLat = isValidCoordinate(stop.lat);
          const hasLng = isValidCoordinate(stop.lng);

          if ((hasLat && !hasLng) || (!hasLat && hasLng)) {
            return res.status(400).json({
              success: false,
              message: `Điểm dừng "${stop.name || stop.order}" ở chiều đi phải có đủ cả Vĩ độ và Kinh độ hoặc để trống cả hai.`,
            });
          }

          if (hasLat && hasLng) {
            const numLat = Number(stop.lat);
            const numLng = Number(stop.lng);
            if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
              return res.status(400).json({
                success: false,
                message: `Tọa độ của điểm dừng "${stop.name || stop.order}" ở chiều đi không hợp lệ (-90 <= Lat <= 90, -180 <= Lng <= 180).`,
              });
            }
          }
        }

        req.body.outbound.stops = req.body.outbound.stops.map((stop) => {
          const existing =
            stop._id ? existingStopsById.get(stop._id.toString()) : null;

          const hasLat = isValidCoordinate(stop.lat);
          const hasLng = isValidCoordinate(stop.lng);

          if (existing) {
            return {
              ...stop,
              lat: hasLat ? Number(stop.lat) : (existing.lat ?? null),
              lng: hasLng ? Number(stop.lng) : (existing.lng ?? null),
            };
          }

          return {
            ...stop,
            lat: hasLat ? Number(stop.lat) : null,
            lng: hasLng ? Number(stop.lng) : null,
          };
        });
      }
    }

    // Bảo vệ dữ liệu inbound (geometry và tọa độ điểm dừng)
    if (req.body.inbound) {
      const hasIncomingGeometry =
        req.body.inbound.geometry &&
        Array.isArray(req.body.inbound.geometry.coordinates) &&
        req.body.inbound.geometry.coordinates.length > 0;

      if (!hasIncomingGeometry && existingRoute.inbound?.geometry) {
        req.body.inbound.geometry = {
          type: existingRoute.inbound.geometry.type || "LineString",
          coordinates: existingRoute.inbound.geometry.coordinates || [],
        };
      } else if (hasIncomingGeometry && !req.body.inbound.geometry.type) {
        req.body.inbound.geometry.type = "LineString";
      }

      // Helper kiểm tra tọa độ hợp lệ
      const isValidCoordinate = (val) =>
        val !== undefined &&
        val !== null &&
        typeof val !== "boolean" &&
        String(val).trim() !== "" &&
        !isNaN(Number(val)) &&
        isFinite(Number(val));

      // Bảo toàn tọa độ các điểm dừng hiện có nếu payload không truyền tọa độ mới
      if (
        Array.isArray(req.body.inbound.stops) &&
        Array.isArray(existingRoute.inbound?.stops)
      ) {
        const existingStopsById = new Map();

        existingRoute.inbound.stops.forEach((s) => {
          if (s._id) existingStopsById.set(s._id.toString(), s);
        });

        // Validate tọa độ đầu vào chiều về
        for (const stop of req.body.inbound.stops) {
          const hasLat = isValidCoordinate(stop.lat);
          const hasLng = isValidCoordinate(stop.lng);

          if ((hasLat && !hasLng) || (!hasLat && hasLng)) {
            return res.status(400).json({
              success: false,
              message: `Điểm dừng "${stop.name || stop.order}" ở chiều về phải có đủ cả Vĩ độ và Kinh độ hoặc để trống cả hai.`,
            });
          }

          if (hasLat && hasLng) {
            const numLat = Number(stop.lat);
            const numLng = Number(stop.lng);
            if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
              return res.status(400).json({
                success: false,
                message: `Tọa độ của điểm dừng "${stop.name || stop.order}" ở chiều về không hợp lệ (-90 <= Lat <= 90, -180 <= Lng <= 180).`,
              });
            }
          }
        }

        req.body.inbound.stops = req.body.inbound.stops.map((stop) => {
          const existing =
            stop._id ? existingStopsById.get(stop._id.toString()) : null;

          const hasLat = isValidCoordinate(stop.lat);
          const hasLng = isValidCoordinate(stop.lng);

          if (existing) {
            return {
              ...stop,
              lat: hasLat ? Number(stop.lat) : (existing.lat ?? null),
              lng: hasLng ? Number(stop.lng) : (existing.lng ?? null),
            };
          }

          return {
            ...stop,
            lat: hasLat ? Number(stop.lat) : null,
            lng: hasLng ? Number(stop.lng) : null,
          };
        });
      }
    }

    const route = await BusRoute.findByIdAndUpdate(
      req.params.id, // tìm theo id 
      req.body, // update cái mà user request
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: route,
    });
  } catch (error) {
    next(error);
  }
};

// xóa data
export const deleteRoute = async (req, res, next) => {
  try {
    const route = await BusRoute.findByIdAndDelete(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Đéo tìm được tuyến này !!!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tuyến này biến cụ m đi !!!",
      data: route,
    });
  } catch (error) {
    next(error);
  }
};