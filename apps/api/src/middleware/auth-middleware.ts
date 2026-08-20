import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import env from "../utils/env.js";
import type { TokenPayload } from "../utils/auth.js";

export const requireAuth: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // const authHeader = req.headers.authorization;
    // const token =
    //   typeof authHeader === "string" && authHeader.startsWith("Bearer ")
    //     ? authHeader.split(' ')[1]
    //     : undefined;

    const token = req.cookies.access_token;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Missing auth token" });
    }

    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;

    if (!payload) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid auth token" });
    }
    req.userId = payload.userId;
    next();
  },
);
