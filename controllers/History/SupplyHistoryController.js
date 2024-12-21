import SupplyHistory from "../../models/History/SupplyHistoryModel.js";
import Setup from "../../models/SetupModel.js";
import Material from "../../models/MaterialModel.js";

export const getSupplyHistoryAll = async(req, res) => {
    try {
        const response = await SupplyHistory.findAll()
        res.status(200).json({ message: "All supply history data found!", data: response})
    } catch (error) {
        res.status(500).json({ message: "Internal server error!", error: error.message})
    }
}

export const createSupplyHistory = async(req, res) => {
    try {
        const { material_no, material_desc, plant, uom, qty, supply_by } = req.body
        // console.log("form body :", req.body)
        if(!material_no || !material_desc || !plant || !uom || !qty || !supply_by){
            return res.status(400).json({ message: "Please fill out the form!", error: error.message})
        }

        const material = await Material.findOne({
            where: {
                material_no: material_no
            }
        })

        if(!material){
            return res.status(404).json({ message: "No material found!"})
        }

        const setup = await Setup.findOne({
            where: {
                material_no: material_no   
            }
        })

        if(!setup){
            return res.status(404).json({ message: "No setup found!"})
        }

        const currentSupply = setup.dataValues.total
        const afterSupply = Math.round((currentSupply + qty) * 100 ) / 100

        const setupUpdate = await Setup.update(
            {
                total: afterSupply
            },{
                where: {
                    material_no: material_no
                }
            }
        )
        if(!setupUpdate){
            return res.status(400).json({ message: "Setup total failed to update!", error: error.message})
        }


        const supplyHistory = await SupplyHistory.create({
            material_no: material_no,
            material_desc: material_desc,
            supply_by: supply_by,
            supply_date: new Date().toISOString().split('T')[0], // 'YYYY-MM-DD' for DATEONLY
            supply_time: new Date().toTimeString().split(' ')[0]  // 'HH:MM:SS' for TIME
        })
        
        if(!supplyHistory){
            return res.status(400).json({ message: "Supply history failed to create!", error: error.message})
        }


        res.status(201).json({ message: "Material successfully suplied!" })

    } catch (error) {
        res.status(500).json({ message: "Internal server error!", error: error.message})
    }
}