import * as ai from '../services/ai.service.js'

export const getResult=async(req,res)=>{
    try{
        const {prompt}=req.query;
        const result=await ai.generateResult(prompt);
        res.send(result);
    }catch(err){
        return res.status(400).json({error:err});
    }
}