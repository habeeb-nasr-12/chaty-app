import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/soket.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";

dotenv.config();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();
// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
    origin: "*",
    credentials: true
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
    const frontendDistPath = path.join(__dirname, "..", "dist");
    
    // Check if dist directory exists
    try {
        if (fs.existsSync(frontendDistPath)) {
            app.use(express.static(frontendDistPath));
            app.get("*", (req, res) => {
                res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
                    if (err) {
                        console.error("Error serving index.html:", err);
                        res.status(500).send("Internal Server Error");
                    }
                });
            });
            console.log("Serving static files from:", frontendDistPath);
        } else {
            console.warn("Frontend dist directory not found at:", frontendDistPath);
            app.get("*", (req, res) => {
                res.status(404).send("Frontend not built. Please run 'npm run build' first.");
            });
        }
    } catch (error) {
        console.error("Error setting up static file serving:", error);
    }
}

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});





