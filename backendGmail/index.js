import express from "express";
import dotenv from "dotenv";
import { sendMails, readMails, sentMails } from "./controllers/emailController.js";
import { gemini } from "./controllers/gemini.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import emailRoutes from "./route/emailRoutes.js"
import databaseConnection from "./config/database.js";

dotenv.config({
  path: './.env'
});
const app = express();
databaseConnection();
const port = process.env.PORT || 7000;
app.use(express.urlencoded({ extended: true }));
const corsOptions ={
  origin:['http://localhost:3001','http://localhost:3000'], 
  credentials:true,       
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/emails',emailRoutes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});