import type { Request, Response, NextFunction, RequestHandler } from "express";
/**
 * Wraps an asynchronous Express route handler or middleware to catch unhandled errors.
 * Automatically forwards any rejected Promises or thrown errors to Express's global error handler via the `next` function.
 *
 * @param {Function} fn - The asynchronous Express route handler or middleware function to wrap.
 * @returns {RequestHandler} A standard Express request handler that safely resolves promises.
 *
 * @example
 * // Usage in an Express route:
 * router.get('/users', asyncHandler(async (req, res, next) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */

export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
};
