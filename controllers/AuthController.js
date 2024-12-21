import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    if(!username || !password){
      return res.status(400).json({ message: "Please fill out all of the forms!"})
    }
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).send({ message: "Invalid username or password!" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).send({ message: "Invalid username or password!" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token: token });
  } catch (error) {
    console.log("ERROR :", error)
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  res.send({ message: "Logged out successfully" });
};
