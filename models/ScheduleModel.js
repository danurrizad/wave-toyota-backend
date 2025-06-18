import { Sequelize } from "sequelize";
import db from "../utils/Database.js";

const { DataTypes } = Sequelize;

const Schedule = db.define(
  "Schedule",
  {
    date: {
        type: DataTypes.DATE,
         primaryKey: true,
        allowNull: false
    },
    plant1: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    plant2: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

export default Schedule;
