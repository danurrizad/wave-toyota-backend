import { Sequelize } from "sequelize";
import db from "../utils/Database.js";

const { DataTypes } = Sequelize;

const SupplyQty = db.define(
    "SupplyQty",
    {
        supplyQty_id: {
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
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        plant: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        qty: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        uom: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        pack: {
            type: DataTypes.STRING(20),
            allowNull: true,
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



export default SupplyQty;
