import { invoke, path } from "@tauri-apps/api";
import { Button, message } from "antd";
import { useState } from "react";
import sanitizeFilename from "sanitize-filename";
import { InvokeResult, VideoInfo } from "./types";

export async function exportFile(
  videoInfo: VideoInfo,
  ffmpegPath: string,
  dstDir: string
) {
  const isSubP = videoInfo.title !== videoInfo.groupTitle;
  let name: string;
  if (isSubP) {
    name = `${videoInfo.uname} - ${videoInfo.title} - ${videoInfo.p}.mp4`;
  } else {
    name = `${videoInfo.uname} - ${videoInfo.title}.mp4`;
  }
  name = sanitizeFilename(name);
  return await invoke<InvokeResult<string>>("export", {
    src: videoInfo.videoPath,
    ffmpeg: ffmpegPath,
    dst: await path.join(dstDir, sanitizeFilename(name)),
  });
}

export function ExportButton(props: {
  video: VideoInfo;
  ffmpeg: string;
  dstDir: string;
}) {
  const [messageAPI, messageContextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const onExport = async () => {
    setLoading(true);
    let rsp = await exportFile(props.video, props.ffmpeg, props.dstDir);
    if (rsp.error) {
      messageAPI.error(rsp.error);
    } else {
      messageAPI.success(`${name} 导出成功`);
    }
    setLoading(false);
  };

  return (
    <>
      {messageContextHolder}
      <Button
        loading={loading}
        disabled={props.video.status !== "completed"}
        onClick={onExport}
      >
        导出
      </Button>
    </>
  );
}
