import RatioProd from "../models/RatioProdModel.js";

export const getRatioProdAll = async(req, res) => {
    try {
        const ratio = await RatioProd.findAll()
        res.status(200).json({ message: "All ratio found!", data: ratio})
    } catch (error) {
        res.status(500).json({ message: "Internal server error!", error: error.message})
    }
}

export const createRatioProd = async(req, res) => {
    try {
        const { fortuner, zenix, innova, avanza, yaris, calya } = req.body
        if(!fortuner || !zenix || !innova || !avanza || !yaris || !calya) {
            return res.status(404).json({ message: "Please provide all fields!"})
        }

        const ratioCreated = await RatioProd.create({
            fortuner: fortuner,
            zenix: zenix,
            innova: innova,
            avanza: avanza,
            yaris: yaris,
            calya: calya
        })

        if(!ratioCreated){
            return res.status(400).json({ message: "Error when creating!"})
        }

        res.status(201).json({ message: "Ratio production created!", data: ratioCreated})

    } catch (error) {
        res.status(500).json({ message: "Internal server error!", error: error.message})
        
    }
}

export const updateRatioProd = async(req, res) => {
    try {
        const ratio_id = req.params.ratio_id
        const { fortuner, zenix, innova, avanza, yaris, calya } = req.body
        if(!fortuner || !zenix || !innova || !avanza || !yaris || !calya) {
            return res.status(404).json({ message: "Please provide all fields!"})
        }

        await RatioProd.update({
            fortuner: fortuner,
            zenix: zenix,
            innova: innova,
            avanza: avanza,
            yaris: yaris,
            calya: calya
        }, {
            where: {
                ratio_id: ratio_id
            }
        })

        res.status(201).json({ message: "Ratio updated successfully!"})

    } catch (error) {
        res.status(500).json({ message: "Internal server error!", error: error.message})
    }
}