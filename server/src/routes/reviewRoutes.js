import express from 'express'
import { createReview, 
        getReviewsByRoute,
        deleteReview,
        updateReview,
        getAllReviews,
        adminDeleteReview } from '../controllers/reviewController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import authorize from '../middleware/authorize.js'
import uploadReviewImages from "../middleware/reviewUploadMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.post("/:routeId/reviews", authMiddleware, uploadReviewImages.array("images", 5), createReview);
reviewRouter.get("/:routeId/reviews", getReviewsByRoute);
reviewRouter.delete("/:routeId/reviews/:reviewId", authMiddleware, deleteReview);
reviewRouter.put("/:routeId/reviews/:reviewId", authMiddleware, updateReview);

// =========================
// ADMIN
// =========================

// Lấy tất cả review
reviewRouter.get(
  "/admin",
  authMiddleware,
  authorize("admin"),
  getAllReviews
);

// Xóa review
reviewRouter.delete(
  "/admin/:reviewId",
  authMiddleware,
  authorize("admin"),
  adminDeleteReview
);

export default reviewRouter;