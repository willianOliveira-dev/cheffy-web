declare module '@next/env' {
  export function loadEnvConfig(
    dir: string,
    dev?: boolean,
    log?: unknown
  ): {
    combinedEnv: Record<string, string>;
    loadedEnvFiles: Array<{ path: string; contents: string }>;
  };
}
