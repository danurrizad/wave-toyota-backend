import cron from "node-cron";
import moment from "moment-timezone";
import { Op } from "sequelize";

import Gentani from "../../models/GentaniModel.js";
import Setup from "../../models/SetupModel.js";
import Consumption from "../../models/History/ConsumptionModel.js";
import RatioProd from './../../models/RatioProdModel.js';

const SchedulledConsumption = async () => {
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
        const ratioProd = await RatioProd.findOne({ where: { id_production: 1 } });
        if(!ratioProd || ratioProd === null){
            const initialRatio = await RatioProd.create({ 
                id_production: 1,
                fortuner: 0,
                zenix: 0,
                innova: 0,
                tact_time_1: 0,
                efficiency_1: 0,
                avanza: 0,
                yaris: 0,
                calya: 0,
                tact_time_2: 0,
                efficiency_2: 0
            })
            return{
                fortuner: initialRatio.fortuner,
                zenix: initialRatio.zenix,
                innova: initialRatio.innova,
                tact_time_1: initialRatio.tact_time_1,
                efficiency_1: initialRatio.efficiency_1
            }
        }
        return {
            fortuner: ratioProd.fortuner,
            zenix: ratioProd.zenix,
            innova: ratioProd.innova,
            tact_time_1: ratioProd.tact_time_1,
            efficiency_1: ratioProd.efficiency_1
        };
    };

    const getNextUnit = (() => {
        let unitQueue = [];
        let startCalculation = 0;

        // Function to reset the unitQueue at midnight
        const resetUnitQueueDaily = () => {
            const now = new Date();
            const nextMidnight = new Date();
            nextMidnight.setHours(24, 0, 0, 0); // Set to the next midnight

            const timeUntilMidnight = nextMidnight - now;

            // Set a timeout to clear the unitQueue at the next midnight
            setTimeout(() => {
                unitQueue.length = 0; // Reset the queue
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
        
        return (totalUnits, ratios) => {
            // console.warn("total units :", totalUnits)
            // console.warn("startCalculation :", startCalculation)
            // Check if all ratios are 0
            const totalRatios = ratios.fortuner + ratios.zenix + ratios.innova;
            if (totalRatios === 0) {
                console.warn("All ratio values are 0. No units can be allocated.");
                return null; // Or handle it in a way that fits your use case
            }

            if(startCalculation === 2){
                return null
            }
    
            if (unitQueue.length === 0) {
                startCalculation+=1
                const fortunerUnits = Math.floor(totalUnits * (ratios.fortuner / 100));
                const zenixUnits = Math.floor(totalUnits * (ratios.zenix / 100));
                const innovaUnits = Math.floor(totalUnits * (ratios.innova / 100));
                
                unitQueue = [
                    ...Array(fortunerUnits).fill("Fortuner"),
                    ...Array(zenixUnits).fill("Zenix"),
                    ...Array(innovaUnits).fill("Innova"),
                ];
                unitQueue = shuffleArray(unitQueue)
                // console.log("unitQueue :", unitQueue)
            }
            // const totals = unitQueue.reduce((acc, item) => {
            //     acc[item] = (acc[item] || 0) + 1;
            //     return acc;
            //   }, {});
            
            // console.log("total queue :", totals)
            return unitQueue.shift(); // Dequeue the next unit
        };
    })();
    

    const createConsumptionCalculation = async () => {
        try {
            // Calculate Total Units Per Day
            const totalMinutes = 455
            const ratios = await getRatios();
            const totalUnitsPerDay = Math.round(totalMinutes / (ratios.tact_time_1 / 60) * (ratios.efficiency_1 / 100))

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
                    ) {                        
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
        return ratios.tact_time_1; // Return updated tactTime dynamically
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

    // setInterval(async()=>{
    //     // console.warn("tes")
    //     // Calculate Total Units Per Day
    //     const totalMinutes = 455
    //     const ratios = await getRatios();
    //     const totalUnitsPerDay = Math.round(totalMinutes / (ratios.tact_time_1 / 60) * (ratios.efficiency_1 / 100))

    //     const unit = getNextUnit(totalUnitsPerDay, ratios); // Get the next unit
    //     if(!unit){
    //         return null
    //     }
    // }, 1000)

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

export default SchedulledConsumption;
