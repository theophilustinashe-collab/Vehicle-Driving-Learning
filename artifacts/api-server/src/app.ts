import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { rateLimit } from "express-rate-limit";
import path from "path";
import fs from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Security Headers
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // Limit each IP to 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

app.use("/api/", limiter);

app.get("/ping", (_req, res) => res.send("pong"));

// Health Check Endpoint (Required for Render & Mobile App Handshake)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://vehicle-driving-learning-4.onrender.com",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like native mobile apps)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.startsWith("http://192.168.") ||
      origin.endsWith(".onrender.com") ||
      origin.includes("localhost")
    ) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for mobile webview clients
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json({ limit: '10mb' })); // Increased for administrative asset uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging for debugging
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, "Incoming Request");
  next();
});

app.use("/api", router);

// Serve static web client if available (Unified Web UI + API Server)
const publicPaths = [
  path.resolve(process.cwd(), "artifacts/vid-master/dist/public"),
  path.resolve(process.cwd(), "../vid-master/dist/public"),
  path.resolve(import.meta.dirname, "../../vid-master/dist/public"),
  path.resolve(process.cwd(), "dist/public")
];

const staticDir = publicPaths.find(p => fs.existsSync(p));

if (staticDir) {
  logger.info({ staticDir }, "Serving static web client");
  app.use(express.static(staticDir));

  // Express 5 / path-to-regexp v8 wildcard syntax
  app.get("{*path}", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err, url: _req.url }, "Unhandled Error");
  res.status(err.status || 500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred"
  });
});

export default app;
