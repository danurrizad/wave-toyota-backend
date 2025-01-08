import RatioProd from "../models/RatioProdModel.js";

export const getRatioProdAll = async(req, res) => {
    try {
        const ratio = await RatioProd.findOne({ where: { id_production: 1 }})
        if(!ratio || ratio.length === 0){
            const initialRatio = await RatioProd.create({
                id_production: 1,
                fortuner: 0,
                zenix: 0,
                innova: 0,
                avanza: 0,
                yaris: 0,
                calya: 0,
                tact_time_1: 0,
                tact_time_2: 0,
                efficiency_1: 0,
                efficiency_2: 0,
            })
            return res.status(201).json({ message: "Initial ratio created!", data: initialRatio})
        }
        res.status(200).json({ message: "Ratio data found!", data: ratio})
    } catch (error) {
        res.status(500).json({ message: "Internal server error!", error: error.message})
    }
}


export const updateRatioProd = async(req, res) => {
    try {
        const id_production = req.params.ratio_id
        const { fortuner, zenix, innova, avanza, yaris, calya, tact_time_1, tact_time_2, efficiency_1, efficiency_2 } = req.body
        if(!fortuner || !zenix || !innova || !avanza || !yaris || !calya || !tact_time_1 || !tact_time_2 || !efficiency_1 || !efficiency_2) {
            return res.status(404).json({ message: "Please provide all fields!"})
        }

        await RatioProd.update({
            fortuner: Number(fortuner),
            zenix: Number(zenix),
            innova: Number(innova),
            avanza: Number(avanza),
            yaris: Number(yaris),
            calya: Number(calya),
            tact_time_1: Number(tact_time_1),
            tact_time_2: Number(tact_time_2),
            efficiency_1: Number(efficiency_1),
            efficiency_2: Number(efficiency_2),
        }, {
            where: {
                id_production: id_production
            }
        })

        res.status(201).json({ message: "Ratio updated successfully!"})

    } catch (error) {
        res.status(500).json({ message: "Internal server error!", error: error.message})
    }
}