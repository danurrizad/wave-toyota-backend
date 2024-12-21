import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

export const authenticate = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("REQ HEADERS AUTH :", token)
  if (!token) return res.status(403).send({ message: "No token provided" });

  // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  //   if (err) return res.status(401).send({ message: "Unauthorized" });
  //   req.userId = decoded.id;
  //   next();
  // });
  jwt.verify(token, process.env.JWT_SECRET, async(err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid or expired token" });

    const user = await User.findOne({
      where: {
        id: decoded.id
      }
    })
    res.status(200).json({ message: "Valid token", user: decoded, responseUser: user });
  });
};
