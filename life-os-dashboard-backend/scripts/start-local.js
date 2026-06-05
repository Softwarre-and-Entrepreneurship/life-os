import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawn } from "node:child_process";
import { createServer } from "node:net";

const backendDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const frontendDir = process.env.FRONTEND_DIR
  ? resolve(process.env.FRONTEND_DIR)
  : resolve(backendDir, "..", "frontend");
const backendHost = process.env.HOST || "127.0.0.1";
const frontendHost = process.env.FRONTEND_HOST || "127.0.0.1";
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const smokeMode = process.argv.includes("--smoke");
const frontendPackageExists = existsSync(resolve(frontendDir, "package.json"));
const children = [];
let shuttingDown = false;

function parsePort(value, name) {
  const port = Number.parseInt(value, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`[${name}] invalid port: ${value}`);
  }
  return port;
}

const backendPort = parsePort(process.env.PORT || "4000", "backend");
const frontendPort = parsePort(process.env.FRONTEND_PORT || "5173", "frontend");

const childEnv = {
  ...process.env,
  CORS_ORIGIN:
    process.env.CORS_ORIGIN ||
    `http://localhost:${frontendPort},http://${frontendHost}:${frontendPort}`,
};

function getNpmInvocation(args) {
  if (process.platform !== "win32") {
    return { command: npmCommand, args };
  }
  return {
    command: "cmd.exe",
    args: ["/d", "/s", "/c", npmCommand, ...args],
  };
}

function assertPortAvailable(name, host, port) {
  return new Promise((resolveCheck, rejectCheck) => {
    const server = createServer();
    server.once("error", (error) => {
      rejectCheck(new Error(`[${name}] port ${host}:${port} is not available: ${error.code || error.message}`));
    });
    server.listen(port, host, () => {
      server.close(resolveCheck);
    });
  });
}

function startProcess(name, cwd, args) {
  console.log(`[${name}] starting in ${cwd}`);
  const invocation = getNpmInvocation(args);
  let child;

  try {
    child = spawn(invocation.command, invocation.args, {
      cwd,
      env: childEnv,
      stdio: "inherit",
    });
  } catch (error) {
    console.error(`[${name}] failed to start: ${error.message}`);
    shutdown(1);
    return null;
  }

  children.push({ name, child });
  child.on("error", (error) => {
    if (!shuttingDown) {
      console.error(`[${name}] failed to start: ${error.message}`);
      shutdown(1);
    }
  });
  child.on("exit", (code) => {
    if (!shuttingDown) {
      console.log(`[${name}] exited with code ${code}`);
      shutdown(code || 0);
    }
  });

  return child;
}

function stopChild(child) {
  if (!child?.pid) return;
  if (child.exitCode !== null) return;
  if (process.platform === "win32") {
    try {
      execFileSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
    } catch {
      // The process may have already exited between the status check and taskkill.
    }
    return;
  }
  child.kill("SIGTERM");
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  children.forEach(({ child }) => stopChild(child));
  process.exit(code);
}

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function waitForUrl(name, url, validate = async (response) => response.ok) {
  const deadline = Date.now() + 15_000;
  let lastError = "not attempted";

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (await validate(response)) {
        console.log(`[${name}] ready at ${url}`);
        return;
      }
      lastError = `${response.status} ${response.statusText}`;
    } catch (error) {
      lastError = error.message;
    }
    await wait(500);
  }

  throw new Error(`[${name}] did not become ready at ${url}: ${lastError}`);
}

async function runSmokeChecks(frontendStarted) {
  await waitForUrl("backend", `http://${backendHost}:${backendPort}/api/health`, async (response) => {
    const payload = await response.json().catch(() => ({}));
    return response.ok && payload?.data?.status === "ok";
  });

  if (frontendStarted) {
    await waitForUrl("frontend", `http://${frontendHost}:${frontendPort}/`);
  }
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

try {
  await assertPortAvailable("backend", backendHost, backendPort);
  if (frontendPackageExists) {
    await assertPortAvailable("frontend", frontendHost, frontendPort);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const backendStarted = Boolean(startProcess("backend", backendDir, ["run", "dev"]));
if (!backendStarted) {
  shutdown(1);
}

let frontendStarted = false;
if (frontendPackageExists) {
  frontendStarted = Boolean(
    startProcess("frontend", frontendDir, [
      "run",
      "dev",
      "--",
      "--host",
      frontendHost,
      "--port",
      frontendPort,
      "--strictPort",
    ]),
  );
  console.log(`frontend: http://${frontendHost}:${frontendPort}/`);
} else {
  console.warn(`[frontend] package.json not found at ${frontendDir}; backend only mode`);
}

console.log(`backend:  http://${backendHost}:${backendPort}/`);
console.log(`health:   http://${backendHost}:${backendPort}/api/health`);

if (smokeMode) {
  try {
    await runSmokeChecks(frontendStarted);
    console.log("local runner smoke ok");
    shutdown(0);
  } catch (error) {
    console.error(error.message);
    shutdown(1);
  }
}
