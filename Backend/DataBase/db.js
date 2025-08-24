import mongoose from "mongoose"

export const connectToDb = async()=>{
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Data base connect successfully.");
    } catch (error) {
        console.log("Failed to connect db",error.message)
    }
}