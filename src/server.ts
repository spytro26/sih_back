import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import lcaRoutes from "./routes/lca.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// If you want to restrict origins later, set ALLOWED_ORIGINS in .env
// By default, we allow all origins (*) to avoid CORS issues
const OPEN_CORS = (process.env.OPEN_CORS || "true").toLowerCase() === "true";

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS Configuration (open by default)
app.use(
  cors({
    origin: OPEN_CORS ? true : (origin, callback) => callback(null, true),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
    maxAge: 86400, // cache preflight for 1 day
  })
);

// Handle preflight for all routes (Express 5 compatible)
app.options(
  /.*/,
  cors({
    origin: OPEN_CORS ? true : (origin, callback) => callback(null, true),
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "LCA Backend Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/lca", lcaRoutes);

// Global error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error handler:", error);
    res.status(error.status || 500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The requested route ${req.originalUrl} does not exist`,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 LCA Backend Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);

  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});
