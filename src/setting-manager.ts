import { path } from "@tauri-apps/api";
import { SettingsManager } from "tauri-settings";

export type AppConfig = {
  downloadPath: string;
  exportPath: string;
  ffmpegPath: string;
};

let instance: SettingsManager<AppConfig> | null = null;

export async function initializeSettingsManager(homeVideoDir: string) {
  instance = new SettingsManager<AppConfig>(
    {
      downloadPath: await path.join(homeVideoDir, "bilibili"),
      exportPath: await path.join(homeVideoDir, "bilibili-export"),
      ffmpegPath: "ffmpeg.exe",
    },
    {
      fileName: "bilibili-export",
    }
  );
  await instance.initialize();
  instance.syncCache();
}

export function getInstance() {
  return instance;
}
