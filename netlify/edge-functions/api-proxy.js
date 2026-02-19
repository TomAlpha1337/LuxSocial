const NCB_TARGET = "https://app.nocodebackend.com";

function transformCookie(cookie) {
  const parts = cookie.split(";");
  let nameValue = parts[0].trim();

  // Strip __Secure- or __Host- prefix
  if (nameValue.startsWith("__Secure-")) {
    nameValue = nameValue.replace("__Secure-", "");
  } else if (nameValue.startsWith("__Host-")) {
    nameValue = nameValue.replace("__Host-", "");
  }

  // Filter out attributes that break cross-domain
  const attrs = parts
    .slice(1)
    .map((a) => a.trim())
    .filter((a) => {
      const l = a.toLowerCase();
      return !l.startsWith("domain=");
    });

  // Ensure Secure and SameSite=None for cross-site cookie forwarding on HTTPS
  const hasSecure = attrs.some((a) => a.toLowerCase() === "secure");
  if (!hasSecure) attrs.push("Secure");

  // Replace any existing SameSite with None (needed for proxy)
  const filtered = attrs.filter((a) => !a.toLowerCase().startsWith("samesite="));
  filtered.push("SameSite=Lax");

  return [nameValue, ...filtered].join("; ");
}

export default async function handler(request) {
  const url = new URL(request.url);
  const targetUrl = NCB_TARGET + url.pathname + url.search;

  // Forward the request to NCB
  const headers = new Headers(request.headers);
  headers.set("Host", "app.nocodebackend.com");
  headers.delete("connection");

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
    redirect: "manual",
  });

  // Build response with transformed cookies
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("connection");

  const setCookies = response.headers.getSetCookie?.() || [];
  if (setCookies.length > 0) {
    responseHeaders.delete("set-cookie");
    for (const cookie of setCookies) {
      responseHeaders.append("set-cookie", transformCookie(cookie));
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const config = {
  path: "/api/*",
};
