import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Material from "./MaterialModel.js";

const { DataTypes } = Sequelize;

const Days = db.define(
  "Days",
  {
    plant1_monday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    plant1_tuesday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    plant1_wednesday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    plant1_thursday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    plant1_friday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    plant1_saturday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    plant1_sunday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    plant2_monday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    plant2_tuesday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    plant2_wednesday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    plant2_thursday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    plant2_friday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    plant2_saturday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    plant2_sunday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

export default Days;
