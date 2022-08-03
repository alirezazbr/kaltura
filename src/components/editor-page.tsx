import React from "react";
import { KalturaPlayerProvider } from "../kaltura-player";
import { PlayerContainer, EntriesConfig } from "./player-container";
import { PlayerBundleConfig } from "../kaltura-player";

export interface EditorPageProps {
  playerConfig: PlayerBundleConfig;
  entriesConfig: EntriesConfig;
}

export function EditorPage(props: EditorPageProps) {
  const { playerConfig, entriesConfig } = props;
  return (
    <KalturaPlayerProvider playerBundleConfig={playerConfig}>
      <PlayerContainer entriesConfig={entriesConfig} />
    </KalturaPlayerProvider>
  );
}
