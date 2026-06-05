const baseUrl = (process.env.API_BASE_URL || `http://${process.env.HOST || "127.0.0.1"}:${process.env.PORT || "4000"}`).replace(/\/$/, "");

let response;
try {
  response = await fetch(`${baseUrl}/api/health`);
} catch (error) {
  console.error(`health check failed: cannot reach ${baseUrl}`);
  console.error(error.message);
  process.exit(1);
}

const payload = await response.json().catch(() => ({}));

if (!response.ok || payload?.data?.status !== "ok") {
  console.error(`health check failed: ${response.status} ${response.statusText}`);
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

console.log(`health ok: ${payload.data.service} at ${baseUrl}`);
