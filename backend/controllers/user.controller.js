import userModel from "../models/user.model.js";
import * as userService from "../services/user.services.js";
import {validationResult} from 'express-validator';
import redisClient from "../services/redis.service.js";

export const createUserController=async(req,res)=>{
    let error=validationResult(req);

    if(!error.isEmpty())
    {
        return res.status(400).json({
            errors:error.array()
        })
    }
    try{
        let user=await userService.createUser(req.body);

        const token=await user.generateJWT();

        user=user.toObject();
        delete user.password;

        return res.status(200).send({user,token});
    }catch(error){
        return res.status(400).send(error.message);
    }

}

export const loginController=async(req,res)=>{
    const error=validationResult(req);

    if(!error.isEmpty())
    {
        return res.status(400).json({
            errors:error.array()
        })
    }
    try{
        const {email,password}=req.body;
        if(!email || !password)
        {
            return res.status(400).json("email and password both are mandatory")
        }

        let user=await userModel.findOne({email}).select('+password');

        if(!user)
        {
            return res.status(401).json({
                errors:'Invalid credentials'
            })
        }

        const isMatch=await user.isValidPassword(password);

        if(!isMatch)
        {
            return res.status(401).json({
                errors:'Invalid credentials'
            })
        }

        const token=await user.generateJWT();
        
        user=user.toObject();
        delete user.password;

        res.status(200).json({user,token});

    }catch(err){
        return res.status(400).send({message:err.message});
    }
}

export const profileController=async (req,res)=>{
    res.status(200).json({  
        user:req.user,
    })         
}

export const logoutController=async(req,res)=>{
    try{
        const token=req.cookies?.token || req.headers.authorization?.split(' ')[1];
        redisClient.set(token,'logout','EX',60*60*24);

        res.status(200).json({
            message:'logout successfully',
        })
 
    }catch(error){
        return res.status(400).json({message:error.message});
    }
}

export const getAllUserController=async(req,res)=>{
    try{
        const loggedInUser=await userModel.findOne({
            email:req.user.email, 
        })
        const allUsers=await userService.getAllUser(loggedInUser._id);

        return res.status(200).json({users:allUsers});

    }catch(err){
        console.log(err);
        return res.status(400).json({
            error:err,
        })
    }
}