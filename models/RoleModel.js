import { Sequelize } from "sequelize";
import db from "../utils/Database.js";

const { DataTypes } = Sequelize;

const Role = db.define(
    "Role",
    {
        role_name: {
            type: DataTypes.STRING(25),
            allowNull: false
        }
    },
    {
        freezeTableName: true,
    }
);

export default Role;
