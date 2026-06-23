import { Logger } from 'zario';

export interface FastifyLoggerAdapter {
  info(msg: string, ...args: any[]): void;
  warn(msg: string, ...args: any[]): void;
  error(msg: string, ...args: any[]): void;
  debug(msg: string, ...args: any[]): void;
  fatal(msg: string, ...args: any[]): void;
  trace(msg: string, ...args: any[]): void;
  child(bindings: any): FastifyLoggerAdapter;
}

export function createFastifyLogger(zarioInstance?: Logger): FastifyLoggerAdapter {
  const logger = zarioInstance || new Logger();

  return {
    info: (msg: string, ...args: any[]) => logger.info(msg, args[0]),
    warn: (msg: string, ...args: any[]) => logger.warn(msg, args[0]),
    error: (msg: string, ...args: any[]) => logger.error(msg, args[0]),
    debug: (msg: string, ...args: any[]) => logger.debug(msg, args[0]),
    fatal: (msg: string, ...args: any[]) => logger.fatal(msg, args[0]),
    trace: (msg: string, ...args: any[]) => logger.boring(msg, args[0]),
    child: (bindings: any) => createFastifyLogger(logger.createChild({ context: bindings })),
  };
}
