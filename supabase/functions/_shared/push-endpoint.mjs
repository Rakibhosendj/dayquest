const EXACT_PUSH_HOSTS = new Set([
  "fcm.googleapis.com",
  "web.push.apple.com",
  "updates.push.services.mozilla.com",
  "push.services.mozilla.com",
]);

/**
 * Accept only HTTPS Web Push endpoints hosted by known browser push services.
 * This function is shared by the subscription writer and the notification sender.
 */
export function isTrustedWebPushEndpoint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || raw.length > 2048) return false;

  let endpoint;
  try {
    endpoint = new URL(raw);
  } catch {
    return false;
  }

  if (
    endpoint.protocol !== "https:" ||
    endpoint.username ||
    endpoint.password ||
    endpoint.port ||
    endpoint.hash ||
    endpoint.pathname.length < 2
  ) return false;

  return EXACT_PUSH_HOSTS.has(endpoint.hostname.toLowerCase());
}
