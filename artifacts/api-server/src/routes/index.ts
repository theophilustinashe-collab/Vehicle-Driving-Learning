import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import questionsRouter from "./questions";
import testsRouter from "./tests";
import progressRouter from "./progress";
import signsRouter from "./signs";
import adminRouter from "./admin";
import garageRouter from "./garage";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/questions", questionsRouter);
router.use("/tests", testsRouter);
router.use("/progress", progressRouter);
router.use("/signs", signsRouter);
router.use("/admin", adminRouter);
router.use("/garage", garageRouter);

export default router;
