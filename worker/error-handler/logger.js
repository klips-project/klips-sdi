import pino from "pino";
import pretty from 'pino-pretty';
import path from 'path';
import fs from 'fs';

const logFilePath = process.env.LOG_FILE_PATH || "./logs/worker.log";

// create directory of log file if it does not exist
if (!fs.existsSync(logFilePath)) {
  const dir = path.dirname(logFilePath);
  fs.mkdirSync(dir, { recursive: true });
}

const logLevel = process.env.LOG_LEVEL || 'debug';

const parentLogger = pino(
  {
    level: logLevel
  },
  pino.multistream(
    [
      { stream: pretty({ colorize: true }), level: logLevel },
      { stream: pino.destination(logFilePath), level: logLevel },
    ]
  )
);

export const logger = parentLogger.child({ type: 'error-handler' })
