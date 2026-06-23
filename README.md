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

When creating your Fastify instance, wrap your Zario Logger instance using `createFastifyLogger` and pass it to Fastify's `logger` configuration.

```typescript
import Fastify from 'fastify';
import { createFastifyLogger } from 'fastify-zario';
import { Logger } from 'zario';

// 1. Initialize Zario Logger
const logger = new Logger({
  level: 'info',
  json: true,
  timestamp: true
});

// 2. Wrap it and pass it to the Fastify configuration
const fastify = Fastify({
  logger: createFastifyLogger(logger),
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
  fastify.log.info('Server listening on port 3000');
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
