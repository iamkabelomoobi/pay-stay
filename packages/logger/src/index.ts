import winston, { Logger, createLogger } from "winston";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";

const createConsoleTransport = () =>
  new winston.transports.Console({
    level: "info",
    format: winston.format.combine(
      winston.format.json(),
      winston.format.prettyPrint(),
    ),
  });

const createAppLogger = (accessToken: string | undefined): Logger => {
  const environment = process.env.NODE_ENV ?? "development";
  const normalizedToken = accessToken?.trim();

  if (environment === "production" && normalizedToken) {
    try {
      return createLogger({
        transports: [new LogtailTransport(new Logtail(normalizedToken))],
      });
    } catch (error) {
      console.warn(
        "Logtail initialization failed. Falling back to console logging.",
        error,
      );
    }
  }

  if (environment === "production" && !normalizedToken) {
    console.warn(
      "LOGTAIL_ACCESS_TOKEN is missing. Falling back to console logging.",
    );
  }

  return createLogger({ transports: [createConsoleTransport()] });
};

export const logger = createAppLogger(process.env.LOGTAIL_ACCESS_TOKEN);
