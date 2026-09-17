import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@roadify/api-zod";

const router: IRouter = Router();

const sendHealth = (_req: any, res: any) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
};

router.get("/", sendHealth);
router.get("/health", sendHealth);
router.get("/healthz", sendHealth);

export default router;
