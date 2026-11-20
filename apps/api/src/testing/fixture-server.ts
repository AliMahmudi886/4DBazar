import type { AppConfig } from "../config.js";
import { buildServer } from "../server.js";

export function buildFixtureServer(config: AppConfig) {
  return buildServer(config, { testHeaderAuth: true });
}
