import express from "express";
import type { Request, Response, NextFunction } from "express";
import geminiService from "../services/geminiService.js";

const router = express.Router();

// Input validation middleware
const validateLCAInput = (req: Request, res: Response, next: NextFunction) => {
  const { material, process } = req.body;

  if (
    !material ||
    typeof material !== "string" ||
    material.trim().length === 0
  ) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Material is required and must be a non-empty string",
    });
  }

  if (!process || typeof process !== "string" || process.trim().length === 0) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Process is required and must be a non-empty string",
    });
  }

  // Sanitize input
  req.body.material = material.trim();
  req.body.process = process.trim();

  next();
};

// Rate limiting helper (simple in-memory implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per window
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const rateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const clientId = req.ip || "unknown";
  const now = Date.now();

  const clientData = requestCounts.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + WINDOW_MS });
    return next();
  }

  if (clientData.count >= RATE_LIMIT) {
    return res.status(429).json({
      error: "Rate Limit Exceeded",
      message: "Too many requests. Please try again later.",
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
    });
  }

  clientData.count++;
  next();
};

/**
 * POST /api/lca/assess
 * Performs lifecycle assessment using AI
 */
router.post(
  "/assess",
  rateLimitMiddleware,
  validateLCAInput,
  async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      console.log("🔍 LCA Assessment Request:", {
        material: req.body.material,
        process: req.body.process,
        timestamp: new Date().toISOString(),
        ip: req.ip,
      });

      const lcaInput = {
        material: req.body.material,
        process: req.body.process,
        emissions: req.body.emissions || {},
        location: req.body.location,
        production_volume: req.body.production_volume,
        energy_source: req.body.energy_source,
        ...req.body,
      };

      // Call Gemini AI service
      const assessmentResult = await geminiService.assessLifecycle(lcaInput);

      const processingTime = Date.now() - startTime;

      console.log("✅ LCA Assessment Completed:", {
        stages: assessmentResult.length,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        data: assessmentResult,
        metadata: {
          request_id: `lca_${Date.now()}`,
          processing_time_ms: processingTime,
          stages_analyzed: assessmentResult.length,
          timestamp: new Date().toISOString(),
          disclaimer:
            "This assessment includes both verified data and hypothetical suggestions. Please validate recommendations with industry experts before implementation.",
        },
      });
    } catch (error) {
      console.error("❌ LCA Assessment Error:", error);

      const errorResponse = {
        success: false,
        error: "Assessment Failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      };

      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes("API")) {
          res.status(503).json({
            ...errorResponse,
            error: "AI Service Unavailable",
            message:
              "The AI assessment service is temporarily unavailable. Please try again later.",
          });
        } else if (error.message.includes("rate limit")) {
          res.status(429).json({
            ...errorResponse,
            error: "Rate Limit Exceeded",
            message: "Too many requests. Please try again later.",
          });
        } else {
          res.status(500).json(errorResponse);
        }
      } else {
        res.status(500).json(errorResponse);
      }
    }
  }
);

/**
 * GET /api/lca/health
 * Health check for LCA service
 */
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    service: "LCA Assessment API",
    version: "1.0.0",
    features: [
      "Lifecycle Assessment Analysis",
      "AI-powered Impact Assessment",
      "Circularity Opportunities",
      "Alternative Methods Suggestions",
      "Reduction Recommendations",
    ],
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/lca/supported-materials
 * Returns list of supported materials and processes
 */
router.get("/supported-materials", (req: Request, res: Response) => {
  res.status(200).json({
    materials: [
      "Iron ore",
      "Copper ore",
      "Aluminum ore (Bauxite)",
      "Gold ore",
      "Silver ore",
      "Zinc ore",
      "Lead ore",
      "Nickel ore",
      "Platinum group metals",
      "Rare earth elements",
      "Coal",
      "Limestone",
      "Sand and gravel",
      "Steel",
      "Aluminum",
      "Copper",
    ],
    processes: [
      "Open-pit mining",
      "Underground mining",
      "Strip mining",
      "Placer mining",
      "Smelting",
      "Refining",
      "Electrowinning",
      "Flotation",
      "Magnetic separation",
      "Gravity separation",
      "Leaching",
      "Roasting",
      "Sintering",
      "Pelletizing",
    ],
    note: "The AI system can analyze any material or process. This list shows common examples.",
    timestamp: new Date().toISOString(),
  });
});

export default router;
