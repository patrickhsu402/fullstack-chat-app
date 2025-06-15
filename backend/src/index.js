import express from 'express';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {app,server} from './lib/socket.js';

import path from 'path';

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin:"http://localhost:5173", // Allow requests from the frontend running on port 5173
  credentials: true // Allow cookies to be sent with requests
}));

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname,"../frontend/dist")));
  app.get("/(.*)/",(req,res)=>{
    res.sendFile(path.resolve(_dirname,"../frontend","dist","index.html"));
  });
}




server.listen(PORT, () => {
  console.log('Server is running on http://localhost:' + PORT);
  connectDB();
});