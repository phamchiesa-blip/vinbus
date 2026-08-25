import express from 'express'
import { createReview, 
        getReviewsByRoute,
        deleteReview,
        updateReview } from '../controllers/reviewController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const reviewRouter = express.Router();

reviewRouter.post("/:routeId/reviews", authMiddleware, createReview);
reviewRouter.get("/:routeId/reviews", getReviewsByRoute);
reviewRouter.delete("/:routeId/reviews/:reviewId", authMiddleware, deleteReview);
reviewRouter.put("/:routeId/reviews/:reviewId", authMiddleware, updateReview);

export default reviewRouter;