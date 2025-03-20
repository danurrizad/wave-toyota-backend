import cron from "node-cron";
import { Op } from "sequelize";
import Consumption from "../models/History/ConsumptionModel.js";

const ConsumptionClearance = () => {

  // Schedule the job to run every Sunday at 00:00
  cron.schedule("0 0 * * 0", async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const deletedCount = await Consumption.destroy({
        where: {
          consumptionDate: {
            [Op.lt]: sevenDaysAgo,
          },
        },
      });
      
      console.log(`Deleted ${deletedCount} old transactions.`);
    } catch (error) {
      console.error("Error deleting old transactions:", error);
    }
  });
  
  console.log("Cron job scheduled to delete old transactions every Sunday at midnight.");
}

export default ConsumptionClearance