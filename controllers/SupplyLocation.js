import SupplyLocation from "../models/SupplyLocation.js";
import Material from "../models/MaterialModel.js";

export const getSupplyLocations = async(req, res) => {
    try {
        const { locationName, plant } = req.query
        let condition = {}
        if(locationName){
            condition.location_name = locationName
        }
        if(plant){
            condition.plant = plant
        }
        const supplyLocation = await SupplyLocation.findAll({
            where: condition,
            include: [
                {
                    model: Material,
                    required: true,
                    attributes: ["material_id", "material_no", "material_desc", "plant"]
                }
            ]
        })
        if(supplyLocation.length === 0){
            return res.status(404).json({ message: "No supply location found!"})
        }
        
        const grouped = {}
        for (const entry of supplyLocation){
            const locationName = entry.location_name
            const plant = entry.plant
            const uniqueName = `${locationName}[${[plant]}]`
            const material = entry.Material
            if(!grouped[uniqueName]){
                grouped[uniqueName] = {
                    id: entry.id,
                    location_name: locationName,
                    plant: plant,
                    materials: []
                }
            }

            grouped[uniqueName].materials.push(material)
        }
        const result = Object.values(grouped)
        res.status(200).json({ message: "All supply location found!", data: result})
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal server error!",
            error: error
        })
    }
}

export const getSupplyLocationByName = async(req, res) => {
    try {
        const { locationName, plant } = req.params
        const supplyLocation = await SupplyLocation.findAll({
            where: {
                location_name: locationName,
                plant: plant
            },
            include: [
                {
                    model: Material,
                    required: true,
                    attributes: ["material_id", "material_no", "material_desc", "plant"]
                }
            ]
        })
        if(supplyLocation.length === 0){
            return res.status(404).json({ message: "No supply location found!"})
        }
        
        const grouped = {}
        for (const entry of supplyLocation){
            const location = entry.locationName
            const plant = entry.plant
            const uniqueName = `${location}[${[plant]}]`
            const material = entry.Material
            if(!grouped[uniqueName]){
                grouped[uniqueName] = {
                    id: entry.id,
                    location_name: location,
                    plant: plant,
                    materials: []
                }
            }

            grouped[uniqueName].materials.push(material)
        }
        const result = Object.values(grouped)
        res.status(200).json({ message: "Supply location found!", data: result})
    } catch (error) {
        console.error(error)
        res.status(500).json({ 
            message: "Internal server error!",
            error: error
        })
    }
}

export const createSupplyLocation = async(req, res) => {
    try {
        const { location_name, plant, created_by, updated_by, materials } = req.body
        console.log({ created_by, updated_by})
        if(!created_by || !updated_by){
            return res.status(401).json({ message: "Unauthorized! Please re-login and try again!"})
        }
        if(!location_name){
            return res.status(400).json({ message: "Please provide Location name"})
        }
        if(!plant){
            return res.status(400).json({ message: "Please provide Plant!"})
        }
        const existLocation = await SupplyLocation.findOne({
            where: {
                location_name: location_name,
                plant: plant
            }
        })
        if(existLocation){
            return res.status(400).json({ message: `Supply location with name ${location_name} in plant ${plant} already exist!`})
        }
        if(!materials || materials.length === 0){
            return res.status(400).json({ message: "Pkease select at least one material!"})
        }
        for(let i = 0; i < materials.length; i++){
            const material = await Material.findOne({
                where: { material_id: materials[i].material_id}
            })
            if(!material){
                return res.status(400).json({ message: "Material not found!"})
            }
            if(material.plant !== plant){
                return res.status(400).json({ message: `Can't assign material ${material.plant} into location in ${plant}`})
            }

            const assignedMaterials = await SupplyLocation.findOne({
                where: {
                    material_id: material.material_id,
                }
            })
            if(assignedMaterials){
                return res.status(400).json({ 
                    message: `You can't assign material ${material.material_desc} in plant ${material.plant}. It was already assigned in ${assignedMaterials.dataValues.location_name} (${assignedMaterials.dataValues.plant})!`
                })
            }
        }
        const createdSupplyLocation = await SupplyLocation.bulkCreate(
            materials.map((material)=>({
                location_name: location_name,
                plant: plant,
                material_id: material.material_id,
                created_by: created_by,
                updated_by: updated_by
            }))
        )
        if(!createdSupplyLocation){
            return res.status(400).json({ message: "Supply location failed to created!" })
        }
        res.status(201).json({ message: "Successfully created!"})
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal server error!",
            error: error
        })
    }
}

export const updateSupplyLocation = async(req, res) => {
    try {
        const { old_location_name, old_materials, location_name, plant, materials, created_by, updated_by } = req.body
        console.log("body: ", req.body)
        if(!created_by || !updated_by){
            return res.status(401).json({ message: "Unauthorized! Please re-login and try again!"})
        }
        if(!location_name || !old_location_name){
            return res.status(400).json({ message: "Location name can't be empty!"})
        }
        if(old_location_name === location_name && JSON.stringify(old_materials) === JSON.stringify(materials)){
            return res.status(400).json({ message: "Can't update with the same location and same materials!"})
        }
        if(!plant){
            return res.status(400).json({ message: "Plant can't be empty!"})
        }
        if(materials.length === 0){
            return res.status(400).json({ message: "Please select at least one material!"})
        }
        for(let i=0; i<materials.length; i++){
            const material = await Material.findOne({
                where: { material_id: materials[i].material_id }
            })
            if(!material){
                return res.status(400).json({ message: `Material with ID ${materials[i].material_id} not found!`})
            }
            if(plant !== material.dataValues.plant){
                return res.status(400).json({ message: `Can't assign material plant ${material.dataValues.plant} into location in ${plant}`})
            }
        }
        
        // Delete all location
        await SupplyLocation.destroy({
            where: {
                location_name: old_location_name,
                plant: plant
            }
        })

        const updatedEntries = materials.map((material)=>({
            location_name: location_name,
            plant: plant,
            material_id: material.material_id,
            created_by: created_by,
            updated_by: updated_by
        }))

        // New bulk create for updated entries
        await SupplyLocation.bulkCreate(updatedEntries)

         res.status(200).json({ message: "Successfully updated!"})
    } catch (error) {
        console.error(error)
        res.status(500).json({ 
            message: "Internal server error!",
            error: error
        })
    }
}

export const deleteSupplyLocationByName = async(req, res) => {
    try {
        const { id } = req.params
        const foundLocation = await SupplyLocation.findOne({
            where: {
                id: id
            }
        })
        if(!foundLocation){
            return res.status(400).json({ message: "Location can't be deleted because the location was not found!"})
        }
        const location_name = foundLocation.dataValues.location_name
        const plant = foundLocation.dataValues.plant
        if(!location_name){
            return res.status(400).json({ message: "Please provide location name!"})
        }
        if(!plant){
            return res.status(400).json({ message: "Please provide plant!"})
        }
        await SupplyLocation.destroy({
            where: { 
                location_name: location_name,
                plant: plant
            }
        })
        res.status(200).json({ message: "Successfully deleted!"})

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error!"})
    }
}