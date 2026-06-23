# fastify-zario

Fastify custom logger adapter wrapper for Zario.

## Installation

```bash
npm install fastify-zario
```

Make sure you also have `zario` and `fastify` installed.

## Usage

When creating your Fastify instance:

```typescript
import Fastify from 'fastify';
import { createFastifyLogger } from 'fastify-zario';
import { Logger } from 'zario';

const logger = new Logger();

const fastify = Fastify({
  logger: createFastifyLogger(logger),
});

fastify.get('/', async (request, reply) => {
  request.log.info('Some request specific logging info');
  return { hello: 'world' };
});

fastify.listen({ port: 3000 });
```
