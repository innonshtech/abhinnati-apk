type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

class Logger {
  private formatLog(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const logObj: any = {
      timestamp,
      level,
      message,
    };

    if (meta !== undefined) {
      if (meta instanceof Error) {
        logObj.error = {
          name: meta.name,
          message: meta.message,
          stack: meta.stack,
        };
      } else {
        logObj.metadata = meta;
      }
    }

    return JSON.stringify(logObj);
  }

  info(message: string, meta?: any) {
    console.log(this.formatLog('INFO', message, meta));
  }

  warn(message: string, meta?: any) {
    console.warn(this.formatLog('WARN', message, meta));
  }

  error(message: string, error?: Error | any, meta?: any) {
    let combinedMeta = meta;
    if (error !== undefined) {
      if (error instanceof Error) {
        combinedMeta = {
          ...(meta || {}),
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        };
      } else {
        combinedMeta = {
          ...(meta || {}),
          error,
        };
      }
    }
    console.error(this.formatLog('ERROR', message, combinedMeta));
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.formatLog('DEBUG', message, meta));
    }
  }
}

export const logger = new Logger();
