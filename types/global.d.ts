declare global {
  interface Window {
    playTracklist?: (tracks: any[], startIndex: number) => void;
    __preloadRelatedMixtapes?: (mixtapeId: string) => void;
    __preloadRelatedProducts?: (swellProductId: string) => void;
    toggleMixcloudPlayer?: () => Promise<boolean>;
    Mixcloud?: {
      PlayerWidget: (iframe: HTMLIFrameElement) => {
        ready: Promise<void>;
        play: () => Promise<void>;
        pause: () => Promise<void>;
        togglePlay: () => Promise<void>;
        getPosition?: () => Promise<number>;
        events: {
          play: { on: (callback: () => void) => void };
          pause: { on: (callback: () => void) => void };
          ended: { on: (callback: () => void) => void };
        };
      };
    };
  }
}

export {};
