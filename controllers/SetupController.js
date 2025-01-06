import Setup from "../models/SetupModel.js";
import Material from "../models/MaterialModel.js";

export const getSetupAll = async(req, res) => {
    try {
        // Synchronize Gentani with Material table changes
        const materials = await Material.findAll();
        const syncPromises = materials.map(async (material) => {
          await Setup.update(
            {
              material_desc: material.material_desc,
              material_no: material.material_no,
              plant: material.plant,
              supply_line: material.supply_line
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

        const setup = await Setup.findAll()
        if(!setup){
            return res.status(404).json({ message: "No setup found!"})
        }

        res.status(200).json({ message: "All setup found", data: setup})
    } catch (error) {
        res.status(500).json({message: "Internal server error", eror: error.message})
    }
}

export const getSetupById = async(req, res) => {
    
}

export const updateSetup = async(req, res) => {
  try {
    const materialNo = req.params.materialNo
    const { standard_supply, critical_stock, total, updated_by, plant } = req.body

    if(!materialNo){
      return res.status(404).json({ message: "Please provide material no!"})
    }

    if(!standard_supply || !critical_stock || !total){
      return res.status(404).json({ message: "Please fill out all required fields!"})
    }

    if(standard_supply < 0 || critical_stock < 0 || total < 0){
      return res.status(400).json({ message: "Standard supply, critical stock, or total can't be less than 0!"})
    }

    await Setup.update({
      standard_supply: standard_supply,
      critical_stock: critical_stock,
      total: total,
      updated_by: updated_by
    }, {
      where: {
        material_no: materialNo,
        plant: plant
      }
    })

    res.status(201).json({ message: `Setup for Material ${materialNo} updated`})
    
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message})
  }
}