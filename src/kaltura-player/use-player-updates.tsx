import { useContext, useEffect, useMemo, useRef } from 'react';
import {KalturaPlayerContext, PlaybackStatuses, PlayerEvents} from "./kaltura-player-context";
import {BehaviorSubject, Subject} from 'rxjs';

export const usePlayerUpdates = (playerId: string) => {
  const {getPlayerState$, getPlayerCurrentTime$, getPlayerEvents$} = useContext(KalturaPlayerContext);
  const playerStateRef = useRef(new BehaviorSubject(PlaybackStatuses.Idle));
  const playerEventsRef = useRef(new Subject<PlayerEvents>());
  const playerTimeRef = useRef(new BehaviorSubject(0));

  useEffect(() => {
    if(!playerId) return;

    const playerCurrentTimeSubscription =
      getPlayerCurrentTime$(playerId).subscribe((currentTime) => {
        playerTimeRef.current.next(currentTime);
      });

    const playerCurrentStateSubscription =
      getPlayerState$(playerId).subscribe((currentState) => {
        playerStateRef.current.next(currentState);
      });

    const playerEventsSubscription =
      getPlayerEvents$(playerId).subscribe((currentState) => {
        playerEventsRef.current.next(currentState);
      });

    return () => {
      playerCurrentStateSubscription.unsubscribe();
      playerCurrentTimeSubscription.unsubscribe();
      playerEventsSubscription.unsubscribe();
    };

  }, [playerId]);

  const result = useMemo(() => {
    return {
      playerTime$: playerTimeRef.current.asObservable(),
      playerState$: playerStateRef.current.asObservable(),
      playerEvents$: playerEventsRef.current.asObservable(),
      getPlayerTime: () => {
        return playerTimeRef.current.getValue();
      },
      getPlayerState: () => {
        return playerStateRef.current.getValue();
      }
    }
  }, [playerId]);


  return result
};
