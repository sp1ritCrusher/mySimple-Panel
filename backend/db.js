import mongoose from "mongoose";

const uri = "mongodb+srv://lucasgiulerm:GAN3YqCGvx6G4ngp@cluster0.dgzjos9.mongodb.net/crudtest?appName=Cluster0"

export async function connectDB() {
    try {
        await mongoose.connect(uri);
        console.log("Connected succesfully on MongoDB");
    } catch (err) {
        console.error("Error connecting MongoDB:", err);
    }
}