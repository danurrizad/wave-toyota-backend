import Gentani from "../models/GentaniModel.js";
import Material from "../models/MaterialModel.js"
import Monitoring from "../models/MonitoringModel.js";
import Setup from "../models/SetupModel.js"
import SupplyQty from "../models/SupplyQtyModel.js";

import db from "../utils/Database.js";

export const getMaterialAll = async(req, res) => {
    try {
        const response = await Material.findAll();

        res.status(200).json(response);
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Internal server error!"})
    }
}

export const getMaterialById = async(req, res) =>{
    try {
        const materialId = req.params.id;
        const material = await Material.findOne({
            where: {
                material_id: materialId
            }
        })
        if(!material){
            res.status(404).json({ message: "Material not found!" })
        }else{
            res.status(200).json(material)
        }


    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Internal server error!"})
    }
}

export const createMaterial = async (req, res) => {
    const transaction = await db.transaction(); // Start a transaction
    try {
        // Destructure and trim input values
        let { material_no, material_desc, plant, depth_material, andon_display, supply_line, uom, pack, created_by, updated_by } = req.body;
        material_no = material_no?.trim();
        material_desc = material_desc?.trim();
        plant = plant?.trim();
        // depth_material = depth_material?.trim();
        andon_display = andon_display?.trim();
        supply_line = supply_line?.trim();
        uom = uom?.trim();
        pack = pack?.trim();

        // Input Validation
        if (!material_no || !material_desc || !plant || !depth_material || !andon_display || !supply_line || !uom || !pack) {
            return res.status(400).json({ message: "Please fill out all required fields" });
        }

        // Convert and validate depth_material
        depth_material = parseFloat(depth_material); // Convert to number
        if (isNaN(depth_material)) {
            return res.status(400).json({ message: "Invalid depth material. Must be a valid number!" });
        }

        if (!created_by) {
            return res.status(401).json({ message: "Unauthorized: Created by is required" });
        }

        // Check if material already exists
        const materialExists = await Material.findOne({ where: { material_no, plant }, transaction });
        if (materialExists) {
            return res.status(400).json({ message: `Material No. ${material_no} already exists in plant ${plant}` });
        }

        // Step 1: Create Material
        const newMaterial = await Material.create(
            {
                material_no,
                material_desc,
                plant,
                depth_material,
                andon_display,
                supply_line,
                uom,
                pack,
                created_by,
                updated_by
            },
            { transaction }
        );

        // Step 2: Create Setup
        const newSetup = await Setup.create(
            {
                material_no,
                material_desc,
                plant,
                supply_line,
                standard_supply: 0,
                critical_stock: 0,
                total: 0,
                created_by,
                updated_by: ""
            },
            { transaction }
        );

        // Step 3: Create SupplyQty
        const newSupplyQty = await SupplyQty.create(
            {
                material_no,
                material_desc,
                plant,
                qty: 0,
                uom,
                pack,
                created_by,
                updated_by: ""
            },
            { transaction }
        );

        // Step 4: Create Monitoring
        const newMonitoring = await Monitoring.create(
            {
                material_no,
                material_desc,
                plant,
                visualization_name: "",
                created_by,
                updated_by: ""
            },
            { transaction }
        );

        // Step 5: Update Material with Foreign Keys
        await Material.update(
            {
                setup_id: newSetup.setup_id,
                supplyQty_id: newSupplyQty.supplyQty_id,
                monitoring_id: newMonitoring.monitoring_id
            },
            { where: { material_id: newMaterial.material_id }, transaction }
        );

        // Commit the transaction
        await transaction.commit();

        res.status(201).json({
            message: "Material created successfully!",
            data: {
                material: newMaterial,
                setup: newSetup,
                supplyQty: newSupplyQty,
                monitoring: newMonitoring
            }
        });
    } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        console.error("Error in createMaterial:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const updateMaterial = async(req, res) => {
    try {
        const materialNo = req.params.materialNo;
        const plant = req.body.plant;
        const material = await Material.findOne({
            where: {
                material_no: materialNo,
                plant: plant
            }
        })
        if(!material){
            return res.status(404).json({ message: "Material not found"})
        }else{
            await Material.update(req.body, {
                where: {
                    material_no: materialNo,
                    plant: plant
                }
            })
            res.status(200).json({ message: `Material No : ${materialNo} in ${plant} updated`})
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Internal server error!"})
    }
}

export const deleteMaterial = async (req, res) => {
    const transaction = await db.transaction(); // Start a transaction
    try {
        const material_no = req.params.materialNo;
        const plant = req.params.plant;

        // Check if the material exists
        const material = await Material.findOne({
            where: { material_no, plant },
            transaction, // Use transaction here
        });

        if (!material) {
            await transaction.rollback();
            return res
                .status(404)
                .json({ message: `Material with No ${material_no} in ${plant} not found!` });
        }

        const whereCondition = { material_no, plant };

        // Delete operations
        await Material.destroy({ where: whereCondition, transaction });
        await Gentani.destroy({ where: whereCondition, transaction });
        await Setup.destroy({ where: whereCondition, transaction });
        await SupplyQty.destroy({ where: whereCondition, transaction });
        await Monitoring.destroy({ where: whereCondition, transaction });

        // Commit the transaction
        await transaction.commit();
        res.status(200).json({ message: `Material No. ${material_no} in ${plant} deleted!` });
    } catch (error) {
        // Rollback the transaction if any error occurs
        await transaction.rollback();
        console.error(error.message);
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
};
