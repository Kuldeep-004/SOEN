import mongoose from 'mongoose';

const dbConnect=async function(){
    await mongoose.connect(process.env.MONGO_URI)
    .then(()=>{console.log("Connected To MONGODB")})
    .catch((err)=>{console.log(err)})
}

export default dbConnect;