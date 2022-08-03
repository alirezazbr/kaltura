interface FakeEvent {}

type CoreEventListener = (event: FakeEvent) => boolean | void;

type PlayerStateChangeEvent = {
  payload: {
    newState: {
      type: string;
    };
    oldState: {
      type: string;
    };
  };
};

type KalturaPlayerManager = {
  setup: (KalturaPlayerConfig) => Player;
};

interface KalturaPlayerConfig {
  targetId: string;
  playback: PlaybackConfig;
  provider: ProviderOptionsObject;
}

interface PlaybackConfig {
  autoplay: boolean;
}

interface ProviderOptionsObject {
  partnerId: string;
  ks: string;
  uiConfId: string;
}

interface MediaInfoObject {
  entryId: string;
  ks?: string;
}

interface Player {
  addEventListener(type: string, listener: CoreEventListener): void;
  removeEventListener: (type: string, listener: CoreEventListener) => void;
  currentTime: number;
  Event: Record<string, string>;
  loadMedia(mediaInfo: MediaInfoObject): Promise<any>;
  pause(): void;
  play(): void;
  destroy(): void;
}
