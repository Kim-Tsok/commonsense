import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { loadEnvFiles } from "donta/load-env";

// Apply local network preferences before Next creates its server worker.
const command = process.argv[2];
loadEnvFiles(process.cwd(), command === "dev" ? "development" : "production");
const env = { ...process.env };
if (env.DATABASE_IPV4_ONLY === "true") {
  env.NODE_OPTIONS = [
    env.NODE_OPTIONS,
    "--no-network-family-autoselection",
    "--dns-result-order=ipv4first",
  ]
    .filter(Boolean)
    .join(" ");
}
const require = createRequire(import.meta.url);
const child = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), ...process.argv.slice(2)],
  { stdio: "inherit", env },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("error", () => {
  console.error("Could not start Next.js.");
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
