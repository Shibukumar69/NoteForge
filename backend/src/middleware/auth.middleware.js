import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "noteforge_secret_jwt_key_2025";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Support mock or real user
    let user = null;
    try {
      user = await User.findById(decoded.userId).select("-password");
    } catch {
      // Fallback
    }

    if (!user) {
      user = { _id: decoded.userId, email: decoded.email, name: decoded.name || "Student" };
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired authorization token" });
  }
};
