import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },

    lastName: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true,
    },

    profilePic: {
        type: String,
        default: "",
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    cartData: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "cart",
        },
    ],
    orderDetails: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order",
        }
    ],
    productRatingsDetails: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "review",
        }
    ],
}, { timestamps: true });

const userModel = mongoose.models.users || mongoose.model("user", userSchema);
export default userModel;