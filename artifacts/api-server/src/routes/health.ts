import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@roadify/api-zod";

const router: IRouter = Router();

router.get(["/", "/health", "/healthz"], (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
