import Role from "../models/RoleModel.js";

export const getAllRole = async(req, res) => {
    try {
        const roles = await Role.findAll()
        if(!roles || roles.length === 0 || roles === null){
            return res.status(404).json({ message: "No roles found!"})
        }
        res.status(200).json({ message: "All roles found!", data: roles})
    } catch (error) {
        res.status(500).json({ message: "Internal server error!"})
    }
}

export const getRoleById = async(req, res) => {
    try {
        const roleId = req.params.id
        if(!roleId){
            return res.status(404).json({ message: "Please provide Role ID!"})
        }
        const roleFound = await Role.findOne({ where: { id: roleId } })
        if(!roleFound){
            return res.status(404).json({ message: "Role not found!"})
        }
        res.status(200).json({ message: "Role found", data: roleFound.role_name})
    } catch (error) {
        res.status(500).json({ message: "Internal server error!"})
    }
}

export const createRole = async(req, res) => {
    try {
        const role_name = req.body.role_name
        const roleFound = await Role.findOne({ where: { role_name: role_name}})
        if(roleFound){
            return res.status(400).json({ message: `Role ${role_name} already exist!`})

        }
        const roleCreated = await Role.create({ role_name })
        if(!roleCreated){
            return res.status(400).json({ message: "Failed to create role!"})
        }
        res.status(201).json({ message: `Role ${roleCreated.role_name} created!` })
    } catch (error) {
        res.status(500).json({ message: "Internal server error!"})
    }
}

export const updateRole = async(req, res) => {
    try {
        const role_name = req.body.role_name
        const role_id = req.params.role_id
        const roleFound = await Role.findOne({ where: { id: role_id}})
        if(!roleFound){
            return res.status(404).json({ message: "Role not found!"})
        }

        await Role.update({
            role_name
        }, {
            where: {
                id: role_id
            }
        })
        res.status(201).json({ message: "Role updated!"})
    } catch (error) {
        res.status(500).json({ message: "Internal server error!"})
    }
}

export const deleteRole = async(req, res) => {
    try {
        const role_id = req.params.role_id
        const roleFound = await Role.findOne({ where: { id: role_id }})
        if(!roleFound){
            return res.status(404).json({ message: "Role not found!"})
        }
        await Role.destroy({ where: { id: role_id}})
    } catch (error) {
        res.status(500).json({ message: "Internal server error!"})
    }
}