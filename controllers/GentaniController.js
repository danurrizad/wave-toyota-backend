import Gentani from "../models/GentaniModel.js";
import Material from "../models/MaterialModel.js";

export const getGentaniAll = async (req, res) => {
    try {
        // Synchronize Gentani with Material table changes
        const materials = await Material.findAll();
        const syncPromises = materials.map(async (material) => {
          await Gentani.update(
            {
                material_desc: material.material_desc,
                plant: material.plant,
                uom: material.uom,
            },
            {
                where: { 
                    material_no: material.material_no,
                    plant: material.plant
                },
            }
          );
        });
    
        await Promise.all(syncPromises);
    
        // Fetch all Gentani records after synchronization
        const gentaniData = await Gentani.findAll();
        res.status(200).json(gentaniData);
      } catch (error) {
        console.error("Error fetching Gentani data:", error);
        res.status(500).json({ message: "Failed to fetch Gentani data", error: error.message });
      }
};

export const getGentaniById = async (req, res) => {
    try {
        const gentaniId = req.params.id;
        const gentani = await Gentani.findOne({
            where: {
                gentani_id: gentaniId,
            },
            include: [{ model: Material }], // Include related materials
        });

        if (!gentani) {
            return res.status(404).json({ message: "Gentani not found!" });
        }
        res.status(200).json(gentani);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
};

export const createGentani = async (req, res) => {
    try {
        let { katashiki, material_no, plant, quantity, created_by, updated_by } = req.body;
        // katashiki = katashiki?.trim()
        material_no = material_no?.trim();

        // Validate input
        if (!material_no || plant === "Select" || !quantity ){
            return res.status(400).json({ message: "Please fill out all required fields!" });
        }

        if(!created_by){
            return res.status(401).json({ message: "Unauthorized. Try to re-login!"})
        }

        // if(/\t/.test(katashiki) || /\t/.test(material_no) || /\t/.test(quantity)){
        //     return res.status(400).json({ message: "Input contains invalid tab character"})
        // }

        // Check if Material exists
        const material = await Material.findOne({ where: { material_no, plant } });
        if (!material) {
            return res.status(404).json({ message: `Material with No : ${material_no} in ${plant} not found!` });
        }

        const gentaniFound = await Gentani.findOne({
            where: {
                material_no: material_no,   
                plant: plant
            }
        })
        if(gentaniFound){
            return res.status(400).json({ message: `Gentani for Material No : ${material.material_no} in ${plant} has already created!`})
        }

        // Create Gentani using Material data
        const gentani = await Gentani.create({
            katashiki: katashiki,
            material_no: material.material_no,
            material_desc: material.material_desc,
            plant: material.plant,
            uom: material.uom,
            quantity: quantity,
            material_id: material.material_id,
            created_by: created_by,
            updated_by: updated_by
        });

        res.status(201).json({ message: "Gentani created successfully!", data: gentani });

    } catch (error) {
        console.error("Error in creating Gentani: ", error);
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
};

export const createGentaniByUpload = async (req, res) => {
    try {
        const { file_name, data, created_by } = req.body;

        // Validate input
        if (!file_name || !data || !created_by) {
            return res.status(400).json({ message: "File name, data, and user are required!" });
        }

        const results = [];
        const errors = [];

        // Process each row in the uploaded data
        for (const record of data) {
            const { material_no, plant, quantity } = record;

            // Skip rows with missing or invalid fields
            if (!material_no || !plant || !quantity) {
                // errors.push({ record, message: "Missing required fields!" });
                // continue;1
                return res.status(400).json({ message: `Invalid file! Missing required column : material_no, plant, or quantity!`})
            }

            try {
                // Check if the material exists
                const material = await Material.findOne({ where: { material_no, plant } });
                if (!material) {
                    errors.push({ record, message: `Material with No. ${material_no} in ${plant} not found!` });
                    continue;
                }

                // Check for duplicate Gentani
                const gentaniFound = await Gentani.findOne({
                    where: {
                        material_no,
                        plant
                    },
                });
                if (gentaniFound) {
                    errors.push({
                        record,
                        message: `Gentani for Material No : ${material_no} in ${plant} already exists!`,
                    });
                    continue;
                }

                // Create Gentani using Material data
                const gentani = await Gentani.create({
                    katashiki: "",
                    material_no: material.material_no,
                    material_desc: material.material_desc,
                    plant: material.plant,
                    uom: material.uom,
                    quantity,
                    material_id: material.material_id,
                    created_by,
                    updated_by: "",
                });

                results.push(gentani);
            } catch (createError) {
                errors.push({ record, message: createError.message });
            }
        }

        // Respond with the results and errors
        res.status(201).json({
            message: `${results.length} Gentani created successfully!`,
            created: results,
            errors,
        });
    } catch (error) {
        console.error("Error in creating Gentani by upload: ", error);
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
};


export const updateGentani = async(req, res) => {
    try {
        const gentani_id = req.params.gentaniId
        if(!gentani_id){
            return res.status(404).json({ message: "Please provide gentani Id!"})
        }
        const { quantity, updated_by } = req.body;
        
        // Validate input
        if (!quantity || !updated_by) {
            return res.status(400).json({ message: "Please fill out all required fields!" });
        }

        // Check if Material exists
        const gentani = await Gentani.findOne({
            where:{
                gentani_id: gentani_id
            }
        })

        if(!gentani){
            return res.status(404).json({ message: "Gentani not found!"})
        }
        
        if(gentani.quantity === quantity){
            return res.status(400).json({ message: "Gentani quantity can't be update with same value"})
        }

        await Gentani.update({
            quantity,
            updated_by,
        },
            {
                where: {
                    gentani_id: gentani_id
                }
            }
        )

        res.status(201).json({ message: `Gentani successfully updated!`})

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error!", error: error.message})
    }
}

export const deleteGentani = async(req, res) => {
    try {
        const gentani_id = req.params.gentaniId;
        // Validate input
        if (!gentani_id) {
            return res.status(400).json({ message: "Please provide gentani id!" });
        }

        const gentaniFound = Gentani.findOne({
            where: {
                gentani_id: gentani_id
            }
        })
        if(!gentaniFound){
            return res.status(400).json({ message: `Gentani not found!`})
        }

        await Gentani.destroy({
            where: {
                gentani_id: gentani_id
            }
        })
        res.status(200).json({ message: `Material deleted`})

    } catch (error) {
        console.log("Error :", error.message)
        res.status(500).json({ message: "Internal server error!", error: error.message})
    }
}

// export const setGentaniMaterial = async(req, res) => {
//     try {
//         const {gentaniId} = req.params
//         const materialNo = req.body.material_no
//         if(!gentaniId){
//             res.status(400).json({ message: "Please provide gentani Id!"})
//             return
//         }
//         if(!materialNo){
//             res.status(400).json({ message: "Please provide material no!"})
//             return
//         }

//         const gentani = await Gentani.findOne({
//             where: {
//                 gentani_id: gentaniId
//             }
//         })

//         const material = await Material.findOne({
//             where: {
//                 material_no: materialNo
//             }
//         })

//         if(!gentani){
//             res.status(404).json({ message: `Gentani with id ${gentaniId} not found!`})
//             return
//         }

//         if(!material){
//             res.status(404).json({ message: `Material No. ${materialNo} not found`})
//             return
//         }

//          // Update the Material record with gentani_id
//         await Material.update(
//             { gentani_id: gentaniId },
//             { where: { material_no: materialNo } }
//         );

//         res.status(200).json({ message: `Gentani Id ${gentaniId} succesfully updated to Material No. ${materialNo}`})
        
//     } catch (error) {
//         console.log("Error :", error.message)
//         res.status(500).json({ message: "Internal server error!", error: error.message})
//     }
// }