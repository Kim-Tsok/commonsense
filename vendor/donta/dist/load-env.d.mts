//#region src/load-env.d.ts
/**
 * Loads .env files the way Next.js and Vite do, for tools that run outside
 * them (drizzle-kit, scripts). Earlier files win, and variables already set
 * in the environment are never overridden.
 */
export declare function loadEnvFiles(cwd?: string, mode?: string): string[];
//#endregion