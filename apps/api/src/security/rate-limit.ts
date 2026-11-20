import type { FastifyInstance } from "fastify";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function registerInMemoryRateLimit(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    // Load tests may disable the global bucket only on an explicitly local, non-production server.
    if (isLocalLoadTest(request)) return;

    const key = `${request.ip}:${request.method}:${request.routeOptions.url ?? request.url}`;
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + 60_000 });
      return;
    }

    current.count += 1;
    if (current.count > 120) {
      reply.status(429).send({
        error: {
          code: "rate_limited",
          message: "درخواست‌های شما بیش از حد مجاز است.",
          request_id: request.id
        }
      });
    }
  });
}

function isLocalLoadTest(request: { hostname: string }): boolean {
  if (process.env.LOAD_TEST_MODE !== "true" || process.env.NODE_ENV === "production") return false;
  const hostname = (request.hostname.split(":")[0] ?? "").toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.endsWith(".test");
}
