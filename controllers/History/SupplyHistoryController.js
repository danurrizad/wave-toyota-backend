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

// MULTIPLE CREATION
export const createSupplyHistory = async (req, res) => {
    try {
        const supplyHistories = req.body; // Expecting an array of supply history data

        if (!Array.isArray(supplyHistories) || supplyHistories.length === 0) {
            return res.status(400).json({ message: "No available supply to process for submission!" });
        }

        for (const history of supplyHistories) {
            const { material_no, material_desc, plant, uom, qty_pack, qty_uom, supply_by } = history;

            // Validate input for each entry
            if (!material_no || !material_desc || !plant || !uom || !qty_pack || !qty_uom || !supply_by) {
                return res.status(400).json({
                    message: "Missing required fields in one of the entries!",
                    data: history,
                });
            }

            // Check if the material exists
            const material = await Material.findOne({
                where: {
                    material_no: material_no,
                    plant: plant,
                },
            });

            if (!material) {
                return res.status(404).json({ message: `No material found for material_no: ${material_no}, plant: ${plant}` });
            }

            // Check if the setup exists
            const setup = await Setup.findOne({
                where: {
                    material_no: material_no,
                    plant: plant,
                },
            });

            if (!setup) {
                return res.status(404).json({ message: `No setup found for material_no: ${material_no}, plant: ${plant}` });
            }

            const currentSupply = setup.dataValues.total;
            const afterSupply = Math.round((currentSupply + qty_uom) * 100) / 100;

            // Update setup total
            const setupUpdate = await Setup.update(
                { total: afterSupply },
                {
                    where: {
                        material_no: material_no,
                        plant: plant,
                    },
                }
            );

            if (!setupUpdate) {
                return res.status(400).json({ message: `Failed to update setup for material_no: ${material_no}, plant: ${plant}` });
            }

            // Create supply history
            const supplyHistory = await SupplyHistory.create({
                material_no: material_no,
                material_desc: material_desc,
                plant: plant,
                supply_by: supply_by,
                qty_pack: qty_pack,
                qty_uom: qty_uom,
                supply_date: new Date().toISOString().split("T")[0], // 'YYYY-MM-DD' for DATEONLY
                supply_time: new Date().toTimeString().split(" ")[0], // 'HH:MM:SS' for TIME
            });

            if (!supplyHistory) {
                return res.status(400).json({ message: `Failed to create supply history for material_no: ${material_no}, plant: ${plant}` });
            }
        }

        res.status(201).json({ message: "All supply histories successfully created!" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
};

// SINGLE CREATION
// export const createSupplyHistory = async(req, res) => {
//     try {
//         const { material_no, material_desc, plant, uom, qty_pack, qty_uom, supply_by } = req.body
//         // console.log("form body :", req.body)
//         if(!material_no || !material_desc || !plant || !uom || !qty_pack || !qty_uom || !supply_by){
//             return res.status(400).json({ message: "Please fill out the form!", error: error.message})
//         }

//         const material = await Material.findOne({
//             where: {
//                 material_no: material_no,
//                 plant: plant
//             }
//         })

//         if(!material){
//             return res.status(404).json({ message: "No material found!"})
//         }

//         const setup = await Setup.findOne({
//             where: {
//                 material_no: material_no,
//                 plant: plant   
//             }
//         })

//         if(!setup){
//             return res.status(404).json({ message: "No setup found!"})
//         }

//         const currentSupply = setup.dataValues.total
//         const afterSupply = Math.round((currentSupply + qty_uom) * 100 ) / 100

//         const setupUpdate = await Setup.update(
//             {
//                 total: afterSupply
//             },{
//                 where: {
//                     material_no: material_no,
//                     plant: plant
//                 }
//             }
//         )
//         if(!setupUpdate){
//             return res.status(400).json({ message: "Setup total failed to update!", error: error.message})
//         }


//         const supplyHistory = await SupplyHistory.create({
//             material_no: material_no,
//             material_desc: material_desc,
//             plant: plant,
//             supply_by: supply_by,
//             qty_pack: qty_pack,
//             qty_uom: qty_uom,
//             supply_date: new Date().toISOString().split('T')[0], // 'YYYY-MM-DD' for DATEONLY
//             supply_time: new Date().toTimeString().split(' ')[0]  // 'HH:MM:SS' for TIME
//         })
        
//         if(!supplyHistory){
//             return res.status(400).json({ message: "Supply history failed to create!", error: error.message})
//         }


//         res.status(201).json({ message: "Material successfully suplied!" })

//     } catch (error) {
//         res.status(500).json({ message: "Internal server error!", error: error.message})
//     }
// }