import { env } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();

app.listen(env.port, env.host, () => {
  console.log(`Life OS backend listening on http://${env.host}:${env.port}`);
});
