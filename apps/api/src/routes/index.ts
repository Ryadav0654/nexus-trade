import { Router } from "express";
import authRoutes from "./auth-routes.js";

const appRouter: Router = Router();

appRouter.use("/auth", authRoutes);

export default appRouter;
