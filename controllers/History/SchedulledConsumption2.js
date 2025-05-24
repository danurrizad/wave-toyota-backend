import cron from "node-cron";
import moment from "moment-timezone";
import { Op } from "sequelize";

import Gentani from "../../models/GentaniModel.js";
import Setup from "../../models/SetupModel.js";
import Consumption from "../../models/History/ConsumptionModel.js";
import Days from "../../models/DaysModel.js";

const SchedulledConsumption2 = async () => {

  const isWithinRange = async() => {
    const now = moment().tz("Asia/Jakarta");
    const dayOfWeek = now.isoWeekday(); // 1 = Monday, 7 = Sunday
    const currentTime = now.format("HH:mm");
    const currentDate = now.format("YYYY-MM-DD");

    // Set the holiday date here
    const holidayStart = "2025-03-28"
    const holidayEnd = "2025-04-06"

    if (currentDate >= holidayStart && currentDate <= holidayEnd) {
      return false;
    }

    const daysSetup = await Days.findOne({
      where: { id: 1}
    })

    const mondayIsOn = daysSetup.dataValues.plant2_monday
    const tuesdayIsOn = daysSetup.dataValues.plant2_tuesday
    const wednesdayIsOn = daysSetup.dataValues.plant2_wednesday
    const thursdayIsOn = daysSetup.dataValues.plant2_thursday
    const fridayIsOn = daysSetup.dataValues.plant2_friday
    const saturdayIsOn = daysSetup.dataValues.plant2_saturday
    const sundayIsOn = daysSetup.dataValues.plant2_sunday

    // -----------------------------------
    const dayTimeRange = [
      { start: "07:15", end: "09:30" },
      { start: "09:40", end: "11:45" },
      { start: "12:30", end: "14:30" },
      { start: "14:40", end: "16:00" },
    ]

    const fridayDayTimeRange = [
      { start: "07:15", end: "09:30" },
      { start: "09:40", end: "11:45" },
      { start: "13:00", end: "14:30" },
      { start: "14:40", end: "16:30" },
    ]

    const nightTimeRange1 = [
      { start: "21:00", end: "22:00" },
      { start: "22:10", end: "23:59" },
    ]

    const nightTimeRange2 = [
      { start: "00:30", end: "02:30" },
      { start: "02:40", end: "04:30" },
      { start: "04:45", end: "05:45" },
    ]

    const timeRanges = 
      // Minggu 
        (dayOfWeek === 7 && sundayIsOn) ? nightTimeRange1
        
        // Senin 
      : (dayOfWeek === 1 && sundayIsOn && !mondayIsOn) ? nightTimeRange2
      : (dayOfWeek === 1 && mondayIsOn && !sundayIsOn) ? [...dayTimeRange, ...nightTimeRange1]
      : (dayOfWeek === 1 && mondayIsOn) ? [...nightTimeRange2, ...dayTimeRange, ...nightTimeRange1]
       
      // Selasa
      : (dayOfWeek === 2 && mondayIsOn && !tuesdayIsOn ) ? nightTimeRange2
      : (dayOfWeek === 2 && tuesdayIsOn && !mondayIsOn ) ? [...dayTimeRange, ...nightTimeRange1]
      : (dayOfWeek === 2 && tuesdayIsOn) ? [...nightTimeRange2, ...dayTimeRange, ...nightTimeRange1]

      // Rabu  
      : (dayOfWeek === 3 && tuesdayIsOn && !wednesdayIsOn) ? nightTimeRange2
      : (dayOfWeek === 3 && wednesdayIsOn && !tuesdayIsOn) ? [ ...dayTimeRange, ...nightTimeRange1]
      : (dayOfWeek === 3 && wednesdayIsOn ) ? [...nightTimeRange2, ...dayTimeRange, ...nightTimeRange1]

      // Kamis  
      : (dayOfWeek === 4 && wednesdayIsOn && !thursdayIsOn) ? nightTimeRange2
      : (dayOfWeek === 4 && thursdayIsOn && !wednesdayIsOn ) ? [...dayTimeRange, ...nightTimeRange1]
      : (dayOfWeek === 4 && thursdayIsOn ) ? [...nightTimeRange2, ...dayTimeRange, ...nightTimeRange1]
        
      // Jumat
      : (dayOfWeek === 5 && thursdayIsOn && !fridayIsOn ) ? nightTimeRange2
      : (dayOfWeek === 5 && fridayIsOn && !thursdayIsOn ) ? [...fridayDayTimeRange, nightTimeRange1]      
      : (dayOfWeek === 5 && fridayIsOn ) ? [...nightTimeRange2, ...fridayDayTimeRange, ...nightTimeRange1]

      // Sabtu
      : (dayOfWeek === 6 && fridayIsOn && !saturdayIsOn ) ? nightTimeRange2
      : (dayOfWeek === 6 && saturdayIsOn && !fridayIsOn ) ? dayTimeRange
      : (dayOfWeek === 6 && saturdayIsOn ) ? [...nightTimeRange2, ...dayTimeRange]

      : [];

    // console.log("Time range: ", timeRanges.some(({ start, end }) => currentTime >= start && currentTime <= end))
    // console.log("Time range: ", timeRanges)
    return timeRanges.some(({ start, end }) => currentTime >= start && currentTime <= end);
};

    const getNextUnit = (() => {
        let unitQueue = [];

        return (totalUnits) => {
            if (unitQueue.length === 0) {
                const avanzaUnits = Math.floor(totalUnits * (60 / 100));
                const yarisUnits = Math.floor(totalUnits * (37 / 100));
                const calyaUnits = Math.floor(totalUnits * (3 / 100));

                unitQueue = [
                    ...Array(avanzaUnits).fill("Avanza"),
                    ...Array(yarisUnits).fill("Yaris"),
                    ...Array(calyaUnits).fill("Calya"),
                ];

                unitQueue.sort(() => Math.random() - 0.5);
            }

            return unitQueue.length > 0 ? unitQueue.shift() : null;
        };
    })();

    const createConsumptionCalculation = async () => {
        try {
            const totalUnitsPerDay = Math.round(900 / (114 / 60) * (97 / 100));
            const unit = getNextUnit(totalUnitsPerDay);
            if (!unit) {
                console.log("No more units to process.");
                return;
            }

            const time = moment().tz("Asia/Jakarta");

            const setup = await Setup.findAll({
                where: { total: { [Op.gt]: 0 } },
            });

            if(setup.length === 0){
              console.log("No material quantity available. Skipping this iteration.")
              return;
            }

            const gentani = await Gentani.findAll({
                where: { [`quantity_${unit.toLowerCase()}`]: { [Op.gt]: 0 } },
            });

            if (gentani.length === 0) {
                console.log("No materials with available quantity found. Skipping this iteration.");
                return;
            }

            for (const setupItem of setup) {
                for (const gentaniItem of gentani) {
                    if (setupItem.material_no === gentaniItem.material_no && setupItem.plant === gentaniItem.plant) {
                        const quantityForUnit = gentaniItem[`quantity_${unit.toLowerCase()}`] || 0;
                        const newTotal = setupItem.total - quantityForUnit < 0 ? 0 : parseFloat((setupItem.total - quantityForUnit).toFixed(4));

                        await Setup.update({ total: newTotal }, { where: { setup_id: setupItem.setup_id } });

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
                            qty: quantityForUnit,
                            unit,
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error during consumption calculation:", error);
        }
    };

   // Run every 96 seconds using setInterval
    setInterval(async () => {
        if (await isWithinRange()) {
        await createConsumptionCalculation();
        console.log("Consumption calculation executed.");
        }
    }, 114000); // 114,000 ms = 114 seconds
};

export default SchedulledConsumption2;
