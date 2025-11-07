import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
    cartProducts: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
    },
    adder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    size: {
        type: String,
        required: true
    }
}, { 
    timestamps: true
});

// Prevent duplicate items (same product + user + size)
cartSchema.index({ cartProducts: 1, adder: 1, size: 1 }, { unique: true });

const cartModel = mongoose.models.carts || mongoose.model("cart", cartSchema);
export default cartModel;