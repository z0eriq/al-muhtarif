export const META_PIXEL_ID = "1075021788479723";

declare global {
  interface Window {
    fbq?: ((
      command: "init" | "track" | "trackCustom",
      event: string,
      params?: Record<string, unknown>,
    ) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue: unknown[];
      loaded: boolean;
      version: string;
      push: (...args: unknown[]) => number;
    };
    _fbq?: Window["fbq"];
  }
}

export {};
