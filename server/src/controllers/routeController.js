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
    const route = await BusRoute.findByIdAndUpdate(
      req.params.id, // tìm theo id 
      req.body, // update cái mà user request
      {
        new: true, // Nếu không có cái này, Mongoose có thể trả về document cũ trước khi update.
        runValidators: true,
      }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Đéo tìm được tuyến này !!!",
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