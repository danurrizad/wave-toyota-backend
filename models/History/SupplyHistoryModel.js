import { Sequelize } from "sequelize";
import db from "../../utils/Database.js";

import Material from "../MaterialModel.js";

const { DataTypes } = Sequelize

const SupplyHistory = db.define(
    "SupplyHistory", 
    {
        // material_id: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false,
        //     references: {
        //         model: Material,
        //         key: "material_id",
        //     },
        // },
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
            allowNull: false
        },
        supply_by: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        qty_pack: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        qty_uom: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        supply_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        supply_time: {
            type: DataTypes.TIME,
            allowNull: false
        }
    },
    {
        freezeTableName: true
    }
)

    // relation
    // Material.hasOne(SupplyHistory, {foreignKey: "material_id"})
    // SupplyHistory.belongsTo(Material, {foreignKey: "material_id"})
    


export default SupplyHistory