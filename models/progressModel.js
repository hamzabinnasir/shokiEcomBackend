import mongoose from "mongoose"
const progressSchema = new mongoose.Schema({
    isLogin: {
        type: Boolean,
        default: false,
    },

    isDeliveryAddress: {
        type: Boolean,
        default: false,
    },
    isOrderSummary: {
        type: Boolean,
        default: false,
    },
    isPayment: {
        type: Boolean,
        default: false,
    }
});

const progressModel = mongoose.models.progresses || mongoose.model("progress", progressSchema);
export default progressModel;