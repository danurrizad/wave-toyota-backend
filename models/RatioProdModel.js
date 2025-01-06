import { Sequelize } from "sequelize";
import db from "../utils/Database.js";

const { DataTypes } = Sequelize;

const RatioProd = db.define(
    "RatioProd",
    {
        ratio_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
        fortuner: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        zenix: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        innova: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        avanza: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        yaris: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        calya: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
    }
);



export default RatioProd;
