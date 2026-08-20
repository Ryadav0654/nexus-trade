/**
 * Global Error Handler
 *
 * Central error middleware — the last middleware in the Express chain.
 * Handles all errors thrown from controllers/services and converts them
 * into standardised API responses.
 *
 * Error processing order (most specific → least specific):
 *   1. ZodError          → 400 VALIDATION_ERROR (with field-level details)
 *   2. AppError          → appropriate status + code from the error instance
 *   3. Prisma P2002      → 409 DUPLICATE_RESOURCE (unique constraint violation)
 *   4. Prisma init error → 503 DATABASE_UNAVAILABLE
 *   5. Unknown           → 500 INTERNAL_SERVER_ERROR (logged as critical)
 *
 * Standard response format:
 *
 *   Success: { success: true,   data: T }
 *   Error:   { success: false, error: { code: string, details?: [] } }
 */

import type { Request, Response, NextFunction } from "express";
import { sendValidationError } from "../utils/validation.js";
import { ZodError } from "@repo/shared-types";
import { Prisma } from "@repo/database";

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // ZodError is thrown synchronously by schema.parse() in controllers.
  if (err instanceof ZodError) {
    return sendValidationError(res, err);
  }

  // Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const fields = (err.meta?.["target"] as string[] | undefined)?.join(", ");
      return res.status(409).json({
        success: false,
        error: fields
          ? `Unique constraint violation on: ${fields}`
          : "Resource already exists",
      });
    }

    // P2025 = record not found (e.g. update/delete on missing row)
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }

    return res.status(400).json({
      success: false,
      error: "Database request failed",
    });
  }

  // 4. Prisma Initialisation Errors
  if (err instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({
      success: false,
      error: "Database connection unavailable. Please try again later.",
    });
  }

  // Unhandled / Programming Errors — log and return generic 500
  console.error("[CRITICAL] Unhandled error:", err);

  return res.status(500).json({
    success: false,
    error: "An unexpected error occurred. Our team has been notified.",
  });
};
