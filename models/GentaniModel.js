// import { Sequelize } from "sequelize";
// import db from "../utils/Database.js";

// const { DataTypes } = Sequelize;

// const Gentani = db.define(
//   "Gentani",
//   {
//     // gentani_id: {
//     //   type: DataTypes.INTEGER,
//     //   allowNull: false,
//     //   autoIncrement: true,
//     //   primaryKey: true,
//     // },
//     katashiki: {
//       type: DataTypes.STRING(50),
//       allowNull: false
//     },
//     quantity: {
//       type: DataTypes.FLOAT,
//       allowNull: false
//     }
//   }
// )

// export default Gentani



import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Material from "./MaterialModel.js";

const { DataTypes } = Sequelize;

const Gentani = db.define(
  "Gentani",
  {
    gentani_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    katashiki: {
      type: DataTypes.STRING(50),
      allowNull: true,
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
    uom: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    material_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Material,
        key: "material_id"
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

// Material.belongsTo(Gentani, { foreignKey: "gentani_id" });
Material.hasMany(Gentani, { foreignKey: "material_id", onDelete: "CASCADE" });
Gentani.belongsTo(Material, { foreignKey: "material_id" });

export default Gentani;
