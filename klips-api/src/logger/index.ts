import pino, { Level } from 'pino';
import pretty from 'pino-pretty';
import path from 'path';
import fs from 'fs';

const logFilePath = process.env.LOG_FILE_PATH || './logs/worker.log';

// create directory of log file if it does not exist
if (!fs.existsSync(logFilePath)) {
  const dir = path.dirname(logFilePath);
  fs.mkdirSync(dir, { recursive: true });
}

const streamLogLevel: Level = (process.env.PINO_STREAM_LOG_LEVEL || 'debug') as Level ;

const parentLogger = pino(
  {
    level: 'debug'
  },
  pino.multistream(
    [
      {
        stream: pretty({
          colorize: true,
          // hide worker type, because it is already shown by docker-compose logs
          // hide pid and hostname, because typically not needed
          ignore: 'type,pid,hostname',
          translateTime: 'HH:MM:ss'
        }),
        level: streamLogLevel
      },
      { stream: pino.destination(logFilePath), level: 'debug' },
    ]
  )
);

export const logger = parentLogger.child({ type: 'klips-api' });

