import express from "express"
import userAuth from "../middlewares/userAuth.js"
import { makeProgress } from "../controllers/progressController.js";
const progressRouter = express.Router();

progressRouter.post("/makeProgress",userAuth, makeProgress);

export default progressRouter;