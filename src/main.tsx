import { invoke } from "@tauri-apps/api";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initializeSettingsManager } from "./setting-manager";
import { InvokeResult } from "./types";

async function main() {
  let { data, error } = await invoke<InvokeResult<string>>("home_video_dir");
  if (error) {
    console.log(error);
    return;
  }

  await initializeSettingsManager(data!);

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

main();
