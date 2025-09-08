// src/lib/logger.ts
import axios, { AxiosInstance } from "axios";

export type Stack = "backend" | "frontend";
export type Level = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogPayload {
  stack: Stack;
  level: Level;
  package: string;
  message: string;
}

export interface LoggerOptions {
  baseURL?: string;           // default from env or assignment URL
  token?: string;             // auth token (Bearer)
  timeoutMs?: number;         // request timeout
  allowedPackages?: string[]; // optional whitelist (lowercase)
}

/**
 * createLogger returns an object with .log(payload).
 * .log is fire-and-forget (it will catch network errors and not throw).
 */
export function createLogger(opts: LoggerOptions = {}) {
  const baseURL =
    opts.baseURL ||
    process.env.LOG_API_URL ||
    "http://20.244.56.144/evaluation-service/logs";
  const token = opts.token || process.env.EVAL_API_TOKEN || (process.env.REACT_APP_LOG_TOKEN as string) || "";
  const timeoutMs = opts.timeoutMs ?? 3000;

  const http: AxiosInstance = axios.create({
    baseURL,
    timeout: timeoutMs,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const allowedStacks = ["backend", "frontend"];
  const allowedLevels = ["debug", "info", "warn", "error", "fatal"];

  async function send(payload: LogPayload): Promise<void> {
    try {
      // runtime normalization: ensure lowercase
      const stack = (payload.stack || "").toString().toLowerCase();
      const level = (payload.level || "").toString().toLowerCase();
      const pkg = (payload.package || "").toString().toLowerCase();
      const message = (payload.message || "").toString();

      // validate required
      if (!allowedStacks.includes(stack)) {
        throw new Error(`invalid stack: ${stack}`);
      }
      if (!allowedLevels.includes(level)) {
        throw new Error(`invalid level: ${level}`);
      }
      if (!pkg || typeof pkg !== "string") {
        throw new Error(`invalid package`);
      }
      if (!message) {
        throw new Error("empty message");
      }

      // optional package whitelist
      if (opts.allowedPackages && !opts.allowedPackages.includes(pkg)) {
        throw new Error(`package "${pkg}" not allowed by configuration`);
      }

      const body = { stack, level, package: pkg, message };

      // Fire-and-forget: we call post but don't let caller crash if it fails.
      http.post("", body).catch((err) => {
        // do not throw — just log for local debugging
        // (In production you could buffer to local file or retry)
        // eslint-disable-next-line no-console
        console.warn("log send failed:", err?.message || err);
      });
    } catch (err) {
      // invalid payload — do not throw to avoid breaking application flow
      // eslint-disable-next-line no-console
      console.warn("log not sent (validation):", err?.message || err);
    }
  }

  return { log: send };
}
