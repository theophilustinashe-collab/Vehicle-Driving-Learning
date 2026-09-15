import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { rateLimit } from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Security Headers
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: "Too many requests, please try again later." },
});

app.use("/api/", limiter);

app.get("/ping", (_req, res) => res.send("pong"));

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
  "https://roadify-app.vercel.app",
  // Add other production origins here
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || origin.startsWith("http://192.168.")) {
      callback(null, true);
    } else {
      logger.warn({ origin }, "CORS blocked origin");
      callback(new Error("Not allowed by CORS"));
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

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err, url: _req.url }, "Unhandled Error");
  res.status(err.status || 500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred"
  });
});

export default app;
