import mongoose from "mongoose";
const reviewSchema = new mongoose.Schema({
    title: {
        type: String,
    },

    description: {
        type: String,
    },
    ratings: {
        type: Number,
        default: 0,
        min: 1,
        max: 5,
    },
    ratedProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
    },
    raterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const reviewModel = mongoose.models.reviews || mongoose.model("review", reviewSchema);
export default reviewModel;