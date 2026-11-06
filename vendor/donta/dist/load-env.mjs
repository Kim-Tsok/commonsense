import { existsSync } from "node:fs";
import { join } from "node:path";
//#region src/load-env.ts
/**
* Loads .env files the way Next.js and Vite do, for tools that run outside
* them (drizzle-kit, scripts). Earlier files win, and variables already set
* in the environment are never overridden.
*/
function loadEnvFiles(cwd = process.cwd(), mode = process.env.NODE_ENV || "development") {
	const files = [
		`.env.${mode}.local`,
		".env.local",
		`.env.${mode}`,
		".env"
	];
	if (mode === "test") files.splice(1, 1);
	const loaded = [];
	for (const file of files) {
		const path = join(cwd, file);
		if (!existsSync(path)) continue;
		process.loadEnvFile(path);
		loaded.push(file);
	}
	return loaded;
}
//#endregion
export { loadEnvFiles };
