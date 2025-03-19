import projectModel from "../models/project.model.js";
import mongoose from "mongoose";

export const createProject=async({name,userId})=>{
    
    if(!name){
        throw new Error('name is required');
    }
    if(!userId){
        throw new Error('userId is required');
    }
 
    const Project=await projectModel.create({     
        name,       
        users:userId,
    })

    return Project;
}

export const getAllProjectByUserId=async(userId)=>{
    
    if(!userId){
        throw new Error('userId is required');    
    }

    userId=userId.userId;
    const allUserProject=await projectModel.find({
        users:userId,
    })

    return allUserProject;
}

export const addUsersToProject=async({users,projectId,userId})=>{

    if(!projectId)
    {
        throw new Error('projectId is required');
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error("invalid projectid")
    }

    if(!users)
    {
        throw new Error('users is required');
    }

    if(!userId)
    {
        throw new Error('userId is required');
    }

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new Error("invalid userId")
    }

    if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
        throw new Error("Invalid userId(s) in users array")
    }

    
    const project=await projectModel.find({
        _id:projectId,
        users:userId
    })

    if(!project)
    {
        throw new Error('user not belongs to this project');
    }



    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        $addToSet: {
            users: {
                $each: users
            }
        }
    }, {
        new: true
    })
    return updatedProject;
}

export const getProjectById=async({projectId})=>{
    if(!projectId)
    {
        throw new Error('userId is required');
    }
    
    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error("invalid projectId")
    }

    const project=await projectModel.findOne({_id:projectId}).populate("users");

    return project;
}