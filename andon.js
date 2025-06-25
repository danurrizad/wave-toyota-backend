import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import https from "https";
import fs from "fs";
import path from "path";

import AuthRouter from './routes/AuthRouter.js';
import UserRouter from './routes/UserRouter.js';
import RoleRouter from './routes/RoleRouter.js';

import MaterialRouter from './routes/MaterialRouter.js';
import GentaniRouter from './routes/GentaniRouter.js'
import SetupRouter from './routes/SetupRouter.js'
import SupplyQtyRouter  from './routes/SupplyQtyRouter.js';
import SupplyLocationRouter  from './routes/SupplyLocationRouter.js';
import MonitoringRouter from './routes/MonitoringRouter.js'
import ConsumptionRouter from './routes/History/ConsumptionRouter.js'
import SupplyHistoryRouter from './routes/History/SupplyHistoryRouter.js'

import ScheduleRouter from './routes/ScheduleRouter.js'
import DaysRouter from './routes/DaysRouter.js';
import RatioProdRouter from './routes/RatioProdRouter.js';
import SchedulledConsumption from './controllers/History/SchedulledConsumption.js';
import SchedulledConsumption2 from './controllers/History/SchedulledConsumption2.js';
import ConsumptionClearance from './jobs/ConsumptionClearance.js'

import TestingConsumption from './controllers/History/TestingConsumption.js'
import TestingConsumption2 from './controllers/History/TestingConsumption2.js'

dotenv.config();
const app = express();
const port = process.env.PORT || 5005;
const host = process.env.DB_SERVER || "localhost";

// Mengambil path direktori saat ini dan menghilangkan duplicate C:
let __dirname = path.dirname(new URL(import.meta.url).pathname);
if (process.platform === "win32") {
  __dirname = __dirname.substring(1); // Removes extra leading slash on Windows
}

// Mengambil sertifikat dan kunci
const privateKey = fs.readFileSync(
  path.join(__dirname, "certificates", "server.key"),
  "utf8"
);
const certificate = fs.readFileSync(
  path.join(__dirname, "certificates", "server.crt"),
  "utf8"
);
const credentials = { key: privateKey, cert: certificate };

// setting up cors
app.use(
    cors({
        credentials: true,
        origin: [
            'http://localhost:3000',
            'http://localhost:3005',
            'https://wave-toyota.web.app',
            'https://tmmin-andon-supply.web.app',
            'https://testing-andon-supply.web.app',
            'https://g5xqwfz1-3005.asse.devtunnels.ms'
        ]
    })
)
app.options('*', cors());

app.use(express.json())

// function for consumption using assumption in Gentani
// SchedulledConsumption() // Plant 1
TestingConsumption()
// SchedulledConsumption2() // Plant 2
TestingConsumption2()
ConsumptionClearance()

app.use("/api", AuthRouter);
app.use("/api", UserRouter);

app.use("/api", MaterialRouter)
app.use("/api", GentaniRouter)
app.use("/api", SetupRouter)
app.use("/api", SupplyQtyRouter)
app.use("/api", SupplyLocationRouter)
app.use("/api", MonitoringRouter)
app.use("/api", ConsumptionRouter)
app.use("/api", SupplyHistoryRouter)
app.use("/api", RatioProdRouter)
app.use("/api", RoleRouter)
app.use("/api", DaysRouter)
app.use("/api", ScheduleRouter)

app.get('/', (req, res) => {
  res.send('Successful response.');
});

app.listen(port, () => console.log(`Example app is listening on port ${port}.`));


// Membuat server HTTPS
// https.createServer(credentials, app).listen(port, () => {
//     console.log(`Server running at https://${host}:${port}`);
//   });
