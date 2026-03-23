import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./plants/auth";
import scanRouter from "./plants/scan";
import gardenRouter from "./plants/garden";
import favoritesRouter from "./plants/favorites";
import scansRouter from "./plants/scans";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/plants/auth", authRouter);
router.use("/plants/scan", scanRouter);
router.use("/plants/garden", gardenRouter);
router.use("/plants/favorites", favoritesRouter);
router.use("/plants/scans", scansRouter);

export default router;
