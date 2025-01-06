import Monitoring from "../models/MonitoringModel.js";
import Material from "../models/MaterialModel.js";

export const getMonitoringAll = async(req, res) => {
    try {
        // Synchronize Gentani with Material table changes
        const materials = await Material.findAll();
        const syncPromises = materials.map(async (material) => {
          await Monitoring.update(
            {
              material_desc: material.material_desc,
              material_no: material.material_no,
              plant: material.plant,
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

        const monitoring = await Monitoring.findAll()
        if(!monitoring){
            return res.status(404).json({ message: "No Monitoring data found!"})
        }
        res.status(200).json({ message: "All Monitoring data found!", data: monitoring})
    } catch (error) {
        res.status(500).json({ message: "Internal server error!", error: error.message})
    }
}

export const updateMonitoring = async(req, res) => {
    try {
        const material_no = req.params.materialNo
        const {visualization_name, plant, updated_by} = req.body

        if(!material_no || !plant){
            return res.status(404).json({ message: "Please provide material no and plant!"})
        }
        if(!visualization_name){
            return res.status(404).json({ message: "Please fill out all forms!"})
        }

        const monitoringFound = await Monitoring.findOne({
            where: {
                material_no: material_no,
                plant: plant
            }
        })
        if(!monitoringFound){
            return res.status(404).json({ message: `Monitoring data for Material No. ${material_no} in ${plant} not found!`})
        }

        if(visualization_name === monitoringFound.visualization_name){
            return res.status(400).json({ message: "Can't update visualization name with the same value!"})
        }

        await Monitoring.update({
            visualization_name: visualization_name,
            updated_by: updated_by
        }, {
            where: {
                material_no: material_no,
                plant: plant
            }
        })
        res.status(201).json({ message: `Monitoring data for Material No. ${material_no} in ${plant} updated`})

    } catch (error) {
        res.status(500).json({ message: "Internal server error!", error: error.message})
    }
}