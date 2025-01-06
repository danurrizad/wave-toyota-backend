import db from "../../utils/Database.js";
import { Sequelize } from "sequelize";

const { DataTypes } = Sequelize

const Consumption = db.define(
    "Consumption",
    {
        material_no: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        material_desc: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        plant: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        consumption_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        consumption_time: {
            type: DataTypes.DATE,
            allowNull: false
        }, 
        unit: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        katashiki: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        vin_no: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        body_seq: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        initial_stock: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        final_stock: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        qty: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    },
    {
        freezeTableName: true,
      }
)

export default Consumption