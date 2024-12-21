import { Sequelize } from "sequelize";
import db from "../utils/Database.js";

const { DataTypes } = Sequelize;

const User = db.define("User", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },{
    indexes: [
        {
            unique: true,
            fields: ["username"]
        },
        {
            unique: true,
            fields: ["email"]
        }
    ]
});  

export default User;
