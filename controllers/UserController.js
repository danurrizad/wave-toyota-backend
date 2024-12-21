import bcrypt from "bcrypt";
import User from "../models/UserModel.js";

export const registerUser = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    if(!username || !password || !email){
      return res.status(404).json({ message: "Please fill out all of the forms!"})
    }
    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await User.findOne({
      where: { email },
    });

    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    if(password.length < 6){
      return res.status(400).json({ message: "Password should be at least 6 character long"})
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
    });

    // Optional: Automatically log in the user after registration
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.send(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
