import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";

import { getServices, getAllServicesAdmin, createService, updateService, deleteService } from "./controllers/servicesController";
import { getDocuments, createDocument, deleteDocument } from "./controllers/documentsController";
import { createContactMessage, getContactMessages, markMessageRead } from "./controllers/contactController";

// Load Environment Configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save uploads directly into Next.js public/uploads folder so the frontend can serve them statically
    const uploadPath = path.join(__dirname, "..", "..", "frontend", "public", "uploads");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// API Route Mappings

// Services Endpoints
app.get("/api/services", getServices);
app.get("/api/services/admin", getAllServicesAdmin);
app.post("/api/services", createService);
app.put("/api/services", updateService);
app.delete("/api/services", deleteService);

// Documents Endpoints
app.get("/api/documents", getDocuments);
app.post("/api/documents", upload.single("file"), createDocument);
app.delete("/api/documents", deleteDocument);

// Contact Messages Endpoints
app.post("/api/contact", createContactMessage);
app.get("/api/contact/messages", getContactMessages);
app.put("/api/contact/read", markMessageRead);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", database: "connected" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Legezt Express server running on http://localhost:${PORT}`);
});
