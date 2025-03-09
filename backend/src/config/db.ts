import mongoose from 'mongoose';
import { config } from './config';

const connectDB = async () => {
  mongoose.connect(config.DB_URI)
  .then((con)=>console.log(`MongoDB is connected to the host :${con.connection.name}`))
  .catch((err)=>{
      console.log(err)
  })
};

export default connectDB;
