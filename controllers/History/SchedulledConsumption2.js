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

        if (dayOfWeek >= 1 && dayOfWeek <= 6) {
            const currentTime = now.format("HH:mm");
            const timeRanges = dayOfWeek === 6 ? fridayTimeRanges : defaultTimeRanges;

            return timeRanges.some(({ start, end }) => {
                return currentTime >= start && currentTime <= end;
            });
        }

        return false;
    };

    const getRatios = async () => {
        const ratioProd = await RatioProd.findOne({ where: { id_production: 1 } });
        // const ratioProd = await RatioProd.findAll();
        // if(!ratioProd || ratioProd === null){
        //     const initialRatio = await RatioProd.create({
        //         id_production: 1,
        //         fortuner: 0,
        //         zenix: 0,
        //         innova: 0,
        //         tact_time_1: 0,
        //         efficiency_1: 0,
        //         avanza: 0,
        //         yaris: 0,
        //         calya: 0,
        //         tact_time_2: 0,
        //         efficiency_2: 0
        //     })
        //     return{
        //         avanza: initialRatio.avanza,
        //         yaris: initialRatio.yaris,
        //         calya: initialRatio.calya,
        //         tact_time_2: initialRatio.tact_time_2,
        //         efficiency_2: initialRatio.efficiency_2
        //     }
        // }
        return {
            avanza: ratioProd.avanza,
            yaris: ratioProd.yaris,
            calya: ratioProd.calya,
            tact_time_2: ratioProd.tact_time_2,
            efficiency_2: ratioProd.efficiency_2
        };
    };

    const getNextUnit = (() => {
        let unitQueue = [];
        let startCalculation = 0;
        const unitConsumptionLog = []; // Tracks consumption with timestamps

        // Function to reset the unitQueue at midnight
        const resetUnitQueueDaily = () => {
            const now = new Date();
            const nextMidnight = new Date();
            nextMidnight.setHours(24, 0, 0, 0); // Set to the next midnight

            const timeUntilMidnight = nextMidnight - now;

            // Set a timeout to clear the unitQueue at the next midnight
            setTimeout(() => {
                unitQueue.length = 0; // Reset the queue
                unitConsumptionLog.length = 0; // Clear the consumption log
                console.log("unitQueue has been reset for the new day!");
                resetUnitQueueDaily(); // Schedule the next reset
            }, timeUntilMidnight);
        };

        // Initialize the daily reset function
        resetUnitQueueDaily();

        // Function to shuffle an array
        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]]; // Swap elements
            }
            return array;
        };

        // Function to remove consumed units from the queue
        const removeConsumedUnits = (queue, consumedUnits) => {
            const consumedCount = {};
            consumedUnits.forEach(unit => {
                consumedCount[unit] = (consumedCount[unit] || 0) + 1;
            });
    
            return queue.filter(unit => {
                if (consumedCount[unit]) {
                    consumedCount[unit] -= 1;
                    return false; // Remove the unit from the queue
                }
                return true; // Keep the unit
            });
        };
    
        // Function to calculate produced units for the current day
        const getProducedUnitsToday = () => {
            const today = new Date().toISOString().split("T")[0]; // Get today's date (YYYY-MM-DD)
            const producedToday = unitConsumptionLog.filter(record =>
                record.consumption_time.startsWith(today)
            );
    
            const producedCount = {};
            producedToday.forEach(record => {
                producedCount[record.unit] = (producedCount[record.unit] || 0) + 1;
            });
    
            return producedCount;
        };

        return (totalUnits, ratios, consumedUnits = []) => {
            // Check if all ratios are 0
            const totalRatios = ratios.avanza + ratios.yaris + ratios.calya;
            if (totalRatios === 0) {
                console.warn("All ratio values are 0. No units can be allocated.");
                return null; // Or handle it in a way that fits your use case
            }

            if(startCalculation === 2){
                return null
            }
    
            if (unitQueue.length === 0) {
                startCalculation+=1
                const avanzaUnits = Math.floor(totalUnits * (ratios.avanza / 100));
                const yarisUnits = Math.floor(totalUnits * (ratios.yaris / 100));
                const calyaUnits = Math.floor(totalUnits * (ratios.calya / 100));
                
                unitQueue = [
                    ...Array(avanzaUnits).fill("Avanza"),
                    ...Array(yarisUnits).fill("Yaris"),
                    ...Array(calyaUnits).fill("Calya"),
                ];
                unitQueue = shuffleArray(unitQueue)
            }
            // Remove consumed units from the queue
            unitQueue = removeConsumedUnits(unitQueue, consumedUnits);
    
            const nextUnit = unitQueue.shift(); // Dequeue the next unit
    
            // Log the consumption with a timestamp
            if (nextUnit) {
                unitConsumptionLog.push({
                    unit: nextUnit,
                    consumption_time: new Date().toISOString(),
                });
            }
    
            console.log("Produced units today:", getProducedUnitsToday());
            return nextUnit;
        };
    })();

    const createConsumptionCalculation = async () => {
        try {
            // Calculate Total Units Per Day
            const totalMinutes = 455
            const ratios = await getRatios();
            const totalUnitsPerDay = Math.round(totalMinutes / (ratios.tact_time_2 / 60) * (ratios.efficiency_2 / 100))

            const unit = getNextUnit(totalUnitsPerDay, ratios); // Get the next unit
            if(!unit){
                return null
            }

            const time = moment().tz("Asia/Jakarta");

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

            setupsFound.forEach( async(setupItem) => {
                gentanisFound.forEach( async(gentaniItem) => {
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
    let tactTime = 0; // Initial value
    let intervalId = null; // To store the interval ID

    const updateTactTime = async () => {
        const ratios = await getRatios();
        return ratios.tact_time_2; // Return updated tactTime dynamically
    };

    const startScheduler = async () => {
        // Fetch initial tactTime
        tactTime = await updateTactTime();

        // If tactTime is invalid (0 or less), do not start the interval
        if (tactTime <= 0) {
            console.log("tactTime is 0 or invalid. Scheduler will not start.");
            return;
        }

        // Clear any existing interval to prevent duplicates
        if (intervalId) {
            clearInterval(intervalId);
        }

        // Start the interval
        intervalId = setInterval(async () => {
            try {
                // Check if tactTime is still valid before running
                if (tactTime > 0 && isWithinRange()) {
                    await createConsumptionCalculation();
                    console.log("Consumption calculation executed with tactTime:", tactTime);
                }
            } catch (error) {
                console.error("Error in scheduled job execution:", error);
            }
        }, tactTime * 1000); // Run every tactTime seconds
    };

    const monitorTactTimeChanges = () => {
        // Check periodically for changes in tactTime
        setInterval(async () => {
            const newTactTime = await updateTactTime();
            if (newTactTime !== tactTime) {
                tactTime = newTactTime; // Update the global tactTime value
                console.log("tactTime updated to:", tactTime);

                // Restart the scheduler with the new tactTime
                startScheduler();
            }
        }, 5000); // Check for changes every 5 seconds (adjust as needed)
    };




    // Start monitoring and scheduling
    (async () => {
        await startScheduler();
        monitorTactTimeChanges();
    })();
    
    console.log("Scheduled jobs initialized.");
};

export default SchedulledConsumption2;
