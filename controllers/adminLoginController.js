import validator from "validator";
import jwt from "jsonwebtoken";
const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ success: false, message: "All field are required" });
    }

    if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Please enter a valid Email" });
    }

    if (password.length < 8) {
        return res.json({ success: false, message: "Please enter a valid password" });
    }

    if (email !== process.env.ADMINEMAIL || password !== process.env.ADMINPASSWORD) {
        return res.json({ success: false, message: "Not Authorized Login Again" });
    }

    let token = jwt.sign({ email: email }, process.env.JWT_SECRET);
    res.json({ success: true, token });

}

export { adminLogin };