import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";

import { getServices, getAllServicesAdmin, createService, updateService, deleteService } from "./controllers/servicesController";
import { getDocuments, createDocument, deleteDocument } from "./controllers/documentsController";
import { createContactMessage, getContactMessages, markMessageRead } from "./controllers/contactController";
import { getFaculties, createFaculty, updateFaculty, deleteFaculty } from "./controllers/facultyController";
import { getStudents, createStudent, updateStudent, deleteStudent } from "./controllers/studentController";
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from "./controllers/teamController";
import { verifyClerkToken, verifyAnyClerkToken } from "./middleware/clerkAuth";
import { handleLoginEvent, handleAdminBroadcast } from "./controllers/emailController";
import { getIncomingEmails } from "./controllers/inboxController";

// Load Environment Configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// Serve uploads statically in production so multi-container setup can fetch from backend
const uploadPath = process.env.NODE_ENV === "production" || process.env.PORT
  ? path.join(__dirname, "..", "uploads")
  : path.join(__dirname, "..", "..", "frontend", "public", "uploads");

app.use("/uploads", express.static(uploadPath));

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Strict 10MB limit to prevent DoS attacks
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif"
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Security Alert: Only safe document/image uploads are allowed (.pdf, .doc, .docx, .txt, .jpg, .png, .webp, .gif)."));
    }
  }
});

// API Route Mappings

// Services Endpoints
app.get("/api/services", getServices);
app.get("/api/services/admin", verifyClerkToken, getAllServicesAdmin);
app.post("/api/services", verifyClerkToken, createService);
app.put("/api/services", verifyClerkToken, updateService);
app.delete("/api/services", verifyClerkToken, deleteService);

// Documents Endpoints
app.get("/api/documents", getDocuments);
app.post("/api/documents", verifyClerkToken, upload.single("file"), createDocument);
app.delete("/api/documents", verifyClerkToken, deleteDocument);

// Contact Messages Endpoints
app.post("/api/contact", createContactMessage);
app.get("/api/contact/messages", verifyClerkToken, getContactMessages);
app.put("/api/contact/read", verifyClerkToken, markMessageRead);

// Faculty Endpoints
app.get("/api/faculties", getFaculties);
app.post("/api/faculties", verifyClerkToken, createFaculty);
app.put("/api/faculties", verifyClerkToken, updateFaculty);
app.delete("/api/faculties", verifyClerkToken, deleteFaculty);

// Student Endpoints
app.get("/api/students", getStudents);
app.post("/api/students", verifyClerkToken, createStudent);
app.put("/api/students", verifyClerkToken, updateStudent);
app.delete("/api/students", verifyClerkToken, deleteStudent);

// Team Members Endpoints
app.get("/api/team", getTeamMembers);
app.post("/api/team", verifyClerkToken, createTeamMember);
app.put("/api/team", verifyClerkToken, updateTeamMember);
app.delete("/api/team", verifyClerkToken, deleteTeamMember);

// Email Service Endpoints
app.post("/api/auth/login-event", verifyAnyClerkToken, handleLoginEvent);
app.post("/api/admin/send-email", verifyClerkToken, handleAdminBroadcast);
app.get("/api/admin/inbox", verifyClerkToken, getIncomingEmails);



