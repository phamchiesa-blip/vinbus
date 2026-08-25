import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// Tạo JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// =======================
// REGISTER
// =======================
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra user đã tồn tại chưa
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Tạo token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};


// =======================
// LOGIN
// =======================
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Phải select password vì User model đang select: false
    const user = await User.findOne({ email }).select("+password");

    // Không tìm thấy user
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email này chưa được dùng để đăng kí",
      });
    }

    // So sánh password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu không đúng",
      });
    }

    // Tạo token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

//  Avatar
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ảnh.",
      });
    }

    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        avatar: req.file.path, // URL ảnh Cloudinary trả về
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Cập nhật ảnh đại diện thành công.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};