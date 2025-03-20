import Days from "../models/DaysModel.js";
import db from "../utils/Database.js";

export const getDays = async (req, res) => {
    try {
        const days = await Days.findOne({
            where: {
                id: 1
            }
        });
        
        if(!days || days.length === 0){
            await db.query("DBCC CHECKIDENT ('Days', RESEED, 0);");

            const createdDays = await Days.create({ 
                plant1_monday: true, 
                plant1_tuesday: true, 
                plant1_wednesday: true, 
                plant1_thursday: true, 
                plant1_friday: true, 
                plant1_saturday: true, 
                plant1_sunday: true, 
    
                plant2_monday: true, 
                plant2_tuesday: true, 
                plant2_wednesday: true, 
                plant2_thursday: true, 
                plant2_friday: true, 
                plant2_saturday: true, 
                plant2_sunday: true
             })
             return res.status(201).json({ message: "Days successfully created!", data: createdDays})
        }

        res.status(200).json({ message: "Days data found", data: days});
      } catch (error) {
        console.error("Failed to get days:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
      }
};

export const createDays = async(req, res) => {
    try {
        const days = await Days.create({ 
            plant1_monday: true, 
            plant1_tuesday: true, 
            plant1_wednesday: true, 
            plant1_thursday: true, 
            plant1_friday: true, 
            plant1_saturday: true, 
            plant1_sunday: true, 

            plant2_monday: true, 
            plant2_tuesday: true, 
            plant2_wednesday: true, 
            plant2_thursday: true, 
            plant2_friday: true, 
            plant2_saturday: true, 
            plant2_sunday: true
         })
        if(!days){
            return res.status(404).json({ message: "Failed to create days!"})
        }
        res.status(201).json({ message: "Days successfully created!", data: days})
    } catch (error) {
        console.error("Error creating days: ", error)
        res.status(500).json({ message: "Internal server error!"})
    }
}

export const updateDays = async(req, res) => {
    try {
        const { plant1_monday, plant1_tuesday, plant1_wednesday, plant1_thursday, plant1_friday, plant1_saturday, plant1_sunday, 
            plant2_monday, plant2_tuesday, plant2_wednesday, plant2_thursday, plant2_friday, plant2_saturday, plant2_sunday
        } = req.body
        // const body = req.body
        console.log("bodyyyyyy:", req.body)
        const days = await Days.findAll({
            where: {
                id: 1
            }
        })
        if(!days || days.length === 0){
            // const createdDays = await Days.create({ plant1_monday, plant1_tuesday, plant1_wednesday, plant1_thursday, plant1_friday, plant1_saturday, plant1_sunday, 
            //     plant2_monday, plant2_tuesday, plant2_wednesday, plant2_thursday, plant2_friday, plant2_saturday, plant2_sunday })
            // if(!createdDays){
            //     return res.status(400).json({ message: "Failed to create days!"})
            // }
            return res.status(201).json({ message: "No days found. Created a days!"})
        }
        const updatedDays = await Days.update( {
            plant1_monday: plant1_monday ? plant1_monday : false , 
            plant1_tuesday: plant1_tuesday ? plant1_tuesday : false , 
            plant1_wednesday: plant1_wednesday ? plant1_wednesday : false , 
            plant1_thursday: plant1_thursday ? plant1_thursday : false , 
            plant1_friday: plant1_friday ? plant1_friday : false , 
            plant1_saturday: plant1_saturday ? plant1_saturday : false , 
            plant1_sunday: plant1_sunday ? plant1_sunday : false , 
            plant2_monday: plant2_monday ? plant2_monday : false , 
            plant2_tuesday: plant2_tuesday ? plant2_tuesday : false , 
            plant2_wednesday: plant2_wednesday ? plant2_wednesday : false , 
            plant2_thursday: plant2_thursday ? plant2_thursday : false , 
            plant2_friday: plant2_friday ? plant2_friday : false , 
            plant2_saturday: plant2_saturday ? plant2_saturday : false , 
            plant2_sunday: plant2_sunday ? plant2_sunday : false 
        } , {
                where: {
                    id: 1
                }
            })
        if(!updatedDays){
            return res.status(400).json({ message: "Failed to update days"})
        }
        res.status(200).json({ message: "Successfully updated days", data: req.body})
    } catch (error) {
        console.error("Error updating days: ", error)
        res.status(500).json({ message: "Internal server error!"})
    }
}