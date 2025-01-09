import { Sequelize } from "sequelize";
import dotenv from "dotenv";



dotenv.config({ path: "./.env" });

const db = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_SERVER,
  dialect: process.env.DIALECT,
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
  pool: {
    max: 10, // Increase maximum number of connections in the pool
    min: 2, // Set a minimum number of connections to keep in the pool
    acquire: 10000, // Increase the time Sequelize will wait for a connection to be established
    idle: 15000, // Increase idle time before releasing a connection
  },
});

db.sync({ alter: true }).then(() => console.log("Database synchronized"));
// db.sync({ alter: false }).then(() => console.log("Database synchronized without altering table..."));


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
