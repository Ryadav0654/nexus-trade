import type { ZodError } from "@repo/shared-types";
import type { Response } from "express";

export const sendValidationError = (res: Response, error: ZodError) => {
  return res.status(400).json({
    success: false,
    message: "Validation error",
    errors: error.issues.map((issue) => ({
      name: issue.path.join("."),
      reason: issue.message,
    })),
  });
};
