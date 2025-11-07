import jwt from "jsonwebtoken";
const userAuth = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.json({ success: false, message: "Not Authorized Login Again" });
        }

        let token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = token_decode.userId;
        next();
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
}
export default userAuth;