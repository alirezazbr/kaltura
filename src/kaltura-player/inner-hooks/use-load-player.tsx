import { useContext, useEffect, useRef, useState } from "react";
import {
  KalturaPlayerContext,
  PlayerAction,
  PlayerActionTypes,
  PlayerEvents,
  PlayerEventsTypes,
  PlayerBundleStatuses,
  PlayerStatuses,
  PlaybackStatuses,
  MediaStatuses
} from "../kaltura-player-context";

import { BehaviorSubject, Subscription, Subject } from "rxjs";
import { useCallbackRef } from "./use-callback-ref";

export interface UseLoadPlayerOptions {
  autoplay: boolean;
  entryId: string;
  onPlayerLoaded?: (data: { entryId: string; playerId: string }) => void;
  onMediaLoaded?: (entryId: string) => void;
  onPlayerLoadingError?: (entryId: string) => void;
  onMediaLoadingError?: (entryId: string) => void;
  enableKavaAnalytics?: boolean;
  customizeConfig?: (config: Record<string, any>) => Record<string, any>;
}

export interface PlayerState {
  playerId: string;
  playerStatus: PlayerStatuses;
  mediaStatus: MediaStatuses;
}

/*
Developer notice
In this sample we used a simple way to create unique id. You can keep it
or replace it with an existing library like shortId
*/
let uniqueIdIndex = 0;
function getUniquePlayerId() {
  uniqueIdIndex++;
  return `kaltura-player${uniqueIdIndex}`;
}

const acceptedPlaybackStatusesValues: string[] = Object.keys(
  PlaybackStatuses
).map(key => (PlaybackStatuses as any)[key]);

