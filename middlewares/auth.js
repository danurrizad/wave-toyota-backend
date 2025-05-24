import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    req.userId = user.id;
    req.user = user;

    res.status(200).json({ message: "Authenticated!", user: decoded, responseUser: user})
    next()
  } catch (err) {
    console.error("Authentication Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


export const authenticateHead = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    // console.log("Token received : ", token)
    if (!token) return res.status(403).json({ message: "No token provided" });

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user exists
    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Attach user info to the request object for use in protected routes
    req.userId = user.id;
    req.user = user;

    next()
  } catch (err) {
    console.error("Authentication Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    // console.log("Token received : ", token)
    if (!token) return res.status(403).json({ message: "No token provided" });

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user exists
    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Attach user info to the request object for use in protected routes
    req.userId = user.id;
    req.user = user;

    if(user.role_name !== "SUPER ADMIN"){
      return res.status(401).json({ message: "Forbidden access!"})
    }
    // next();
    next()
  } catch (err) {
    console.error("Authentication Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};