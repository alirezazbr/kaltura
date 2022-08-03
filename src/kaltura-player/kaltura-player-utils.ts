export class KalturaPlayerUtils {
  // @ts-ignore
  private _KalturaPlayer = window.KalturaPlayer;

  constructor(private _playerId: string) {}

  private _getPlayerInstance() {
    if (!this._KalturaPlayer || !this._playerId) {
      return null;
    }

    return this._KalturaPlayer.getPlayer(this._playerId);
  }

  getInstance() {
    return this._getPlayerInstance();
  }

  getVideoDimensions(): null | { width: number; height: number } {
    const playerInstance = this._getPlayerInstance();

    if (!playerInstance) {
      return null;
    }

    const videoElement = playerInstance.getVideoElement();
    return videoElement
      ? {
          width: videoElement.videoWidth,
          height: videoElement.videoHeight
        }
      : null;
  }

  getPlayerDimensions(): null | { width: number; height: number } {
    const playerInstance = this._getPlayerInstance();

    if (!playerInstance) {
      return null;
    }

    const view = playerInstance.getView();

    if (!view) {
      return null;
    }

    return {
      width: view.offsetWidth,
      height: view.offsetHeight
    };
  }
}
