import { useContext, useEffect, useMemo, useRef } from "react";
import { KalturaPlayerContext, SeekOptions } from "./kaltura-player-context";
import { KalturaPlayerUtils } from "./kaltura-player-utils";

export const usePlayer = (playerId: string) => {
  const playerContext = useContext(KalturaPlayerContext);
  const playerIdRef = useRef(playerId);

  useEffect(() => {
    playerIdRef.current = playerId;
  }, [playerId]);

  const result = useMemo(() => {
    function validate() {
      if (!playerIdRef.current) {
        console.warn(
          `trying to perform action on kaltura player but no player id was provided.`
        );
        return false;
      }

      return true;
    }

    return {
      getVideoDimensions: (): null | { width: number; height: number } => {
        if (!validate()) {
          return null;
        }

        return new KalturaPlayerUtils(playerIdRef.current).getVideoDimensions();
      },
      getPlayerDimensions: (): null | { width: number; height: number } => {
        if (!validate()) {
          return null;
        }

        return new KalturaPlayerUtils(
          playerIdRef.current
        ).getPlayerDimensions();
      },
      playerPlay: () => {
        if (!validate()) {
          return;
        }
        playerContext.play(playerIdRef.current);
      },
      playerSeek: (options: SeekOptions) => {
        if (!validate()) {
          return;
        }
        playerContext.seek(playerIdRef.current, options);
      },
      playerPause: () => {
        if (!validate()) {
          return;
        }
        playerContext.pause(playerIdRef.current);
      },
      getPlayerInstance: () => {
        if (!validate()) {
          return null;
        }

        return new KalturaPlayerUtils(playerIdRef.current).getInstance();
      }
    };
  }, [playerContext]);

  return result;
};