export const useLoadPlayer = (options: UseLoadPlayerOptions): PlayerState => {
  const {
    entryId,
    autoplay,
    onMediaLoaded,
    enableKavaAnalytics,
    onMediaLoadingError,
    onPlayerLoaded,
    onPlayerLoadingError
  } = options;

  const { playerBundleStatus, playerBundleConfig, registerPlayer } = useContext(
    KalturaPlayerContext
  );

  const unmountedRef = useRef(false);

  const [playerState, setPlayerState] = useState<PlayerState>(() => ({
    playerId: getUniquePlayerId(),
    playerStatus: PlayerStatuses.Initial,
    mediaStatus: MediaStatuses.Initial
  }));

  const playerTimeSubjectRef = useRef(new BehaviorSubject<number>(0));
  const playerStateSubjectRef = useRef(
    new BehaviorSubject<PlaybackStatuses>(PlaybackStatuses.Idle)
  );
  const playerEventsSubjectRef = useRef(new Subject<PlayerEvents>());
  const playerRegistrationRef = useRef({
    seekSubscription: Subscription.EMPTY,
    onRemove: () => {}
  });
  const playerRef = useCallbackRef<any>(null, () => {
    if (!playerRef.current) {
      return;
    }

    const updatePlayerCurrentTime = () => {
      playerTimeSubjectRef.current.next(
        Math.floor(playerRef.current.currentTime * 1000)
      );
    };

    const updatePlayerState = (e: PlayerStateChangeEvent) => {
      const playbackStatus = e.payload.newState.type;
      if (acceptedPlaybackStatusesValues.indexOf(playbackStatus) === -1) {
        console.warn(
          `Kaltura player emitted unknown state ${playbackStatus}. Ignoring the mentioned state`
        );
        return;
      }
      playerStateSubjectRef.current.next(playbackStatus as PlaybackStatuses);
    };

    const emitVideoResized = (e: any) => {
      const { x, y, width, height } = e.payload.videoSize;

      playerEventsSubjectRef.current.next({
        type: PlayerEventsTypes.VideoResized,
        x,
        y,
        width,
        height
      });
    };

    const emitFirstPlaying = () => {
      playerEventsSubjectRef.current.next({
        type: PlayerEventsTypes.FirstPlaying
      });
    };

    const emitPlayerResized = (e: any) => {
      const { width, height } = e.payload.playerSize;

      playerEventsSubjectRef.current.next({
        type: PlayerEventsTypes.PlayerResized,
        width,
        height
      });
    };

    const getPlayerVideoResizeEvent = () =>
      // @ts-ignore
      window["KalturaPlayer"].ui.EventType.VIDEO_RESIZE;

    const getPlayerResizeEvent = () =>
      // @ts-ignore
      window["KalturaPlayer"].ui.EventType.PLAYER_RESIZE;

    playerRef.current.addEventListener("timeupdate", updatePlayerCurrentTime);
    playerRef.current.addEventListener("playerstatechanged", updatePlayerState);
    playerRef.current.addEventListener("firstplaying", emitFirstPlaying);
    playerRef.current.addEventListener(
      getPlayerVideoResizeEvent(),
      emitVideoResized
    );
    playerRef.current.addEventListener(
      getPlayerResizeEvent(),
      emitPlayerResized
    );

    return () => {
      if (!playerRef.current) return;
      playerRef.current.removeEventListener(
        "timeupdate",
        updatePlayerCurrentTime
      );
      playerRef.current.removeEventListener(
        "playerstatechanged",
        updatePlayerState
      );
      playerRef.current.removeEventListener("firstplaying", emitFirstPlaying);
      playerRef.current.removeEventListener(
        getPlayerVideoResizeEvent(),
        emitVideoResized
      );
      playerRef.current.removeEventListener(
        getPlayerResizeEvent(),
        emitPlayerResized
      );
      playerRegistrationRef.current.seekSubscription.unsubscribe();
      playerRegistrationRef.current.onRemove();
      playerTimeSubjectRef.current.complete();
      playerRef.current.destroy();
      setPlayerState(prevState => ({
        ...prevState,
        playerStatus: PlayerStatuses.Destroyed,
        mediaStatus: MediaStatuses.Destroyed
      }));
    };
  });

  const loadPlayerMedia = () => {
    if (playerRef.current === null) {
      return;
    }

    setPlayerState(prevState => ({
      ...prevState,
      mediaStatus: MediaStatuses.Loading
    }));

    playerRef.current
      .loadMedia({ entryId })
      .then(() => {
        if (unmountedRef.current) return;
        if (onMediaLoaded) onMediaLoaded(entryId);
        setPlayerState(prevState => ({
          ...prevState,
          mediaStatus: MediaStatuses.Loaded
        }));
      })
      .catch((err: any) => {
        if (unmountedRef.current) return;
        console.warn(`Kaltura Player: 'loadMedia' error:`, err);
        if (onMediaLoadingError) onMediaLoadingError(entryId);
        setPlayerState(prevState => ({
          ...prevState,
          mediaStatus: MediaStatuses.Error
        }));
      });
  };

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  //listen to media change
  useEffect(() => {
    if (playerState.playerStatus !== PlayerStatuses.Loaded) {
      return;
    }
    if (!playerRef.current) {
      console.warn(`Can't change media. There is no player`);
      return;
    }

    loadPlayerMedia();
  }, [entryId]);

  //listen to player loading status in order to load media
  useEffect(() => {
    if (playerState.playerStatus !== PlayerStatuses.Loaded) {
      return;
    }

    loadPlayerMedia();
  }, [playerState.playerStatus]);

  //listen to player bundle loading status in order to load player
  useEffect(() => {
    if (
      playerState.mediaStatus === MediaStatuses.Destroyed ||
      playerState.playerStatus === PlayerStatuses.Destroyed
    ) {
      return;
    }

    const onSeek = (time: number, pause: boolean) => {
      if (
        !playerRef.current ||
        typeof playerRef.current.currentTime !== "number"
      ) {
        return;
      }
      if (pause) playerRef.current.pause();
      playerRef.current.currentTime = time / 1000;
    };

    const loadPlayer = () => {
      if (playerRef.current) {
        return;
      }

      // @ts-ignore
      const playerManager = window["KalturaPlayer"];
      try {
        let config: Record<string, any> = {
          playback: {
            autoplay
          }
        };

        if (options.customizeConfig) {
          config = options.customizeConfig(config) || config;
        }

        config = {
          ...config,
          targetId: playerState.playerId,
          provider: {
            ...config.provider,
            uiConfId: playerBundleConfig.uiConfId,
            partnerId: playerBundleConfig.partnerId,
            ks: playerBundleConfig.ks
          },
          plugins: {
            ...config.plugins,
            kava: {
              disable: !enableKavaAnalytics
            }
          }
        };

        const player = playerManager.setup(config);

        playerRef.current = player;
        const { action$, onRemove } = registerPlayer(
          playerState.playerId,
          playerTimeSubjectRef.current.asObservable(),
          playerStateSubjectRef.current.asObservable(),
          playerEventsSubjectRef.current.asObservable()
        );
        const playerActionsSubscription = action$.subscribe(
          ({ actionType, options }: PlayerAction) => {
            switch (actionType) {
              case PlayerActionTypes.Seek:
                if (!options) return;
                onSeek(options.seekTo, options.pause);
                break;
              case PlayerActionTypes.Pause:
                if (!playerRef.current) return;
                playerRef.current.pause();
                break;
              case PlayerActionTypes.Play:
                if (!playerRef.current) return;
                playerRef.current.play();
                break;
            }
          }
        );
        playerRegistrationRef.current = {
          seekSubscription: playerActionsSubscription,
          onRemove
        };

        if (onPlayerLoaded)
          onPlayerLoaded({ entryId, playerId: playerState.playerId });

        setPlayerState(prevState => ({
          ...prevState,
          playerStatus: PlayerStatuses.Loaded
        }));
      } catch (e) {
        console.warn(`kaltura Player: setup failure:`, e);
        if (onPlayerLoadingError) onPlayerLoadingError(entryId);
        setPlayerState(prevState => ({
          ...prevState,
          playerStatus: PlayerStatuses.Error
        }));
      }
    };

    switch (playerBundleStatus) {
      case PlayerBundleStatuses.Loaded:
        loadPlayer();
        break;
      case PlayerBundleStatuses.Error:
        if (onPlayerLoadingError) onPlayerLoadingError(entryId);
        setPlayerState(prevState => ({
          ...prevState,
          playerStatus: PlayerStatuses.Error
        }));
        break;
    }
  }, [playerBundleStatus]);

  return playerState;
};
