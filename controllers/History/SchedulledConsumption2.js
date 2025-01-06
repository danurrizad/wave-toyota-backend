import cron from "node-cron";
import moment from "moment-timezone";
import { Op } from "sequelize";

import Gentani from "../../models/GentaniModel.js";
import Setup from "../../models/SetupModel.js";
import Consumption from "../../models/History/ConsumptionModel.js";
import RatioProd from './../../models/RatioProdModel.js';

const SchedulledConsumption2 = async () => {
    const isWithinRange = () => {
        const now = moment().tz("Asia/Jakarta");
        const dayOfWeek = now.isoWeekday();

        const defaultTimeRanges = [
            { start: "07:15", end: "09:30" },
            { start: "09:40", end: "11:45" },
            { start: "12:30", end: "14:30" },
            { start: "14:40", end: "16:00" },
        ];

        const fridayTimeRanges = [
            { start: "07:15", end: "09:30" },
            { start: "09:40", end: "11:45" },
            { start: "13:00", end: "14:30" },
            { start: "14:40", end: "16:30" },
        ];

        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const currentTime = now.format("HH:mm");
            const timeRanges = dayOfWeek === 5 ? fridayTimeRanges : defaultTimeRanges;

            return timeRanges.some(({ start, end }) => {
                return currentTime >= start && currentTime <= end;
            });
        }

        return false;
    };

    const getRatios = async () => {
        const ratioProd = await RatioProd.findOne({ where: { ratio_id: 1 } });
        return {
            avanza: ratioProd.avanza,
            yaris: ratioProd.yaris,
            calya: ratioProd.calya,
        };
    };

    const getNextUnit = (() => {
        let unitQueue = [];
        return (totalUnits, ratios) => {
            if (unitQueue.length === 0) {
                const avanzaUnits = Math.floor(totalUnits * (ratios.avanza / 100));
                const yarisUnits = Math.floor(totalUnits * (ratios.yaris / 100));
                const calyaUnits = Math.floor(totalUnits * (ratios.calya / 100));
                
                unitQueue = [
                    ...Array(avanzaUnits).fill("Avanza"),
                    ...Array(yarisUnits).fill("Yaris"),
                    ...Array(calyaUnits).fill("Calya"),
                ];
            }
            return unitQueue.shift(); // Dequeue the next unit
        };
    })();

    const createConsumptionCalculation = async () => {
        try {
            const ratios = await getRatios();
            const totalUnitsPerDay = 230; // Example: total units made in a day
            const time = moment().tz("Asia/Jakarta");
            const unit = getNextUnit(totalUnitsPerDay, ratios); // Get the next unit

            const setup = await Setup.findAll({
                where: {
                    total: {
                        [Op.gt]: 0,
                    },
                },
            });
            
            // Dynamically fetch `Gentani` data based on the current unit
                const gentani = await Gentani.findAll({
                    where: {
                        [`quantity_${unit.toLowerCase()}`]: { [Op.gt]: 0 }, // Query based on the unit's specific quantity field
                    },
                });

            const setupsFound = setup.map((index) => index.dataValues);
            const gentanisFound = gentani.map((index) => index.dataValues);

            gentanisFound.forEach(async (gentaniItem) => {
                setupsFound.forEach(async (setupItem) => {
                    if (
                        setupItem.material_no === gentaniItem.material_no &&
                        setupItem.plant === gentaniItem.plant
                    ){
                         // Use the appropriate field for quantity based on the unit
                         const unitQuantityField = `quantity_${unit.toLowerCase()}`;
                         const quantityForUnit = gentaniItem[unitQuantityField] || 0;
 
                         // Calculate the new total for the unit
                         const tempTotal = Math.round((setupItem.total - quantityForUnit) * 100) / 100;
                         const newTotal = tempTotal < 0 ? 0 : tempTotal;
 
                         await Setup.update(
                             { total: newTotal },
                             { where: { setup_id: setupItem.setup_id } }
                         );
 
                         await Consumption.create({
                             material_no: gentaniItem.material_no,
                             material_desc: gentaniItem.material_desc,
                             plant: gentaniItem.plant,
                             consumption_date: time.format("YYYY-MM-DD"),
                             consumption_time: time.format("YYYY-MM-DD HH:mm:ss"),
                             katashiki: gentaniItem.katashiki,
                             vin_no: "-",
                             body_seq: "-",
                             initial_stock: setupItem.total,
                             final_stock: newTotal,
                             qty: quantityForUnit, // Log the specific unit consumption
                             unit: unit, // Add the unit column
                         });
                    }
                })
            })
            
        } catch (error) {
            console.error("Error during consumption calculation:", error);
            return null;
        }
    };

    cron.schedule("*/2 * * * *", async () => {
        try {
            if (isWithinRange()) {
                await createConsumptionCalculation();
            }
        } catch (error) {
            console.error("Error in scheduled job execution:", error);
        }
    });

    console.log("Scheduled jobs initialized.");
};

export default SchedulledConsumption2;
