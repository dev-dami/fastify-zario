import { describe, expect, test } from "bun:test";
import Fastify from "fastify";
import Fastify4 from "fastify4";
import { zario } from "zario";
import { createFastifyLogger } from "../src/index.js";

function fixture() {
  const logs: Record<string, unknown>[] = [];
  const root = zario({
    json: true,
    timestamp: false,
    transports: [
      {
        write(data, formatter) {
          logs.push(JSON.parse(formatter.format(data)));
        },
      },
    ],
  });
  return { logs, root, logger: createFastifyLogger(root) };
}

describe("Fastify adapter on Bun", () => {
  test("Fastify 5 inject logs structured requests with child IDs", async () => {
    const { logger, root, logs } = fixture();
    const app = Fastify({ loggerInstance: logger });
    app.get("/", (request) => {
      request.log.info({ answer: 42 }, "handled");
      return "ok";
    });
    const response = await app.inject("/");
    expect(response.statusCode).toBe(200);
    expect(logs.find((entry) => entry.message === "handled")).toMatchObject({
      answer: 42,
      reqId: expect.any(String),
    });
    expect(logs.find((entry) => entry.req)).toMatchObject({
      req: { method: "GET", url: "/" },
    });
    await app.close();
    await root.close();
  });

  test("Fastify 4 accepts the legacy logger option", async () => {
    const { logger, root, logs } = fixture();
    const app = Fastify4({ logger });
    app.get("/", () => "ok");
    expect((await app.inject("/")).statusCode).toBe(200);
    expect(logs.length).toBeGreaterThan(0);
    await app.close();
    await root.close();
  });

  test("errors, interpolation, levels and custom child serializers survive", async () => {
    const { logger, logs } = fixture();
    logger.error(new Error("failure"));
    logger.info({ id: 1 }, "saved %s", "record");
    const child = logger.child(
      { scope: "child" },
      { serializers: { value: () => "serialized" } },
    );
    child.info({ value: 1 }, "custom");
    expect(logs[0]).toMatchObject({ err: { message: "failure" } });
    expect(logs[1]).toMatchObject({ id: 1, message: "saved record" });
    expect(logs[2]).toMatchObject({ value: "serialized", scope: "child" });
    logger.level = "silent";
    logger.info("ignored");
    expect(logs).toHaveLength(3);
    await logger.close();
  });
});
