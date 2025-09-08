import { Request, Response } from "express";
import { createLogger } from "../lib/logger";

const logger = createLogger({ token: process.env.EVAL_API_TOKEN });

export async function doSomething(req: Request, res: Response) {
  try {
    // normal flow
    logger.log({
      stack: "backend",
      level: "debug",
      package: "controller",
      message: "starting doSomething()",
    });

    // ... business logic ...
    res.json({ ok: true });
  } catch (err) {
    logger.log({
      stack: "backend",
      level: "error",
      package: "controller",
      message: `doSomething failed: ${(err as Error).message}`,
    });
    res.status(500).json({ error: "server error" });
  }
}
