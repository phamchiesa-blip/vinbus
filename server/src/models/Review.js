import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        route: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BusRoute",
            required: true,
        },

        userId: {
            type: String,
            required: true,
            trim: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        comment: {
            type: String,
            required: true,
            trim: true, // sẽ tự bỏ khoảng trắng thừa ở đầu và cuối.
            maxlength: 500,
        },
        images: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;