import { Sequelize } from "sequelize";
import db from "../utils/Database.js";

const { DataTypes } = Sequelize;

const Monitoring = db.define(
    "Monitoring",
    {
        monitoring_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        material_no: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        material_desc: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        plant: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        visualization_name: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        created_by: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        updated_by: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
    }
);



export default Monitoring;
