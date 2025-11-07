import progressModel from "../models/progressModel.js";
const makeProgress = async (req, res) => {
    try{
        let { userId, isDeliveryAddress, isOrderSummary, isPayment } = req.body;

    let query = {isDeliveryAddress, isOrderSummary, isPayment};
    if(userId){
        query.isLogin = true;
    }else{
        query.isLogin = false;
    }

    let progress = await progressModel.create(query);
    return res.status({success: true, progress});
    }catch(error){
        return res.status(500).json({success: false, message: "Internal Server Error"});
        console.log(error);
    }
}

export { makeProgress };