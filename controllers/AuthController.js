import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

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

    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store the refresh token (e.g., in the database or memory)
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Use this in production
      sameSite: "Strict",
    });

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.log("ERROR :", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAuth = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).send({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.status(401).send({ message: "Unauthorized" });

      const user = await User.findOne({ where: { id: decoded.id } });
      if (!user) return res.status(404).send({ message: "User not found" });

      res.status(200).send({
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles, // Add any additional user data
      });
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const { accessToken, newRefreshToken } = generateTokens(user.id);
    user.refreshToken = newRefreshToken; // Update refresh token
    await user.save();

    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

export const logout = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const user = await User.findOne({ where: { refreshToken } });
    if (user) {
      user.refreshToken = null; // Clear the refresh token
      await user.save();
    }
    res.send({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};












// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import User from "../models/UserModel.js";

// export const login = async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     if(!username || !password){
//       return res.status(400).json({ message: "Please fill out all of the forms!"})
//     }
//     const user = await User.findOne({ where: { username } });
//     if (!user) return res.status(404).send({ message: "Invalid username or password!" });

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) return res.status(401).send({ message: "Invalid username or password!" });

//     const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
//     res.status(200).json({ token: token });
//   } catch (error) {
//     console.log("ERROR :", error)
//     res.status(500).json({ message: error.message });
//   }
// };

// export const logout = (req, res) => {
//   res.send({ message: "Logged out successfully" });
// };
