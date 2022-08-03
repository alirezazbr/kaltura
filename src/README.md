# About this Demo

The project shows how to integrate Kaltura Player v7 into the React application.

## Technology Stack:

- React
- Rxjs (for async updates)
- aphrodite (for styling - feel free to remove and use your preferred css-in-jss implementation)

## The Kaltura-Player library

The folder `Kaltura-player` is a library that manages Kaltura Player v7 components. In our codebase, it is deployed as a separate library that is consumed by the application.

> You should use only components that are exported by the `index.ts` file.

# Integrate the player into your application

## Step 1 - The Provider

> Check out `src/components/editor-page.tsx` as a reference

1. add the provider in a component that already knows the logged user and can provide its' credentials and partner Id.
2. provide relevant configuration

```
<KalturaPlayerProvider playerBundleConfig={playerConfig}>

    </KalturaPlayerProvider>
```

where `playerConfig` contains

```
{
  ks?: string;
  bundlerUrl?: string;
  partnerId?: string;
  uiConfId?: string;
}
```

> NOTE that you can bundle only one configuration per session (until the page reloads) because, under the hood, the provider fetches the specific player given the partner id and the uiconf.

## Step 2 - Use Kaltura Player

> Check out `src/components/player-container.tsx` as a reference

1. add the Kaltura player component anywhere you want as long as it is nested somewhere below the provider.
2. you should provide the `entryId` and an optional `autoLoad` flag

```
<div style={{ height: 400, width: "100%" }}>
        <KalturaPlayer
          entryId={entryId}
          autoplay={true}
        />
      </div>
```

If you don't need to access the player directly, you are all set up.

## Step 3 (Optional) - Use API to interact with the player

> Check out `src/components/player-container.tsx` as a reference.

1. use `onPlayerLoaded` prop to get the unique player id created while mounting the player

```
    <div style={{ height: 400, width: "100%" }}>
        <KalturaPlayer
          entryId={entryId}
          autoplay={true}
          onPlayerLoaded={handlePlayerLoaded}
        />
      </div>
```

`handlePlayerLoaded` callback can store the player id locally or in redux store or any other place.

```
const handlePlayerLoaded = (data: { playerId: string }) => {
    const { playerId } = data;

    if (!playerId) {
      return;
    }

    setPlayerId(playerId);
  };
```

2. use hook `usePlayer` to perform operations like:

- get video dimensions
- get player dimensions
- player play
- player pause
- player seek

3. use hook `usePlayerUpdates` to get information about the player:

- get the player current time (observable or explicitly)
- get the player state (observable or explicitly)
- get the player events (observable or explicitly)

4. use `customizeConfig` prop to be able to customise the configuration during player load

```
    <div style={{ height: 400, width: "100%" }}>
        <KalturaPlayer
          entryId={entryId}
          autoplay={true}
          customizeConfig={customizeConfig}
        />
      </div>
```

The example below adds a square yellow button to the top bar by using a cool API of the player to affect the player preset. For further information [read the documentation](https://github.com/kaltura/playkit-js-ui/blob/master/docs/ui-components.md)

```
const customizeConfig = (config: any) => {
    // DEVELOPER NOTICE - this is an optional method that lets you
    // customize the plaer config during loading.
    // if you don't need to customize, just remove it, just remove it

    const tooltip = "I'm such a cool yellow button, added by the application";
    // @ts-ignore
    const h = window.KalturaPlayer.ui.preact.h;
    const customButton = h("div", {
      title: tooltip,
      onClick: () => {
        alert(tooltip);
      },
      style: { marginTop: 10, width: 30, height: 30, background: "yellow" }
    });

    const newConfig = {
      ...config,
      ui: {
        ...(config.ui || {}),
        uiComponents: [
          ...((config.ui || {}).uiComponents || []),
          {
            label: "add custom",
            presets: ["Playback"],
            container: "TopBarLeftControls",
            get: () => customButton
          }
        ]
      }
    };
    return newConfig;
  };
```

## Step 4 (Optional) - Advanced! access the underline player instance to perform any supported API request directly

> Check out `src/components/player-container.tsx` as a reference.

1. use `getPlayerInstance` method exposed by `usePlayer` hook to perform the request. The example below shows how to toggle mute status

```
const { getPlayerInstance } = usePlayer(
    playerId
  );

const handleToggleMute = () => {
    const playerInstance = getPlayerInstance();

    if (!playerInstance) {
      return;
    }

    playerInstance.muted = !playerInstance.muted;
  };
```
