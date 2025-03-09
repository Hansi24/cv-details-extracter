import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import JobApplication from "./schema/ApplicationSchema";
import { config } from "./config/config";
import cron from "node-cron";
import nodemailer from "nodemailer";
import { sendUnderReviewEmail } from "./email/underReviewMail";
import axios from "axios";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyDPBENRZcOm4Yrt-EpS7Gnomg7Aw5wCj7Q");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

// Route to Add a Job Application
app.post("/api/add/application", async (req: any, res: any) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newApplication = new JobApplication({ name, email, phone });
    await newApplication.save();

    res.json({ success: true, data: newApplication });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


app.post("/api/update/application", async (req: any, res: any) => {
  const prompt = `${req.body.full_text} 
  
  this is extracted cv data using python code now i need the json object like the following
  {
    "cv_data": {
    "personal_info": {  },
    "education": [ ],
    "qualifications": [],
    "projects": [ ],
    },
  }

  i need the above objects only in json format to send to the server no need other details. don't give unwanted quotation marks. give the exact json object as above.`;

  const result = await model.generateContent(prompt);
  const jsonString = result.response.text();
  const responseString = jsonString.replace(/^```json\n/, "").replace(/```$/, "");

  try {
    const jsonData = JSON.parse(responseString);
    const document = await JobApplication.findById(req.body.application_id);
    if (!document) {
      return res.status(404).json({ error: "Application not found" });
    }
    document.file_url = `${config.S3BucketURl}${req.body.file_url}`;
    document.cv_data = jsonData.cv_data;
    document.status = "PROCESSED";
    await document.save();
    const cvData = {
      "personal_info": document.cv_data.personal_info,
      "education": document.cv_data.education,
      "qualifications": document.cv_data.qualifications,
      "projects": document.cv_data.projects,
      "cv_public_link": document.file_url
    };
    const metaData = {
      "applicant_name": document.name,
      "email": document.email,
      "status": "prod",
      "cv_processed": document.status === "PROCESSED",
      "processed_timestamp": document.createdAt,
    };
    const data = { cv_data:cvData, metadata:metaData }
    const response = await axios.post('https://rnd-assignment.automations-3d6.workers.dev', data, { headers: {'X-Candidate-Email': config.CandidateEmail}});
    console.log(response.data);
  } catch (error) {
    const document = await JobApplication.findById(req.body.application_id);
    if (!document) {
      return res.status(404).json({ error: "Application not found" });
    }
    document.file_url = `${config.S3BucketURl}${req.body.file_url}`;
    document.status = "PROCESSED";
    document?.save();
    console.error("Error parsing JSON:", error);
  }
  res.status(200).json({ success: true });
});

cron.schedule("0 * * * *", async () => {
  console.log("Cron job triggered at:", new Date().toISOString());
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    // const twentyMinutesAgo = new Date();
    // twentyMinutesAgo.setMinutes(twentyMinutesAgo.getMinutes() - 20);


    // Find documents updated 24 hours ago
    const pendingDocuments = await JobApplication.find({
      status: "PROCESSED",
      createdAt: { $lte: twentyFourHoursAgo },
    });

    for (const doc of pendingDocuments) {
      // Send email
      await sendUnderReviewEmail(doc.email);
      doc.status = "UNDER_REVIEW";
      await doc.save();
      console.log(`Email sent to ${doc.email}`);
    }
  } catch (error) {
    console.error("Error sending review emails:", error);
  }
});
// Start the Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
