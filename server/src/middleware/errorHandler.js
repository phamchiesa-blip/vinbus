const errorHandler = (err, req, res, next) => {
  console.error(err);

  // ObjectId không hợp lệ
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID",
    });
  }

  // Dữ liệu không hợp lệ theo Schema
  if (err.name === "ValidationError") {
  const errors = {};

  Object.keys(err.errors).forEach((field) => {
    errors[field] = err.errors[field].message;
  });

  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors,
  });
  }

  // Lỗi trùng lặp khi update data
  if (err.code === 11000) {
  const field = Object.keys(err.keyValue)[0];

  return res.status(409).json({
    success: false,
    message: `${field} already exists`,
  });
  }

  // Các lỗi khác
  res.status(err.statusCode || 500).json({
    message: err.message || "Server Error",
  });
};

export default errorHandler;