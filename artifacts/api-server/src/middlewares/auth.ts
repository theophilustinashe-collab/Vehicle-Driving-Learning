import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../lib/logger";

const JWT_SECRET = process.env.SESSION_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  logger.fatal("SESSION_SECRET is not set in production!");
  process.exit(1);
}

const FALLBACK_SECRET = "vid-master-dev-only-secret-12345";
const SECRET = JWT_SECRET || FALLBACK_SECRET;

export interface AuthPayload {
  userId: number;
  role: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, SECRET) as AuthPayload;
    (req as Request & { user: AuthPayload }).user = payload;
    next();
  } catch (err: any) {
    logger.warn({ err: err.message }, "Invalid token attempt");
    res.status(401).json({ error: "Invalid or expired session" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = (req as Request & { user?: AuthPayload }).user;
  if (!user || user.role !== "admin") {
    logger.warn({ userId: user?.userId }, "Unauthorized admin access attempt");
    res.status(403).json({ error: "Access denied" });
    return;
  }
  next();
}

export function signToken(payload: AuthPayload): string {
  // Use a shorter expiration for access tokens (2 hours)
  return jwt.sign(payload, SECRET, { expiresIn: "2h" });
}
