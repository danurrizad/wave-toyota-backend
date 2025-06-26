import SupplyQty from "../models/SupplyQtyModel.js";
import Material from "../models/MaterialModel.js";

export const getSupplyQty = async(req, res) => {
    try {
        // Synchronize Gentani with Material table changes
        const materials = await Material.findAll();
        const syncPromises = materials.map(async (material) => {
          await SupplyQty.update(
            {
              material_desc: material.material_desc,
              material_no: material.material_no,
              plant: material.plant,
              uom: material.uom,
              pack: material.pack
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

        const { plant } = req.query
        let condition = {}
        if(plant){
          condition.plant = plant
        }
        const response = await SupplyQty.findAll({
          where: condition
        });
        if(!response){
            res.status(404).json({ message: "No Supply Qty data found!"})
            return
        }
        res.status(200).json({ message: "All supply qty data found!", data: response})

    } catch (error) {
        res.status(500).json({ message: "Internal server error!", error: error.message})
    }
}

export const getSupplyQtyByNoPlant = async(req, res) => {
  try {
    const { material_no, plant } = req.params
    if(!material_no || !plant){
      return res.status(400).json({ message: `Please provide material no and plant!`})
    }
    const found = await SupplyQty.findOne({
      where: {
        material_no: material_no,
        plant: plant
      }
    })
    if(!found){
      return res.status(400).json({ message: `Material No. ${material_no} in plant ${plant} not found!`})
    }
    res.status(200).json({ message: "Supply qty data found!", data: found})
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Internal server error!", error: error})
  }
}


export const updateSupplyQty = async(req, res) => {
    try {
      const materialNo = req.params.materialNo
      const { qty, updated_by, plant } = req.body
  
      if(!materialNo){
        return res.status(404).json({ message: "Please provide material no!"})
      }
  
      if(!qty){
        return res.status(404).json({ message: "Please fill out all required fields!"})
      }

      const supplyFound = await SupplyQty.findOne({
        where: {
            material_no: materialNo,
            plant: plant
        }
      })

      if(!supplyFound){
        return res.status(404).json({ message: `Supply for Material No. ${materialNo} in ${plant} not found!`})
      }

      if(qty === supplyFound.qty){
        return res.status(400).json({ message: "Can't update qty with the same value!"})
      }
  
      await SupplyQty.update({
        qty: qty,
        updated_by: updated_by
      }, {
        where: {
          material_no: materialNo,
          plant: plant
        }
      })
  
      res.status(201).json({ message: `Supply Qty for Material ${materialNo} in ${plant} updated`})
      
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message})
    }
  }