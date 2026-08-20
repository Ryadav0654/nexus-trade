import { Router } from "express";
import { login, register } from "../controllers/auth-controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router: Router = Router();

router.post("/login", asyncHandler(login));
router.post("/register", asyncHandler(register));

export default router;
