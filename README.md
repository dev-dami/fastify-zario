# fastify-zario

Use Zario as Fastify's logger, with structured fields, request children, errors,
level control and shutdown methods. Tested with Fastify 4 and 5 on Bun.

```bash
bun add fastify-zario fastify zario
```

```ts
import Fastify from 'fastify';
import { createFastifyLogger } from 'fastify-zario';

const logger = createFastifyLogger();
const app = Fastify({ loggerInstance: logger }); // Fastify 5
app.get('/', (request) => {
  request.log.info({ answer: 42 }, 'handled');
  return { ok: true };
});
app.addHook('onClose', async () => { await logger.close(); });
await app.listen({ port: 3000 });
```

Fastify 4 uses `Fastify({ logger })` instead. This distinction follows the
[Fastify migration guide](https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/).

## Custom configuration

```ts
import { zario } from 'zario';
const logger = createFastifyLogger(zario({ json: true, level: 'debug' }));
logger.info({ userId: 42 }, 'saved %s', 'record');
logger.error(new Error('failed'));
logger.child({ scope: 'worker' }).warn('retrying');
await logger.flush();
```

The adapter implements `info`, `warn`, `error`, `debug`, `fatal`, `trace`,
`silent`, `child`, and the `level` getter/setter. `trace` maps to Zario's `boring`;
`silent` disables output. `flush()` and `close()` delegate to the wrapped logger.
Close a supplied logger only when all its owners are done with it.

Default request/response serializers keep only a small set of fields, rather
than serializing entire Fastify objects. Override them with
`createFastifyLogger(log, { serializers: { req: value => ... } })` or child
options. The adapter's default request serializer excludes query strings, but Fastify can
supply its own serializers when creating children. Those child serializers take
precedence. Custom/framework serializers are responsible for their sensitive fields.

Object-first calls and printf arguments are supported. Message-first structured
metadata should be logged through the underlying Zario instance; Fastify's
message-first extra arguments follow printf semantics.

## Development

Bun is the package manager and test runner. Keep the core checkout at `../../zario`:

```text
workspace/
  zario/
  zario-adapters/
    fastify-zario/
```

Build the core first with `bun install --frozen-lockfile && bun run build` in
`workspace/zario`. Then in this adapter:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun test
bun run build
```

CI checks out and builds the pinned core revision before testing the adapter.
The relative development dependency stays out of the published runtime contract;
applications install the `zario` peer dependency normally. These changes require
Zario 0.9.0; publish the core before releasing this adapter.

## License

MIT
