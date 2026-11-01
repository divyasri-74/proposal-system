export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

async function request(path, { method = "GET", body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      signal,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("Cannot reach the server. It may be waking up (free hosting) — try again in ~30 seconds.");
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data.details?.length) {
        message = data.details.map((d) => `${d.field || "form"}: ${d.message}`).join("\n");
      } else if (data.error) message = data.error;
    } catch {}
    throw new Error(message);
  }
  return res;
}

export const wakeServer = () => request("/health").then(() => true).catch(() => false);
export const fetchSample = () => request("/api/sample").then((r) => r.json());

export async function fetchPreview(payload, signal) {
  const res = await request("/api/preview", { method: "POST", body: payload, signal });
  return res.text();
}

export async function fetchPdf(payload) {
  const res = await request("/api/generate", { method: "POST", body: payload });
  const blob = await res.blob();
  const match = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") || "");
  return { blob, filename: match ? match[1] : "proposal.pdf" };
}
