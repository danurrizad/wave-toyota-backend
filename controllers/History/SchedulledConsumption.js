import cron from "node-cron";
import moment from "moment-timezone";
import { Op } from "sequelize";

import Gentani from "../../models/GentaniModel.js";
import Setup from "../../models/SetupModel.js";
import Consumption from "../../models/History/ConsumptionModel.js";

const SchedulledConsumption = async () => {
    const isWithinRange = () => {
        const now = moment().tz("Asia/Jakarta");
        const dayOfWeek = now.isoWeekday();
    
        // Default time ranges for Monday to Thursday
        const defaultTimeRanges = [
            { start: "07:15", end: "09:30" },
            { start: "09:40", end: "11:45" },
            { start: "12:30", end: "14:30" },
            { start: "14:40", end: "16:00" },
        ];
    
        // Time ranges for Friday
        const fridayTimeRanges = [
            { start: "07:15", end: "09:30" },
            { start: "09:40", end: "11:45" },
            { start: "13:00", end: "14:30" },
            { start: "14:40", end: "16:30" },
        ];
    
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const currentTime = now.format("HH:mm");
    
            // Use Friday's time ranges if today is Friday, otherwise default ranges
            const timeRanges = dayOfWeek === 5 ? fridayTimeRanges : defaultTimeRanges;
    
            return timeRanges.some(({ start, end }) => {
                return currentTime >= start && currentTime <= end;
            });
        }
    
        return false;
    };
    

    const createConsumptionCalculation = async () => {
        try {
            const setup = await Setup.findAll({
                where: {
                    total: {
                        [Op.gt]: 0 
                    }
                }
            });
            const gentani = await Gentani.findAll({
                where: {
                    quantity: {
                        [Op.gt]: 0 
                    }
                }
            });

            const time = moment().tz("Asia/Jakarta");

            const setupsFound = setup.map(index => index.dataValues);
            const gentanisFound = gentani.map(index => index.dataValues);

            gentanisFound.forEach(async(gentani, index) => {
                setupsFound.forEach(async(setup, index) => {
                    if(setup.material_no === gentani.material_no && setup.plant === gentani.plant){
                        // console.log("matches!. index: ", index)
                        const tempTotal = Math.round(setup.total - gentani.quantity)
                        const newTotal = tempTotal < 0 ? 0 : tempTotal
                        await Setup.update({
                            total: newTotal
                        },{
                            where: {
                                setup_id: setup.setup_id
                            }
                        })
        
                        await Consumption.create({
                            material_no: gentani.material_no,
                            material_desc: gentani.material_desc,
                            consumption_date: time.format("YYYY-MM-DD"), // Format date as YYYY-MM-DD
                            consumption_time: time.format("YYYY-MM-DD HH:mm:ss"), // Format datetime as YYYY-MM-DD HH:mm:ss
                            katashiki: gentani.katashiki,
                            vin_no: "-",
                            body_seq: "-",
                            initial_stock: setup.total,
                            final_stock: newTotal,
                            qty: gentani.quantity
                        })
                    }
                })
            });
        } catch (error) {
            console.error("Error during consumption calculation:", error);
            return null;
        }
    };

    // run every 1 minute (* * * * *)
    cron.schedule("*/2 * * * *", async () => {
        try {
            if (isWithinRange()) {
                // const running = await createConsumptionCalculation();
                await createConsumptionCalculation();
            }
        } catch (error) {
            console.error("Error in scheduled job execution:", error);
        }
    });

    console.log("Scheduled jobs initialized.");
};

export default SchedulledConsumption;
