import { adminLogin } from "../controllers/adminLoginController.js";
import express from "express";
const adminRouter = express.Router();

adminRouter.get("/login" , adminLogin);

export default adminRouter;