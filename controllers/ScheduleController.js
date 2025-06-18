import { Op } from "sequelize";
import dayjs from "dayjs";
import Schedule from "../models/ScheduleModel.js";

export const getSchedule = async(req, res) => {
    try {
        const schedule = await Schedule.findAll()
        if(!schedule){
            return res.status(400).json({ message: "No schedule found!"})
        }
        res.status(200).json({ message: "Schedule found", data: schedule})
    } catch (error) {
        res.status(500).json({ message: "Internal server error!", error: error})
    }
}

export const getScheduleByMonth = async (req, res) => {
  try {
    const { date } = req.params; // expected format: "YYYY-MM"
    if (!date) {
      return res.status(400).json({ message: "Please provide month and year!" });
    }

    const startDate = `${date}-01`;
    const nextMonthStartDate = dayjs(startDate).add(1, 'month').format('YYYY-MM-DD');

    // Check if any schedules exist for this month
    let foundSchedules = await Schedule.findAll({
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lt]: nextMonthStartDate
        }
      }
    });

    // If none, auto-create default schedules
    if (!foundSchedules || foundSchedules.length === 0) {
      const daysInMonth = dayjs(startDate).daysInMonth();
      const bulkData = [];

      for (let i = 0; i < daysInMonth; i++) {
        const d = dayjs(startDate).add(i, 'day').format('YYYY-MM-DD');
        bulkData.push({
          date: d,
          plant1: false,
          plant2: false
        });
      }

      // Step 1: Get existing dates (safety, in case partial schedules were created)
      const existingDates = await Schedule.findAll({
        attributes: ['date'],
        where: {
          date: {
            [Op.in]: bulkData.map(entry => entry.date)
          }
        }
      });

      const existingDateSet = new Set(
        existingDates.map(e => dayjs(e.date).format('YYYY-MM-DD'))
      );

      // Step 2: Filter only new dates
      const filteredData = bulkData.filter(entry => !existingDateSet.has(entry.date));

      // Step 3: Insert new ones only
      if (filteredData.length > 0) {
        await Schedule.bulkCreate(filteredData);
      }

      // Step 4: Fetch again after insert
      foundSchedules = await Schedule.findAll({
        where: {
          date: {
            [Op.gte]: startDate,
            [Op.lt]: nextMonthStartDate
          }
        }
      });
    }

    return res.status(200).json({ message: "Schedules found!", data: foundSchedules });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error!",
      error: error.message
    });
  }
};

export const upsertSchedules = async (req, res) => {
  try {
    const errors = [];
    let scheduleData = req.body;

    if (!scheduleData || Object.keys(scheduleData).length === 0) {
      return res.status(400).json({ message: "Please provide data to send!" });
    }

    // Normalize to array
    if (!Array.isArray(scheduleData)) {
      scheduleData = [scheduleData];
    }

    for (let i = 0; i < scheduleData.length; i++) {
      const item = scheduleData[i];

      if (!item.date) {
        errors.push(`Missing date at index ${i}`);
        continue;
      }

      if (item.plant1 === undefined && item.plant2 === undefined) {
        errors.push(`Missing plant1 and plant2 values at ${item.date}`);
        continue;
      }

      // Check if a schedule already exists for the date
      const existing = await Schedule.findOne({ where: { date: item.date } });

      if (existing) {
        // Update existing
        await Schedule.update(
          {
            plant1: item.plant1 ?? existing.plant1,
            plant2: item.plant2 ?? existing.plant2
          },
          { where: { date: item.date } }
        );
      } else {
        // Create new
        await Schedule.create({
          date: item.date,
          plant1: item.plant1 || 0,
          plant2: item.plant2 || 0
        });
      }
    }

    return res.status(200).json({
      message: `Schedule upsert complete with ${scheduleData.length - errors.length} success and ${errors.length} error(s)`,
      errors
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

