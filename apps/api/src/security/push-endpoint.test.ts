import assert from "node:assert/strict";
import test from "node:test";
import { normalizePushEndpoint } from "./push-endpoint.js";
test("push destinations reject internal addresses and deceptive URLs", () => {
  for (const url of ["http://127.0.0.1/test", "https://127.0.0.1/test", "https://[::1]/", "https://169.254.169.254/", "https://fcm.googleapis.com.evil.test/x", "https://fcm.googleapis.com@evil.test/x", "https://fcm.googleapis.com:444/x", "https://example.com/x"]) assert.equal(normalizePushEndpoint(url), "", url);
});
test("push destinations accept browser provider origins", () => {
  for (const host of ["fcm.googleapis.com", "updates.push.services.mozilla.com", "web.push.apple.com", "wns.notify.windows.com"]) assert.equal(normalizePushEndpoint(`https://${host}/push/test`), `https://${host}/push/test`);
});
