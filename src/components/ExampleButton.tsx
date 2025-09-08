// src/components/ExampleButton.tsx
import React from "react";
import { createLogger } from "../lib/logger";

const logger = createLogger({
  token: process.env.REACT_APP_LOG_TOKEN,
  baseURL: "http://20.244.56.144/evaluation-service/logs",
});

export default function ExampleButton() {
  const onClick = () => {
    logger.log({
      stack: "frontend",
      level: "info",
      package: "api",
      message: "User clicked Start",
    });
  };

  return <button onClick={onClick}>Start</button>;
}
