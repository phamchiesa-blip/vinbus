import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from '../config/cloudinary.js'

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "vinbus/reviews",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const uploadReviewImages = multer({
  storage,
  limits: {
    files: 5, // tối đa 5 ảnh
    fileSize: 5 * 1024 * 1024, // mỗi ảnh tối đa 5MB.
  },
});

export default uploadReviewImages;