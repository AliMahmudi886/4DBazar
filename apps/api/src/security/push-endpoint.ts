export function normalizePushEndpoint(value?: string) {
  if (typeof value !== "string" || value.length > 2048) return "";
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash) return "";
    const host = url.hostname.toLowerCase();
    const allowed = host === "fcm.googleapis.com" || host === "updates.push.services.mozilla.com"
      || host === "web.push.apple.com" || host.endsWith(".notify.windows.com");
    return allowed ? url.toString() : "";
  } catch { return ""; }
}
