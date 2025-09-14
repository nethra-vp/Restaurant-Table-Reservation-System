import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log("Connection secured");
        })

        await mongoose.connect(`${process.env.MONGODB_URI}/menu`)   
    }
    catch(err) {
        console.error("Failed to connect to MongoDB:", err.message);
    }
}

export default connectDB
