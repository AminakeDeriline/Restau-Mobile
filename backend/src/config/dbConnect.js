import mongoose from "mongoose";

async function connectDB(){
    try{
       const connect = await mongoose.connect(process.env.MONGO_URI)
       if(connect){
        console.log("Database connected successfully");
       }
    }
    catch(error){
        console.log("Error connecting to database:",error);
    }
}
export default connectDB;
