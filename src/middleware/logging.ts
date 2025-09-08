// src/middleware/logging.ts
import { Request, Response, NextFunction } from "express";
import { createLogger } from "../lib/logger";

const logger = createLogger({
  token: process.env.EVAL_API_TOKEN,
  baseURL: process.env.LOG_API_URL, // optional override
});

// simple request logger (info)
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  logger.log({
    stack: "backend",
    level: "info",
    package: "middleware",
    message: `${req.method} ${req.originalUrl}`,
  });
  next();
}

// error handler to report errors to evaluation server
export function errorReporter(err: any, req: Request, res: Response, next: NextFunction) {
  logger.log({
    stack: "backend",
    level: "error",
    package: "handler",
    message: `Error: ${err?.message || String(err)} path=${req.originalUrl}`,
  });
  next(err);
}
