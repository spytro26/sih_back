import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import lcaRoutes from "./routes/lca.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// Open CORS by default (allow from any origin)
const OPEN_CORS = (process.env.OPEN_CORS || "true").toLowerCase() === "true";

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Add PNA header for preflight compatibility when accessing local/private servers from HTTPS origins
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

// CORS Configuration (fully open when OPEN_CORS=true)
app.use(
  cors({
    origin: OPEN_CORS ? "*" : true, // star is fine since we do not allow credentials
    credentials: false, // must be false when Access-Control-Allow-Origin is '*'
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    // Omit allowedHeaders so CORS middleware reflects back Access-Control-Request-Headers
    optionsSuccessStatus: 204,
    maxAge: 86400, // cache preflight for 1 day
  })
);

// Handle preflight for all routes (Express 5 compatible)
app.options(
  /.*/,
  cors({
    origin: OPEN_CORS ? "*" : true,
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    optionsSuccessStatus: 204,
    maxAge: 86400,
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
