export const META_PIXEL_ID = "1075021788479723";

export type MetaPixelCommand = "init" | "track" | "trackCustom";

declare global {
  interface Window {
    fbq?: (
      command: MetaPixelCommand,
      event: string,
      params?: Record<string, unknown>,
      options?: { eventID?: string },
    ) => void;
    _fbq?: Window["fbq"];
  }
}

export {};
