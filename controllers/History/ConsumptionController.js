import { Op } from "sequelize";
import Gentani from "../../models/GentaniModel.js";
import Consumption from "../../models/History/ConsumptionModel.js";
import Material from "../../models/MaterialModel.js";
import Setup from "../../models/SetupModel.js";
import moment from "moment-timezone"; // Install moment.js if not already installed: npm install moment

export const getConsumptions = async(req, res) => {
    try {
        const { startDate, endDate } = req.query
        
        if(!startDate || !endDate){
            return res.status(400).json({ message: "Please provide range date!"})
        }

        // +1 date because of the datetype
        const endOfDate = new Date(endDate);
        endOfDate.setDate(endOfDate.getDate() + 1)

        const response = await Consumption.findAll({
            where: {
                consumption_date: { 
                    [Op.between]: [startDate, endOfDate.toLocaleDateString('en-CA')]
                }  
            }
        })
        if(!response){
            return res.status(404).json({ message: "Consumption history data not found!"})
        }
        res.status(200).json({ message: "Consumption history data found!", data: response})
    } catch (error) {
        res.status(500).json({ message: "Internal server error!", error: error.message})
    }
}

export const createConsumption = async(req, res) => {
    try {
        const {katashiki, materialNo, consumptionQty} = req.body

        if(!katashiki || !materialNo){
            return res.status(404).json({ message: "Please provide katashiki and material no!"})
        }

        const gentani = await Gentani.findOne({
            where: {
                katashiki: katashiki,
                material_no: materialNo
            }
        })

        if(!gentani){
            return res.status(404).json({ message: "Gentani not found!"})
        }

        const material = await Material.findOne({
            where: {
                material_no: materialNo
            }
        })

        if(!material){
            return res.status(404).json({ message: "Material not found!"})
        }

        const setup = await Setup.findOne({
            where: {
                material_no: materialNo
            }
        })

        if(!setup){
            return res.status(404).json({ message: "Setup not found!"})
        }

        const time = moment().tz("Asia/Jakarta");

        const response = await Consumption.create({
            material_no: material.material_no,
            material_desc: material.material_desc,
            consumption_date: time.format("YYYY-MM-DD"), // Format date as YYYY-MM-DD
            consumption_time: time.format("YYYY-MM-DD HH:mm:ss"), // Format datetime as YYYY-MM-DD HH:mm:ss
            katashiki: gentani.katashiki,
            vin_no: "-",
            body_seq: "-",
            initial_stock: setup.total,
            final_stock: setup.total - consumptionQty,
            qty: consumptionQty
        });

        await Setup.update({
            total: response.final_stock
        },{
            where: {
                material_no: materialNo
            }
        })

        res.status(201).json({ message: "Consumption history created!", data: response})

    } catch (error) {
        res.status(500).json({ message: "Internal server error!", error: error.message})
    }
}

export const getTotalUnitsToday = async(req, res) => {
    try {
        const { startDate, endDate } = req.query
        if(!startDate || !endDate){
            return res.status(400).json({ message: "Please provide date range!"})
        }
        const endOfDay = new Date(endDate);
        endOfDay.setDate(endOfDay.getDate() + 1);
        console.log('start: ', startDate)
        console.log('end: ', endOfDay.toLocaleDateString('en-CA'))
        const consumptionToday = await Consumption.findAll({
            where: {
                consumption_date: {
                    [Op.between]: [startDate, endOfDay.toLocaleDateString('en-CA')],
                },
            }
        })
        
        const units = ["Zenix", "Innova", "Fortuner", "Avanza", "Calya", "Yaris"];
        const seenTimes = {}; 
        const counts = {};

        units.forEach(unit => {
        seenTimes[unit] = new Set();
        counts[unit] = 0;
        });

        consumptionToday.forEach(data => {
        if (units.includes(data.unit)) {
            const timeKey = new Date(data.consumption_time).toISOString(); 
            if (!seenTimes[data.unit].has(timeKey)) {
            seenTimes[data.unit].add(timeKey);
            counts[data.unit]++;
            }
        }
        });

        const Zenix = counts["Zenix"];
        const Innova = counts["Innova"];
        const Fortuner = counts["Fortuner"];
        const Avanza = counts["Avanza"];
        const Calya = counts["Calya"];
        const Yaris = counts["Yaris"];

    
        res.status(200).json({ message: "Total units data found!", data: { Zenix, Innova, Fortuner, Avanza, Calya, Yaris }})
    } catch (error) {
        res.status(500).json({ message: "Internal server error!", error: error.message})
    }
}