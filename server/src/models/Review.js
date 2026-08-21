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
        },
    },
    {
        timestamps: true,
    }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;