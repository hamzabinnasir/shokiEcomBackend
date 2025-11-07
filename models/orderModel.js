import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
    orderId:{
        type: String,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },

    lastName: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true,
    },

    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    zipCode: {
        type: Number,
        required: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    orderCartProducts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "cart",
        }
    ],
    placedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },

    status: {
        type: String,
        enum: ["pending", "placed", "confirmed", "shipped", "delivered", "cancelled", "returned"],
        default: "pending",
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "easyPaisa", "payoneer"],
        default: "cod",
    }
}, { timestamps: true });

const orderModel = mongoose.models.orders || mongoose.model("order", orderSchema);
export default orderModel;