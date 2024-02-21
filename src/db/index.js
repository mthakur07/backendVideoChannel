import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
    try {
        const conntectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MongoDB Connected !! DB Host : ${conntectionInstance.connection.host}`)

    } catch (err) {
        console.log("MONGODB CONNECTION ERROR", err);
        process.exit();
    }
}
export default connectDB;