import React from "react";
import { useForm } from "react-hook-form";
import { PlayerBundleConfig } from "../kaltura-player";
import { EntriesConfig } from "./player-container";

export interface ConfigFormProps {
  defaultPlayerConfig: PlayerBundleConfig;
  defaultEntriesConfig: EntriesConfig;
  onSubmit: (data: {
    playerConfig: PlayerBundleConfig;
    entriesConfig: EntriesConfig;
  }) => void;
}
export const ConfigForm = (props: ConfigFormProps) => {
  const { defaultPlayerConfig, defaultEntriesConfig } = props;
  const { handleSubmit, register, errors, setValue } = useForm({
    defaultValues: {
      ...defaultPlayerConfig,
      ...defaultEntriesConfig
    }
  });

  const onFormSubmit = (values: PlayerBundleConfig & EntriesConfig) => {
    const { entryId, alternateEntryId, ...playerConfig } = values;
    props.onSubmit({
      playerConfig,
      entriesConfig: {
        entryId,
        alternateEntryId
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <label>KS (Optional)</label>
      <input name="ks" ref={register({})} />

      <label>Bundle URL</label>
      <input
        name="bundlerUrl"
        ref={register({
          required: "Required"
        })}
      />
      {errors.bundlerUrl && errors.bundlerUrl.message}

      <label>UIConf</label>
      <input
        name="uiConfId"
        ref={register({
          required: "Required"
        })}
      />
      {errors.uiConfId && errors.uiConfId.message}

      <label>Partner ID</label>
      <input
        name="partnerId"
        ref={register({
          required: "Required"
        })}
      />
      {errors.partnerId && errors.partnerId.message}

      <label>Entry ID</label>
      <input
        name="entryId"
        ref={register({
          required: "Required"
        })}
      />
      {errors.entryId && errors.entryId.message}

      <label>Alternate Entry ID (Optional)</label>
      <input name="alternateEntryId" ref={register({})} />

      <button type="submit">Submit</button>
    </form>
  );
};
