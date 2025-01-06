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
        let { katashiki, material_no, plant, quantity_fortuner, quantity_zenix, quantity_innova, quantity_avanza, quantity_yaris, quantity_calya, created_by, updated_by } = req.body;
        // katashiki = katashiki?.trim()
        material_no = material_no?.trim();

        // Validate input
        if (!material_no || plant === "Select" ){
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
            quantity_fortuner: quantity_fortuner,
            quantity_zenix: quantity_zenix,
            quantity_innova: quantity_innova,
            quantity_avanza: quantity_avanza,
            quantity_yaris: quantity_yaris,
            quantity_calya: quantity_calya,
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
            const { material_no, plant, quantity_fortuner, quantity_zenix, quantity_innova, quantity_avanza, quantity_yaris, quantity_calya } = record;

            // Skip rows with missing or invalid fields
            if (!material_no || !plant) {
                errors.push({ record, message: "Material_no or plant can't be empty!" });
                continue;
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
                    quantity_fortuner: quantity_fortuner,
                    quantity_zenix: quantity_zenix,
                    quantity_innova: quantity_innova,
                    material_id: material.material_id,
                    quantity_avanza: quantity_avanza,
                    quantity_yaris: quantity_yaris,
                    quantity_calya: quantity_calya,
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
        const { quantity_fortuner, quantity_zenix, quantity_innova, quantity_avanza, quantity_yaris, quantity_calya, updated_by } = req.body;
        
        if( !updated_by ){
            return res.status(401).json({ message: "Unauthorized!"})
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
        
        if(gentani.quantity_fortuner === quantity_fortuner && 
            gentani.quantity_zenix === quantity_zenix && 
            gentani.quantity_innova === quantity_innova &&
            gentani.quantity_avanza === quantity_avanza && 
            gentani.quantity_yaris === quantity_yaris &&
            gentani.quantity_calya === quantity_calya
        ){
            return res.status(400).json({ message: "Quantity can't be update with same value!"})
        }

        await Gentani.update({
            quantity_fortuner,
            quantity_zenix,
            quantity_innova,
            quantity_avanza,
            quantity_yaris,
            quantity_calya,
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

        const gentaniFound = await Gentani.findOne({
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
        res.status(200).json({ message: `Gentani for Material No. ${gentaniFound.material_no} in ${gentaniFound.plant} deleted`})

    } catch (error) {
        console.log("Error :", error.message)
        res.status(500).json({ message: "Internal server error!", error: error.message})
    }
}