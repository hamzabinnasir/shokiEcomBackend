import cartModel from "../models/cartModel.js";
import userModel from "../models/userModel.js";

// Utility function to get user cart with proper population
const getUserCart = async (userId) => {
    return await userModel.findById(userId)
        .populate({
            path: "cartData",
            populate: { 
                path: "cartProducts",
                model: "product"
            }
        })
        .select("cartData");
};

const addToCart = async (req, res) => {
    try {
        const { userId } = req.body;
        const { productId, quantity = 1, size } = req.body;

        // Validation
        if (!userId) return res.status(401).json({ success: false, message: "User not authenticated" });
        if (!productId) return res.status(400).json({ success: false, message: "Product required" });
        if (!size) return res.status(400).json({ success: false, message: "Size selection required" });

        // Find or create cart item
        let cartItem = await cartModel.findOneAndUpdate(
            { 
                cartProducts: productId, 
                adder: userId, 
                size: size 
            },
            { 
                $inc: { quantity: Math.max(1, quantity) } 
            },
            { 
                new: true, 
                upsert: true,
                runValidators: true 
            }
        );

        // Add to user's cartData if not already present
        await userModel.findByIdAndUpdate(userId, {
            $addToSet: { cartData: cartItem._id }
        });

        const findedUserCartData = await getUserCart(userId);

        return res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            findedUserCartData,
        });

    } catch (error) {
        console.error("AddToCart Error:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "Item already in cart" 
            });
        }
        
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

const updateCart = async (req, res) => {
    try {
        const { userId } = req.body;
        const { productId, size, quantity } = req.body;

        if (!userId) return res.status(401).json({ success: false, message: "User not authenticated" });
        if (!productId || !size) return res.status(400).json({ success: false, message: "Product and size required" });

        const parsedQuantity = parseInt(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity < 0) {
            return res.status(400).json({ success: false, message: "Invalid quantity" });
        }

        if (parsedQuantity === 0) {
            // Remove item if quantity is 0
            return await removeCart(req, res);
        }

        const cartItem = await cartModel.findOneAndUpdate(
            { 
                cartProducts: productId, 
                adder: userId, 
                size: size 
            },
            { quantity: parsedQuantity },
            { new: true, runValidators: true }
        );

        if (!cartItem) {
            return res.status(404).json({ success: false, message: "Cart item not found" });
        }

        const findedUserCartData = await getUserCart(userId);
        return res.status(200).json({ success: true, findedUserCartData });

    } catch (error) {
        console.error("UpdateCart Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const removeCart = async (req, res) => {
    try {
        const { userId } = req.body;
        const { productId, size } = req.body;
        console.log(productId, size)

        if (!userId) return res.status(401).json({ success: false, message: "User not authenticated" });
        if (!productId || !size) return res.status(400).json({ success: false, message: "Product and size required" });

        const cartItem = await cartModel.findOneAndDelete({
            cartProducts: productId,
            adder: userId,
            size: size
        });

        if (!cartItem) {
            return res.status(404).json({ success: false, message: "Cart item not found" });
        }

        // Remove from user's cartData array
        await userModel.findByIdAndUpdate(userId, {
            $pull: { cartData: cartItem._id }
        });

        const findedUserCartData = await getUserCart(userId);

        return res.status(200).json({
            success: true,
            message: "Item removed from cart",
            findedUserCartData
        });

    } catch (error) {
        console.error("RemoveCart Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const getAllCartItems = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const findedUserCartData = await getUserCart(userId);
        const cartItems = findedUserCartData?.cartData || [];

        return res.status(200).json({ 
            success: true, 
            findedUserCartData: {
                cartData: cartItems
            },
            message: cartItems.length === 0 ? "Cart is empty" : "Cart items retrieved successfully"
        });

    } catch (error) {
        console.error("GetAllCartItems Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export { addToCart, updateCart, removeCart, getAllCartItems };