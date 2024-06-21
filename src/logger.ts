import pino from "pino";
import type { AnyObject } from "./types";

const pinoLogger = pino({
  level: "debug",
  formatters: {
    level: (label) => ({ level: label }),
    bindings: () => ({}),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  messageKey: "message",
  errorKey: "error",
});

const getLogPayload = (...meta: AnyObject[]) => {
  if (!meta) {
    return undefined;
  }

  const [logMeta] = meta;

  if (logMeta?.length === 1) {
    return {
      meta: logMeta[0],
    };
  }

  return { meta: logMeta };
};

export const logger = {
  trace: (message: string, ...meta: AnyObject[]) => {
    const logPayload = getLogPayload(...meta);

    pinoLogger.trace(logPayload, message);
  },
  debug: (message: string, ...meta: AnyObject[]) => {
    const logPayload = getLogPayload(meta);

    pinoLogger.debug(logPayload, message);
  },
  info: (message: string, ...meta: AnyObject[]) => {
    const logPayload = getLogPayload(meta);

    pinoLogger.info(logPayload, message);
  },
  warn: (message: string, ...meta: AnyObject[]) => {
    const logPayload = getLogPayload(meta);

    pinoLogger.warn(logPayload, message);
  },
  error: (message: string, ...meta: AnyObject[]) => {
    const logPayload = getLogPayload(meta);

    pinoLogger.error(logPayload, message);
  },
};
