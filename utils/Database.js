import { Sequelize } from "sequelize";
import dotenv from "dotenv";



dotenv.config({ path: "./.env" });

const db = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_SERVER,
  dialect: process.env.DIALECT,
//   logging: false,
  timezone: "+07:00",
    // port: 1433,
  dialectOptions: {
    options: {
      encrypt: false, // Set true jika menggunakan jaringan encrypt
      trustServerCertificate: true,
      requestTimeout: 30000,
    //   instanceName: "SQLEXPRESS"
    },
  },
});

// db.sync({ alter: true }).then(() => console.log("Database synchronized"));
db.sync({ alter: false }).then(() => console.log("Database synchronized without altering table..."));


export default db;

// To test the connection
db.authenticate()
  .then(() => {
    console.log(`Connection has been established successfully in database ${process.env.DB_DATABASE}.`);
  })
  .catch((err) => {
    console.log(process.env.DB_DATABASE)
    console.log(process.env.DB_USER)
    console.log(process.env.DB_SERVER)
    console.error("Unable to connect to the database:", err);
  });
