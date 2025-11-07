import express from "express"
import userAuth from "../middlewares/userAuth.js";
const cartRouter = express.Router();
import { addToCart, updateCart, removeCart, getAllCartItems } from "../controllers/cartController.js";

cartRouter.post("/addToCart", userAuth, addToCart);
cartRouter.post("/update", userAuth, updateCart);
cartRouter.post("/delete", userAuth, removeCart);
cartRouter.post("/all", userAuth, getAllCartItems);


export default cartRouter;