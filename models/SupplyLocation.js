import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Material from "./MaterialModel.js";

const { DataTypes } = Sequelize;

const SupplyLocation = db.define(
    "SupplyLocation",
    {
        location_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        plant: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        material_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Material',
                key: "material_id",
            }
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

// SupplyLocation.belongsTo(Material, { foreignKey: 'material_id' });


export default SupplyLocation;
