# fastify-zario

Fastify custom logger adapter wrapper for Zario.

## Installation

Install `fastify-zario` along with its peer dependencies `zario` and `fastify` in your application:

```bash
# Using npm
npm install fastify-zario zario fastify

# Using bun
bun add fastify-zario zario fastify

# Using pnpm
pnpm add fastify-zario zario fastify
```

### Local Development / Linking

To link a local clone of `fastify-zario` to your application during development, reference its absolute path:

```bash
bun add file:/path/to/fastify-zario
```

## Usage

### Basic Usage (Zero Configuration)

You can register the logger wrapper directly without importing the core `zario` package. It will automatically initialize a default Zario Logger instance.

```typescript
import Fastify from 'fastify';
import { createFastifyLogger } from 'fastify-zario';

const fastify = Fastify({
  // Automatically instantiates default Zario logger internally
  logger: createFastifyLogger(),
});

fastify.get('/', async (request, reply) => {
  request.log.info('Handling home request');
  return { hello: 'world' };
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err.message);
    process.exit(1);
  }
});
```

### Custom Logger Usage

If you need to configure custom settings (such as JSON formatting or log levels), initialize a Zario `Logger` instance and pass it to `createFastifyLogger()`.

```typescript
import Fastify from 'fastify';
import { createFastifyLogger } from 'fastify-zario';
import { Logger } from 'zario';

// 1. Initialize custom Zario Logger
const customLogger = new Logger({
  level: 'info',
  json: true,
  timestamp: true
});

// 2. Wrap it and pass it to Fastify configuration
const fastify = Fastify({
  logger: createFastifyLogger(customLogger),
});

fastify.get('/', async (request, reply) => {
  request.log.info('Handling home request');
  return { hello: 'world' };
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err.message);
    process.exit(1);
  }
});
```

## Configuration

The `createFastifyLogger` function accepts an optional `Logger` instance:

```typescript
function createFastifyLogger(zarioInstance?: Logger): FastifyLoggerAdapter
```

If no `Logger` instance is provided, it will automatically instantiate a new `Logger`.

## API Mapping

The Fastify adapter translates Fastify logger methods into Zario log levels:

| Fastify Logger Method | Zario Log Level |
| :--- | :--- |
| `info` | `info` |
| `warn` | `warn` |
| `error` | `error` |
| `debug` | `debug` |
| `fatal` | `fatal` |
| `trace` | `boring` |
| `child` | Creates a child logger via Zario `createChild` |

## License

MIT
