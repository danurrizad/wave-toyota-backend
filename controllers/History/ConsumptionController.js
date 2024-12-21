import Gentani from "../../models/GentaniModel.js";
import Consumption from "../../models/History/ConsumptionModel.js";
import Material from "../../models/MaterialModel.js";
import Setup from "../../models/SetupModel.js";
import moment from "moment-timezone"; // Install moment.js if not already installed: npm install moment

export const getConsumptionAll = async(req, res) => {
    try {
        const response = await Consumption.findAll()
        res.status(200).json({ message: "All consumption found!", data: response})

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