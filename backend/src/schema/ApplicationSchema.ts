import mongoose, { Document, Schema } from "mongoose";

// Define an interface for TypeScript support
interface IApplication extends Document {
  name: string;
  email: string;
  phone: string;
  status: string;
  cv_data: any;
  file_url: string;
  createdAt: Date;
}

// Define the Mongoose Schema
const ApplicationSchema = new Schema<IApplication>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true, // Ensures no duplicate emails
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"], // Basic email validation
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    cv_data:{
      type: Schema.Types.Mixed,
      default: {},
    },
    file_url:{
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["PROCESSING","PROCESSED","UNDER_REVIEW", "REVIEWED", "ACCEPTED", "REJECTED"],
      default: "PROCESSING",
    },
  },
  { timestamps: true }
);

// Create the Mongoose model
const JobApplication = mongoose.model<IApplication>(
  "Application",
  ApplicationSchema
);

export default JobApplication;