// Root API documentation interface
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Legezt API Gateway</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg-dark: #09090b;
          --bg-card: rgba(24, 24, 27, 0.6);
          --accent-primary: #8b5cf6;
          --accent-secondary: #d946ef;
          --text-main: #f4f4f5;
          --text-muted: #a1a1aa;
          --border: rgba(63, 63, 70, 0.4);
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Outfit', sans-serif;
          background-color: var(--bg-dark);
          color: var(--text-main);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow-x: hidden;
          position: relative;
        }
        body::before, body::after {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(0,0,0,0) 70%);
          z-index: 1;
          pointer-events: none;
        }
        body::before { top: -10%; left: -10%; }
        body::after { bottom: -10%; right: -10%; }

        .gateway-container {
          width: 100%;
          max-width: 800px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          backdrop-filter: blur(16px);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          z-index: 2;
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .logo-container {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .logo-glow {
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border-radius: 50%;
          box-shadow: 0 0 16px var(--accent-primary);
        }
        .title {
          font-size: 2.25rem;
          font-weight: 700;
          letter-spacing: -0.05em;
          background: linear-gradient(135deg, #ffffff 30%, var(--text-muted) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          font-size: 1rem;
          color: var(--text-muted);
        }

        .health-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 40px;
        }
        .health-card {
          background: rgba(39, 39, 42, 0.4);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .health-card:hover {
          border-color: var(--accent-primary);
          transform: translateY(-2px);
        }
        .health-card-title {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .health-card-value {
          font-size: 1.15rem;
          font-weight: 600;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .status-dot {
          width: 10px;
          height: 10px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 10px #10b981;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 10px;
        }
        .endpoint-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .endpoint-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(24, 24, 27, 0.4);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 20px;
          transition: all 0.3s ease;
        }
        .endpoint-item:hover {
          background: rgba(39, 39, 42, 0.3);
        }
        .endpoint-path {
          font-family: monospace;
          font-size: 0.95rem;
          color: #ffffff;
        }
        .endpoint-methods {
          display: flex;
          gap: 6px;
        }
        .badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .badge-get { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
        .badge-post { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
        .badge-put { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
        .badge-delete { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }

        .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      </style>
    </head>
    <body>
      <div class="gateway-container">
        <div class="header">
          <div class="logo-container">
            <div class="logo-glow"></div>
            <div class="title">Legezt API Gateway</div>
          </div>
          <p class="subtitle">Secure high-performance Express & MongoDB backend distribution system</p>
        </div>

        <div class="health-grid">
          <div class="health-card">
            <div class="health-card-title">System Status</div>
            <div class="health-card-value">
              <span class="status-dot"></span> Active
            </div>
          </div>
          <div class="health-card">
            <div class="health-card-title">Database</div>
            <div class="health-card-value" style="color: #10b981;">
              Connected
            </div>
          </div>
          <div class="health-card">
            <div class="health-card-title">Environment</div>
            <div class="health-card-value" style="color: var(--accent-primary);">
              Production
            </div>
          </div>
          <div class="health-card">
            <div class="health-card-title">Frontend Status</div>
            <div class="health-card-value">
              <a href="https://mrlegezt.me" target="_blank" style="color: #10b981; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 1.05rem;">
                <span class="status-dot" style="background: #10b981; box-shadow: 0 0 10px #10b981;"></span> Linked
              </a>
            </div>
          </div>
        </div>

        <div class="section-title">Available Service Endpoints</div>
        <div class="endpoint-list">
          <div class="endpoint-item">
            <span class="endpoint-path">/api/services</span>
            <div class="endpoint-methods">
              <span class="badge badge-get">GET</span>
              <span class="badge badge-post">POST</span>
              <span class="badge badge-put">PUT</span>
              <span class="badge badge-delete">DELETE</span>
            </div>
          </div>
          <div class="endpoint-item">
            <span class="endpoint-path">/api/documents</span>
            <div class="endpoint-methods">
              <span class="badge badge-get">GET</span>
              <span class="badge badge-post">POST</span>
              <span class="badge badge-delete">DELETE</span>
            </div>
          </div>
          <div class="endpoint-item">
            <span class="endpoint-path">/api/contact</span>
            <div class="endpoint-methods">
              <span class="badge badge-get">GET</span>
              <span class="badge badge-post">POST</span>
              <span class="badge badge-put">PUT</span>
            </div>
          </div>
          <div class="endpoint-item">
            <span class="endpoint-path">/health</span>
            <div class="endpoint-methods">
              <span class="badge badge-get">GET</span>
            </div>
          </div>
        </div>

        <div class="footer">
          © ${new Date().getFullYear()} Legezt. All rights reserved. Powered by Microsoft Azure App Service.
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", database: "connected" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Legezt Express server running on http://localhost:${PORT}`);
});
