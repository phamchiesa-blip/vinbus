import Review from "../models/Review.js";
import BusRoute from '../models/BusRoute.js'
import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/express";

// Tạo review
export const createReview = async (req, res, next) => {
    try {
        const {routeId} = req.params;
        const {rating, comment} = req.body;

        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // KT tuyến có tồn tại ko
        const route = await BusRoute.findById(routeId);
        if(!routeId) {
            return res.status(404).json({
                success: false,
                message: "Đéo thấy tuyến này !!!"
            });
        }

        // Tạo Review
        const review = await Review.create({
            route: routeId,
            userId,
            rating,
            comment
        });

        res.status(201).json({
            success: true,
            data: review,
        });

    } catch (error) {
        next(error);
    }
}

// Lấy hết review của 1 tuyến nào đó theo id
export const getReviewsByRoute = async (req, res, next) => {
    try {
        const { routeId } = req.params;

        // Kiểm tra tuyến xe có tồn tại không
        const route = await BusRoute.findById(routeId);

        if (!route) {
            return res.status(404).json({
                success: false,
                message: "Đéo thấy tuyến này !!!",
            });
        }

        // Lấy tất cả review của tuyến xe này
        const reviews = await Review.find({
            route: routeId,
        });

        const totalReviews = reviews.length;

         const totalRating = reviews.reduce(
            (sum, review) => sum + review.rating,
            0
        );

        const averageRating =
            totalReviews > 0
                ? Number(
                      (totalRating / totalReviews).toFixed(1)
                  )
                : 0;

        // Lấy thông tin user 
        const reviewsWithUser = await Promise.all(
    reviews.map(async (review) => {
        const user = await clerkClient.users.getUser(
            review.userId
        );

        return {
            ...review.toObject(),

            user: {
                id: user.id,
                name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                avatar: user.imageUrl,
            },
        };
    })
    );

        res.status(200).json({
            success: true,
            summary: {
                averageRating,
                totalReviews,
            },
            data: reviewsWithUser,
        });

    } catch (error) {
        next(error);
    }
};

// User xóa review
export const deleteReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;

        const { userId } = getAuth(req);

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        // Kiểm tra review có phải của user hiện tại không
        if (review.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "Mày chỉ được xóa cmt của mày thôi chó ngu ạ!",
            });
        }

        await Review.findByIdAndDelete(reviewId);

        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        });

    } catch (error) {
        next(error);
    }
};

// User sửa review của mình
export const updateReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const { userId } = getAuth(req);

        const { rating, comment } = req.body;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Không thấy review",
            });
        }

        // Chỉ chủ review mới được sửa
        if (review.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own review",
            });
        }

        review.rating = rating;
        review.comment = comment;

        await review.save();

        res.status(200).json({
            success: true,
            data: review,
        });
    } catch (error) {
        next(error);
    }
};