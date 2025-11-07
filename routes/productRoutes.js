import { createProduct, getAllProducts, getSingleProduct, deleteProduct, updateProduct, rateProduct,getProductRatingsDetails, getUserRatedProducts, allUserRatings, filterProduct, productOrderStatus, searchProducts} from "../controllers/productController.js";
import userAuth from "../middlewares/userAuth.js"
import express from "express";
const productRouter = express.Router();

productRouter.post("/create", createProduct);
productRouter.get("/all", getAllProducts);
productRouter.post("/single", getSingleProduct);
productRouter.post("/delete", deleteProduct);
productRouter.post("/update", updateProduct);
productRouter.post("/rate",userAuth, rateProduct);
productRouter.get("/userRatedProducts",userAuth, getUserRatedProducts);
productRouter.get("/allUserRatings", allUserRatings);
productRouter.post("/filter", filterProduct);
productRouter.post("/getProOrderStatus", productOrderStatus);
productRouter.post("/productRatingsDetails", getProductRatingsDetails);
productRouter.post("/search", searchProducts);

export default productRouter;