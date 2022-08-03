import { useEffect, useState } from "react";
import {
  PlayerBundleConfig,
  PlayerBundleStatuses
} from "../kaltura-player-context";

type InjectStatuses = "loading" | "loaded" | "error" | "initial";
let injectedScriptUrl: string | null = null;
let injectStatus: InjectStatuses = "initial";
let injectLoadedCallbacks: (() => void)[] = [];

const handleInjectResponse = (status: "error" | "loaded") => {
  injectStatus = status;
  injectLoadedCallbacks.forEach(cb => {
    cb();
  });
  injectLoadedCallbacks = [];
};

const addInjectCallback = (cb: () => void) => {
  injectLoadedCallbacks.push(cb);
};

const removeInjectCallback = (cb: () => void) => {
  injectLoadedCallbacks = injectLoadedCallbacks.filter(
    listener => listener !== cb
  );
};

const injectScriptIntoPage = (playerBundlerUrl: string) => {
  if (injectStatus !== "initial") {
    return;
  }

  injectStatus = "loading";
  injectedScriptUrl = playerBundlerUrl;

  if (!playerBundlerUrl) {
    console.warn(
      "Failed to load player into session," +
        " did you forget to provide a player bundler url?"
    );
    handleInjectResponse("error");
    return;
  }

  // @ts-ignore
  if (!!window["KalturaPlayer"] && window["KalturaPlayer"].setup) {
    handleInjectResponse("loaded");
    return;
  }

  try {
    const head = document.head || document.getElementsByTagName("head")[0];
    const scriptElement = document.createElement("script");
    scriptElement.type = "text/javascript";
    scriptElement.src = playerBundlerUrl;
    scriptElement.onload = () => {
      handleInjectResponse("loaded");
    };
    scriptElement.onerror = e => {
      console.warn(`Failed to load kaltura player bundler script.`, e);
      handleInjectResponse("error");
    };
    head.appendChild(scriptElement);
  } catch (e) {
    console.warn(`Failed to load kaltura player bundler script.`, e);
    handleInjectResponse("error");
  }
};

export const useLoadPlayerBundler = (options: {
  playerBundleConfig: PlayerBundleConfig;
}) => {
  const { playerBundleConfig } = options;
  const [playerBundleStatus, setPlayerBundleStatus] = useState(
    PlayerBundleStatuses.Initial
  );

  useEffect(() => {
    const handleLateBundleCallback = () => {
      if (injectStatus === "loaded") {
        setPlayerBundleStatus(PlayerBundleStatuses.Loaded);
      } else {
        setPlayerBundleStatus(PlayerBundleStatuses.Error);
      }
    };

    if (
      playerBundleStatus === PlayerBundleStatuses.Error ||
      playerBundleStatus === PlayerBundleStatuses.Loaded
    ) {
      return;
    }

    if (playerBundleStatus === PlayerBundleStatuses.Initial) {
      if (
        !playerBundleConfig ||
        !playerBundleConfig.partnerId ||
        !playerBundleConfig.uiConfId ||
        !playerBundleConfig.bundlerUrl
      ) {
        console.warn(`cannot load kaltura player bundler into session,
        missing parameters (did you remember to provide partnerId,
        uiConfId and playerBundleUrl?`);
        setPlayerBundleStatus(PlayerBundleStatuses.Error);
        return;
      }

      setPlayerBundleStatus(PlayerBundleStatuses.Loading);
      return;
    }

    const playerBundlerUrl = `${playerBundleConfig.bundlerUrl}/p/${
      playerBundleConfig.partnerId
    }/embedPlaykitJs/uiconf_id/${playerBundleConfig.uiConfId}`;

    if (!injectedScriptUrl) {
      addInjectCallback(handleLateBundleCallback);
      injectScriptIntoPage(playerBundlerUrl);
      return;
    }

    if (injectedScriptUrl !== playerBundlerUrl) {
      setPlayerBundleStatus(PlayerBundleStatuses.Error);
      console.warn(`It is not allowed to create multiple players'
       bundlers with different bundler urls. Did you create more than one
       provider ?`);
      return;
    }

    switch (injectStatus) {
      case "loaded":
        setPlayerBundleStatus(PlayerBundleStatuses.Loaded);
        break;
      case "loading":
        addInjectCallback(handleLateBundleCallback);
        break;
      default:
        setPlayerBundleStatus(PlayerBundleStatuses.Error);
        break;
    }
    return () => {
      removeInjectCallback(handleLateBundleCallback);
    };
  }, [playerBundleStatus, playerBundleConfig]);

  return { playerBundleStatus };
};
