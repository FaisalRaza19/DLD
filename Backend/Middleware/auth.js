import jwt from "jsonwebtoken"
import { User } from "../Models/User.model.js"

export const verify_token = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token) {
            return res.status(400).json({ statusCode: 400, message: "Token is required" })
        }
        // compare token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            return res.status(400).json({ statusCode: 400, message: "Token is invalid or expired" });
        }
        //find the user
        const user = await User.findById(decoded.id).select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({ statusCode: 400, message: "Unauthorized request, user not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Internal server error" })
    }
}