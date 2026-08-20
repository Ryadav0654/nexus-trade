
import jwt from "jsonwebtoken";
import env from "./env.js";

export interface TokenPayload {
  userId: string;
}

export const generateToken = (payload: TokenPayload) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
};


