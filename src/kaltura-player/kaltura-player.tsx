import * as React from "react";
import { useLoadPlayer } from "./inner-hooks/use-load-player";
import { PlayerStatuses } from "./kaltura-player-context";
import { StyleSheet, css } from "aphrodite";

export interface KalturaPlayerProps {
  /**
   * Entry Id, playable media entry id.
   */
  entryId: string;
  /**
   * Autoplay. Indicating if the auto play selected media
   * @default true
   */
  autoplay: boolean;
  /**
   * OnPlayerLoaded event handler. Will be called after all player bundler scripts were loaded
   * @param {entryId: string, playerId: string}
   */
  onPlayerLoaded?: (data: { entryId: string; playerId: string }) => void;
  /**
   * OnMediaLoaded event handler. Will be called after media entry was successful loaded in player
   * @param entryId
   */
  onMediaLoaded?: (entryId: string) => void;
  /**
   * onPlayerLoadingError event handler. Will be called after a player loading related error
   * @param error
   */
  onPlayerLoadingError?: (entryId: string) => void;
  /**
   * onMediaLoadingError event handler. Will be called after a media loading related error
   * @param error
   */
  onMediaLoadingError?: (entryId: string) => void;

  /**
   * customize player config before player setup
   */
  customizeConfig?: (config: Record<string, any>) => Record<string, any>;
}

/*
DEVELOPER NOTICE
we used 'aphrodite' library to style this component but any css-in-js
library should fit. And you can always convert it to whatever method you are using.
This is the only place we actually need styling.
Checkout https://github.com/MicheleBertoli/css-in-js
*/
const classes = StyleSheet.create({
  kalturaPlayer: {
    height: "100%",
    width: "100%"
  },
  scriptErrorContainer: {
    height: "100%",
    width: "100%",
    backgroundColor: "lightgray",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    position: "relative",
    borderRadius: "4px"
  },
  scriptsErrorMsg: {
    width: "100%",
    fontSize: "15px",
    fontWeight: "normal",
    fontStretch: "normal",
    fontStyle: "normal",
    lineHeight: "normal",
    letterSpacing: "normal",
    textAlign: "center",
    color: "#434a4b"
  }
});

export const PlayerErrorMessage = "Oops, failed to load the player";

export const KalturaPlayer = (props: KalturaPlayerProps) => {
  const {
    entryId,
    autoplay,
    onPlayerLoadingError,
    onPlayerLoaded,
    customizeConfig,
    onMediaLoadingError,
    onMediaLoaded
  } = props;

  const { playerId, playerStatus } = useLoadPlayer({
    autoplay,
    entryId,
    onPlayerLoadingError,
    onPlayerLoaded,
    onMediaLoadingError,
    onMediaLoaded,
    customizeConfig
  });

  return (
    <>
      {playerStatus === PlayerStatuses.Error ? (
        <div className={css(classes.scriptErrorContainer)}>
          <div className={css(classes.scriptsErrorMsg)}>
            {PlayerErrorMessage}
          </div>
        </div>
      ) : (
        <div id={playerId} className={css(classes.kalturaPlayer)} />
      )}
    </>
  );
};

KalturaPlayer.defaultProps = {
  autoplay: true
};
