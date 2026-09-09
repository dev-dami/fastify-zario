import { format } from "node:util";
import type { FastifyBaseLogger } from "fastify";
import { type Logger, type LoggerOptions, zario } from "zario";

/** Convert framework objects to bounded request/response metadata. */
export type Serializer = (value: unknown) => unknown;
export interface FastifyLoggerOptions {
  level?: string;
  serializers?: Record<string, Serializer>;
}
export interface FastifyLoggerAdapter extends FastifyBaseLogger {
  child(
    bindings: Record<string, unknown>,
    options?: FastifyLoggerOptions,
  ): FastifyLoggerAdapter;
  flush(): Promise<void>;
  close(): Promise<void>;
}

function requestFields(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const req = value as Record<string, unknown>;
  return {
    method: req.method,
    url: typeof req.url === "string" ? req.url.split("?")[0] : req.url,
    hostname: req.hostname,
    remoteAddress: req.ip,
  };
}
function responseFields(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  return { statusCode: (value as Record<string, unknown>).statusCode };
}

/** Adapt Zario to Fastify 4/5, including object-first calls and request children. */
export function createFastifyLogger(
  instance: Logger = zario(),
  options: FastifyLoggerOptions = {},
): FastifyLoggerAdapter {
  const serializers = {
    req: requestFields,
    res: responseFields,
    ...options.serializers,
  };
  if (options.level)
    instance.setLevel(options.level === "trace" ? "boring" : options.level);

  const method =
    (level: string) =>
    (input: unknown, ...args: unknown[]): void => {
      if (!instance.isLevelEnabled(level)) return;
      if (typeof input === "string") {
        instance.logWithLevel(
          level,
          args.length ? format(input, ...args) : input,
        );
        return;
      }
      const fields: Record<string, unknown> =
        input instanceof Error
          ? { err: input }
          : input && typeof input === "object"
            ? { ...input }
            : { value: input };
      for (const [key, serialize] of Object.entries(serializers)) {
        if (Object.hasOwn(fields, key)) fields[key] = serialize(fields[key]);
      }
      const message =
        typeof args[0] === "string"
          ? format(args[0], ...args.slice(1))
          : input instanceof Error
            ? input.message
            : "";
      instance.logWithLevel(level, message, fields);
    };

  return {
    get level() {
      return (
        instance.getLevel() === "boring" ? "trace" : instance.getLevel()
      ) as FastifyBaseLogger["level"];
    },
    set level(value) {
      instance.setLevel(value === "trace" ? "boring" : value);
    },
    info: method("info"),
    warn: method("warn"),
    error: method("error"),
    debug: method("debug"),
    fatal: method("fatal"),
    trace: method("boring"),
    silent() {},
    child(bindings, childOptions = {}) {
      const loggerOptions: LoggerOptions = {};
      if (childOptions.level)
        loggerOptions.level =
          childOptions.level === "trace" ? "boring" : childOptions.level;
      return createFastifyLogger(instance.child(bindings, loggerOptions), {
        serializers: { ...serializers, ...childOptions.serializers },
      });
    },
    flush: () => instance.flush(),
    close: () => instance.close(),
  };
}
