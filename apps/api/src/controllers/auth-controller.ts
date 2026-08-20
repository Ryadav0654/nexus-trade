import type { Request, Response } from "express";
import { Prisma, prisma } from "@repo/database";
import jwt from "jsonwebtoken";
import env from "../utils/env.js";
import { authSchema } from "@repo/shared-types";
import { BALANCES } from "../app.js";
import { generateToken } from "../utils/auth.js";

const register = async (req: Request, res: Response) => {
  const data = authSchema.parse(req.body);
  // if (!success)
  //   return res.status(400).json({
  //     success: false,
  //     message: "Validation error",
  //     errors: error.issues.map((issue) => ({
  //       name: issue.path.join("."),
  //       reason: issue.message,
  //     })),
  //   });

  const { email, password } = data;

  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 8, // number between 4-31
  });

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
    omit: {
      password: true,
    },
  });
  BALANCES[newUser.id] = { INR: 0, STOCK: 0 };
  return res.status(201).json({
    success: true,
    data: newUser,
  });
};

const login = async (req: Request, res: Response) => {
  const data = authSchema.parse(req.body);
  // if (!success)
  //   return res.status(400).json({
  //     success: false,
  //     message: "Validation error",
  //     errors: error.issues.map((issue) => ({
  //       name: issue.path.join("."),
  //       reason: issue.message,
  //     })),
  //   });

  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user)
    return res.status(400).json({
      success: false,
      message: "user does not exist",
    });

  const isPasswordCorrect = await Bun.password.verify(password, user.password);

  if (!isPasswordCorrect)
    return res.status(400).json({
      success: false,
      message: "Credentials are incorrect",
    });

  const token = generateToken({userId: user.id});
  res.cookie("access_token", token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  return res.status(200).json({
    success: true,
    data: { ...user, password: undefined },
  });
};

const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({
      success: true,
      message: "logged out",
    });
  } catch (error) {
    console.error("[Error]: ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};

export { register, login };
