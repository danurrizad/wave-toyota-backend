import { Sequelize } from "sequelize";
import db from "../utils/Database.js";
import Role from "./RoleModel.js";

const { DataTypes } = Sequelize;

const User = db.define("User", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: Role, // Reference Role model
        key: "id",
      },
    },
    role_name: {
      type: DataTypes.STRING(25), // Duplicate role_name column
      allowNull: false,
    },
  },{
    indexes: [
        {
            unique: true,
            fields: ["username"]
        },
        {
            unique: true,
            fields: ["email"]
        }
    ]
});  

// Define relationships
Role.hasMany(User, { foreignKey: "roleId" }); // Role has many Users
User.belongsTo(Role, { foreignKey: "roleId" }); // User belongs to Role

// Add hook to sync changes
User.addHook("afterCreate", async (user, options) => {
  const role = await Role.findOne({ where: { id: user.roleId}})

  await User.update(
    {
    role_name: role.role_name
  }, {
      where: { 
          id: user.id
      },
  });
});

// User.afterCreate(async (user, options) => {
//   const role = await Role.findByPk(user.roleId);
//   if (role) {
//     user.role_name = role.role_name;
//   }
// });

// User.beforeUpdate(async (user, options) => {
//   const role = await Role.findByPk(user.roleId);
//   if (role) {
//     user.role_name = role.role_name;
//   }
// });


export default User;
