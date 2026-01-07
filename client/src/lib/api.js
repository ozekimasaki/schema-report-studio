const REQUEST_TIMEOUT_MS = 20000;

export async function extractStructuredData(urls) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const message =
        data?.error ||
        `リクエストに失敗しました (HTTP ${res.status})`;
      throw new Error(message);
    }

    return await res.json();
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error("タイムアウトしました。時間をおいて再試行してください。");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
