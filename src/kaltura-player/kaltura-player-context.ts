import * as React from "react";
import { Observable, throwError } from "rxjs";

export enum PlayerBundleStatuses {
  Loaded = "Loaded",
  Loading = "Loading",
  Error = "Error",
  Initial = "Initial"
}

export enum MediaStatuses {
  Loaded = "Loaded",
  Loading = "Loading",
  Error = "Error",
  Initial = "Initial",
  Destroyed = "Destroyed"
}

export enum PlayerStatuses {
  Loaded = "Loaded",
  Error = "Error",
  Initial = "Initial",
  Destroyed = "Destroyed"
}

export enum PlayerActionTypes {
  Play = "Play",
  Pause = "Pause",
  Seek = "Seek"
}

/*
Those statuses were taken from the player event documentation
 */
export enum PlaybackStatuses {
  Paused = "paused",
  Playing = "playing",
  Loading = "loading",
  Idle = "idle",
  Buffering = "buffering",
  Error = "error"
}

export enum PlayerEventsTypes {
  FirstPlaying = "FirstPlaying",
  VideoResized = "VideoResized",
  PlayerResized = "PlayerResized"
}

export type PlayerEvents =
  | {
      type: PlayerEventsTypes.FirstPlaying;
    }
  | {
      type: PlayerEventsTypes.PlayerResized;
      width: number;
      height: number;
    }
  | {
      type: PlayerEventsTypes.VideoResized;
      x: number;
      y: number;
      width: number;
      height: number;
    };

export interface PlayerAction {
  actionType: PlayerActionTypes;
  options?: SeekOptions;
}

export interface SeekOptions {
  seekTo: number;
  pause: boolean;
}

export interface PlayerBundleConfig {
  ks?: string;
  bundlerUrl?: string;
  partnerId?: string;
  uiConfId?: string;
}

export interface PlayerContextValue {
  playerBundleStatus: PlayerBundleStatuses;
  playerBundleConfig: PlayerBundleConfig;
  getPlayerCurrentTime$: (playerId: string) => Observable<number>;
  getPlayerState$: (playerId: string) => Observable<PlaybackStatuses>;
  getPlayerEvents$: (playerId: string) => Observable<PlayerEvents>;
  getPlayerInstance: (playerId: string) => null | Record<string, any>;
  seek: (playerId: string, options: SeekOptions) => void;
  play: (playerId: string) => void;
  pause: (playerId: string) => void;
  registerPlayer: (
    playerId: string,
    currentTime$: Observable<number>,
    playerState$: Observable<PlaybackStatuses>,
    playerEvents$: Observable<PlayerEvents>
  ) => { action$: Observable<PlayerAction>; onRemove: () => void };
}

export const defaultPlayerContext: PlayerContextValue = {
  playerBundleStatus: PlayerBundleStatuses.Error,
  playerBundleConfig: {},
  getPlayerState$: () =>
    throwError(
      new Error(`can't use context, KalturaPlayerProvider is missing`)
    ),
  getPlayerEvents$: () =>
    throwError(
      new Error(`can't use context, KalturaPlayerProvider is missing`)
    ),
  getPlayerCurrentTime$: () =>
    throwError(
      new Error(`can't use context, KalturaPlayerProvider is missing`)
    ),
  seek: () => {
    console.warn(`can't seek, KalturaPlayerProvider is missing`);
  },
  play: () => {
    console.warn(`can't play, KalturaPlayerProvider is missing`);
  },
  getPlayerInstance: () => {
    console.warn(
      `can't get player instance , KalturaPlayerProvider is missing`
    );
    return null;
  },
  pause: () => {
    console.warn(`can't pause, KalturaPlayerProvider is missing`);
  },
  registerPlayer: () => ({
    action$: throwError(
      new Error(`can't use context, KalturaPlayerProvider is missing`)
    ),
    onRemove: () => {}
  })
};

export const KalturaPlayerContext = React.createContext<PlayerContextValue>(
  defaultPlayerContext
);
