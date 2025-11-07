dotenv.config();
import express from "express"
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/ConnectDB.js";
import userRouter from "./routes/userRouter.js"
import productRouter from "./routes/productRoutes.js";
import adminRouter from "./routes/adminRoute.js";
import cartRouter from "./routes/cartRouter.js";
import orderRouter from "./routes/orderRouter.js";
import progressRouter from "./routes/progressRouter.js";

const app = express()
app.use(cors());


// Database Connection
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const homeRoute = async (req, res) => {
    try {
        res.status(200).send("API Working");
    } catch (error) {
        res.status(500).json({ success: false, message: "Internel Server Error" });
    }
}

app.get("/", homeRoute);
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/admin" , adminRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/progress", progressRouter);

const port = 4000 || process.env.PORT;
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
