import * as React from "react";
import { useState } from "react";
import "./styles.css";
import { EditorPage } from "./components/editor-page";
import { ConfigForm } from "./components/config-form";
import { PlayerBundleConfig } from "./kaltura-player";
import { EntriesConfig } from "./components/player-container";
import { Instructions } from "./components/instructions";

const defaultPlayerConfig: PlayerBundleConfig = {
  bundlerUrl: "https://cdnapisec.kaltura.com",
  partnerId: "",
  ks: "",
  uiConfId: ""
};

const defaultEntriesConfig: EntriesConfig = {
  entryId: "",
  alternateEntryId: ""
};

export default function App() {
  const [playerConfig, setPlayerConfig] = useState<PlayerBundleConfig | null>(
    null
  );
  const [entriesConfig, setEntriesConfig] = useState<EntriesConfig>(
    defaultEntriesConfig
  );

  const handleFormSubmit = (data: {
    playerConfig: PlayerBundleConfig;
    entriesConfig: EntriesConfig;
  }) => {
    const { playerConfig, entriesConfig } = data;
    setPlayerConfig(playerConfig);
    setEntriesConfig(entriesConfig);
  };

  const handleDemoConfig = (e: any) => {
    setPlayerConfig({
      bundlerUrl: "https://cdnapisec.kaltura.com",
      partnerId: "2503922",
      ks: "",
      uiConfId: "45152271"
    });
    setEntriesConfig({
      entryId: "0_7fjx3mcg",
      alternateEntryId: "0_7eul7ul1"
    });
  };

  return (
    <div className="App">
      {playerConfig && entriesConfig && entriesConfig.entryId ? (
        <>
        {console.log('1', playerConfig)}
        {console.log('2', entriesConfig)}
          <h1>Kaltura Player V7 - Dashboard</h1>
          <EditorPage
            playerConfig={playerConfig}
            entriesConfig={entriesConfig}
          />
        </>
      ) : (
        <>
          <Instructions />
          <h1>Access demo quickly using sample entries</h1>

          <button className={"submit"} onClick={handleDemoConfig}>
            Click here
          </button>

          <h1>Login into your own partner</h1>
          <ConfigForm
            defaultPlayerConfig={defaultPlayerConfig}
            defaultEntriesConfig={defaultEntriesConfig}
            onSubmit={handleFormSubmit}
          />
        </>
      )}
    </div>
  );
}
