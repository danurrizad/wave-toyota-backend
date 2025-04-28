import bcrypt from "bcrypt";
import User from "../models/UserModel.js";
import Role from "../models/RoleModel.js";

export const registerUser = async (req, res) => {
  const { username, email, roleId } = req.body;

  try {
    if(!username || !email ||!roleId){
      return res.status(400).json({ message: "Please fill out all of the forms!"})
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

    const role = await Role.findOne({ where: { id: roleId}})
    if(!role){
      return res.status(400).json({ message: "Failed to register! Incorrect Role!"})
    }

    // Hash the default password for "toyota123"
    const hashedPassword = await bcrypt.hash("toyota123", 10);

    // Create the user
    const newUser = await User.create({
      username: username,
      password: hashedPassword,
      email: email,
      roleId: role.id,
      role_name: role.role_name
    });

    // Optional: Automatically log in the user after registration
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        roleId: newUser.roleId
      },
    });
  } catch (error) {
    console.log("ERROR :", error)
    res.status(500).json({ message: "Internal server error!", error: error.message})
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ data: users});
  } catch (error) {
    res.status(500).json({ message: "Internal server error!", error: error.message})

  }
};

export const updateUserById = async(req, res) => {
  try {
    const { roleId } = req.body
  const userId = req.params.userId

  if(!roleId){
    return res.status(400).json({ message: "Please provide role!"})
  }
  if(!userId){
    return res.status(400).json({ message: "Please provide user ID"})
  }
  const foundRole = await Role.findOne({ 
    where: {
      id: roleId
    }
  })
  if(!foundRole){
    return res.status(404).json({ message: "Can't find role!"})
  }
  const foundUser = await User.findOne({
    where: {
      id: userId
    }
  })
  if(!foundUser){
    return res.status(404).json({ message: "Can't find user!"})
  }
  await User.update({
    roleId: foundRole.id,
    role_name: foundRole.role_name
  },{
    where: {
      id: userId
    }
  }) 
  res.status(201).json({ message: "Role user updated!"})
  } catch (error) {
    res.status(500).json({ message: "Internal server error!", error: error.message})
  }
}

export const deleteUserById = async(req, res) => {
  try {
    const id = req.params.userId
    if(!id){
      return res.status(400).json({ message: "Please provide user ID!"})
    }
    const userFound = await User.findOne({ 
      where: { id: id }
    })
    if(!userFound){
      return res.status(404).json({ message: "User not found" })
    }
    await User.destroy({
      where: { id: id }
    })
    res.status(200).json({ message: "User deleted!" })
  } catch (error) {
    console.log("error: ", error)
    res.status(500).json({ message: "Internal server error!" })
  }
}