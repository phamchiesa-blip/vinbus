import express from 'express'
import { createReview, 
        getReviewsByRoute,
        deleteReview,
        updateReview } from '../controllers/reviewController.js'

const reviewRouter = express.Router();

reviewRouter.post("/:routeId/reviews", createReview);
reviewRouter.get("/:routeId/reviews", getReviewsByRoute);
reviewRouter.delete("/:routeId/reviews", deleteReview);
reviewRouter.put("/:routeId/reviews", updateReview);

export default reviewRouter;