import SupplyQty from "../models/SupplyQtyModel.js";
import Material from "../models/MaterialModel.js";

export const getSupplyQtyAll = async(req, res) => {
    try {
        // Synchronize Gentani with Material table changes
        const materials = await Material.findAll();
        const syncPromises = materials.map(async (material) => {
          await SupplyQty.update(
            {
              material_desc: material.material_desc,
              material_no: material.material_no,
              plant: material.plant,
              uom: material.uom
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

        const response = await SupplyQty.findAll();
        if(!response){
            res.status(404).json({ message: "No Supply Qty data found!"})
            return
        }
        res.status(200).json({ message: "All supply qty data found!", data: response})

    } catch (error) {
        res.status(500).json({ message: "Internal server error!", error: error.message})
    }
}


export const updateSupplyQty = async(req, res) => {
    try {
      const materialNo = req.params.materialNo
      const { qty, updated_by } = req.body
  
      if(!materialNo){
        return res.status(404).json({ message: "Please provide material no!"})
      }
  
      if(!qty){
        return res.status(404).json({ message: "Please fill out all required fields!"})
      }

      const supplyFound = await SupplyQty.findOne({
        where: {
            material_no: materialNo
        }
      })

      if(!supplyFound){
        return res.status(404).json({ message: `Supply for Material No. ${materialNo} not found!`})
      }

      if(qty === supplyFound.qty){
        return res.status(400).json({ message: "Can't update qty with the same value!"})
      }
  
      const response = await SupplyQty.update({
        qty: qty,
        updated_by: updated_by
      }, {
        where: {
          material_no: materialNo
        }
      })
  
      res.status(201).json({ message: `Supply Qty for Material ${materialNo} updated`})
      
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message})
    }
  }