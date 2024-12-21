import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Gentani from "./GentaniModel.js";
import Setup from "./SetupModel.js";
import SupplyQty from "./SupplyQtyModel.js";
import Monitoring from "./MonitoringModel.js";

const { DataTypes } = Sequelize;

const Material = db.define(
    "Material",
    {
        material_id: {
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
        andon_display: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        depth_material: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        supply_line: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        uom: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        // gentani_id: {
        //     type: DataTypes.INTEGER,
        //     allowNull: true,
        //     references: {
        //         model: Gentani,
        //         key: "gentani_id",
        //     },
        // },
        setup_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Setup,
                key: "setup_id",
            },
        },
        supplyQty_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: SupplyQty,
                key: "supplyQty_id"
            }
        },
        monitoring_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Monitoring,
                key: "monitoring_id"
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
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
    }
);

// Define relationships
// Gentani.hasMany(Material, { foreignKey: "gentani_id" })
// Material.belongsTo(Gentani, { foreignKey: "gentani_id"})


// // Add hook to sync changes
Material.addHook("afterUpdate", async (material, options) => {
  const updatedFields = {
    material_desc: material.material_desc,
    plant: material.plant,
    uom: material.uom,
  };

  // Update related Gentani records
  await Gentani.update(updatedFields, {
    where: { 
        material_no: material.material_no,
        plant: material.plant
    },
  });
});


// Relation material-setup
Setup.hasOne(Material, { foreignKey: "setup_id", onDelete: "CASCADE" });
Material.belongsTo(Setup, { foreignKey: "setup_id", onDelete: "CASCADE" });

// Add hook to sync changes
Material.addHook("afterUpdate", async (material, options) => {
    const updatedFields = {
      material_no: material.material_no,
      material_desc: material.material_desc,
      plant: material.plant,
      supply_line: material.supply_line,
    };
  
    await Setup.update(updatedFields, {
        where: { 
            material_no: material.material_no,
            plant: material.plant
        },
    });
  });


// Relation material-supplyQty
SupplyQty.hasOne(Material, { foreignKey: "supplyQty_id", onDelete: "CASCADE" });
Material.belongsTo(SupplyQty, { foreignKey: "supplyQty_id", onDelete: "CASCADE" });

Material.addHook("afterUpdate", async(material, options) => {
    const updatedFields = {
        material_no: material.material_no,
        material_desc: material.material_desc,
        plant: material.plant,
        uom: material.uom
    }

    await SupplyQty.update(updatedFields, {
        where: { 
            material_no: material.material_no,
            plant: material.plant
        },
    })
})


// Relation material-monitoring
Monitoring.hasOne(Material, { foreignKey: "monitoring_id", onDelete: "CASCADE" });
Material.belongsTo(Monitoring, { foreignKey: "monitoring_id", onDelete: "CASCADE" });

Material.addHook("afterUpdate", async(material, options) => {
    const updatedFields = {
        material_no: material.material_no,
        material_desc: material.material_desc,
        plant: material.plant,
    }

    await Monitoring.update(updatedFields, {
        where: { 
            material_no: material.material_no,
            plant: material.plant
        },
    })
})


// SetupRelation.hasOne(Material, {foreignKey: "material_id"})
// Material.belongsTo(SetupRelation, {foreignKey: "material_id"})

// Material.addHook("afterCreate", async(material, options) => {
//     const updatedFields = {
//         material_no: material.material_no,
//         material_desc: material.material_desc,
//         plant: material.plant,
//         supply_line: material.supply_line,
//         created_by: material.created_by,
//         created_at: material.created_at
//     }
    
//     await SetupRelation.create(updatedFields, {
//         where: {
//             material_no: material.material_no
//         }
//     })
// })



export default Material;
