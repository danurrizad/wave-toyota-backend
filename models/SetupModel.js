import { Sequelize } from "sequelize";
import db from "../utils/Database.js";

const { DataTypes } = Sequelize;

const Setup = db.define(
    "Setup",
    {
        setup_id: {
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
        supply_line: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        standard_supply: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        critical_stock: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        total: {
            type: DataTypes.DECIMAL(10, 4),
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
        changed_date: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        freezeTableName: true,
        timestamps: true,
    }
);

// // Define relationships
// Gentani.hasMany(Material, { foreignKey: "gentani_id" });
// Material.belongsTo(Gentani, { foreignKey: "gentani_id" });

// // Add hook to sync changes
// Material.addHook("afterUpdate", async (material, options) => {
//   const updatedFields = {
//     material_desc: material.material_desc,
//     plant: material.plant,
//     uom: material.uom,
//   };

//   // Update related Gentani records
//   await Gentani.update(updatedFields, {
//     where: { material_no: material.material_no },
//   });
// });


export default Setup;
