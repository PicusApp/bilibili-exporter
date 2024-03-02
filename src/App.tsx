import { ExportOutlined, SettingOutlined } from "@ant-design/icons";
import { path } from "@tauri-apps/api";
import { FileEntry, readDir, readTextFile } from "@tauri-apps/api/fs";
import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import {
  Button,
  Card,
  Descriptions,
  Menu,
  MenuProps,
  Space,
  Spin,
  message,
} from "antd";
import { useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { ExportButton, exportFile } from "./ExportButton";
import { Setting } from "./Setting";
import { getInstance } from "./setting-manager";
import { DirEntryResponse, InvokeResult, VideoInfo } from "./types";

const hasVideoInfo = (files: FileEntry[]) => {
  for (let file of files) {
    if (file.name === ".videoInfo") {
      return true;
    }
  }
  return false;
};

function getTitle(videoInfo: VideoInfo) {
  let isSubP = videoInfo.groupTitle !== videoInfo.title;
  return isSubP
    ? videoInfo.title + " - " + videoInfo.p.toString()
    : videoInfo.title;
}

function Export() {
  const [messageAPI, messageContextHolder] = message.useMessage();
  const [scanLoading, setScanLoading] = useState(false);
  const [exportAllLoading, setExportAllLoading] = useState(false);
  const [videoInfoList, setVideoInfoList] = useState<VideoInfo[]>();

  let settings = getInstance();
  let ffmpegPath = settings?.getCache("ffmpegPath")!;
  let exportPath = settings?.getCache("exportPath")!;
  let downloadPath = settings?.getCache("downloadPath")!;

  const scanVideos = async (p: string) => {
    setScanLoading(true);
    messageAPI.destroy();
    messageAPI.open({ type: "info", content: "开始扫描" });

    try {
      let infoList: VideoInfo[] = [];
      setVideoInfoList(infoList);
      let videoDirs = await readDir(p);
      for (let videoDir of videoDirs) {
        let stat = await invoke<InvokeResult<DirEntryResponse>>("stat", {
          path: videoDir.path,
        });
        if (stat.error) {
          messageAPI.open({ type: "error", content: stat.error });
          continue;
        }
        if (!stat.data?.is_dir) {
          continue;
        }

        let files = await readDir(videoDir.path);
        if (hasVideoInfo(files)) {
          let buf = await readTextFile(
            await path.join(videoDir.path, ".videoInfo")
          );
          let videoInfo: VideoInfo = JSON.parse(buf);
          videoInfo.videoPath = videoDir.path;
          infoList.push(videoInfo);
        }
      }
      setVideoInfoList(infoList);
    } catch (error: unknown) {
      messageAPI.open({ type: "error", content: JSON.stringify(error) });
      setScanLoading(false);
      return;
    }

    messageAPI.open({ type: "success", content: "扫描完成" });
    setScanLoading(false);
  };

  return (
    <>
      {messageContextHolder}

      <Space style={{ margin: "10px" }}>
        <Button
          type="default"
          onClick={async () => scanVideos(downloadPath)}
          loading={scanLoading}
        >
          重新扫描
        </Button>

        <Button
          type="primary"
          loading={exportAllLoading}
          onClick={async () => {
            setExportAllLoading(true);
            for (let video of videoInfoList!) {
              let rsp = await exportFile(video, ffmpegPath, exportPath);
              if (rsp.error) {
                messageAPI.error(rsp.error);
              } else {
                messageAPI.success(`${getTitle(video)} 导出成功`);
              }
            }
            setExportAllLoading(false);
          }}
        >
          全部导出
        </Button>
      </Space>

      <Spin spinning={scanLoading} size="large">
        <div
          style={{
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
            alignItems: "center",
            justifyItems: "center",
          }}
        >
          {videoInfoList?.map((videoInfo) => {
            let items = [{ key: 2, label: "UP主", children: videoInfo.uname }];
            let isSubP = videoInfo.groupTitle !== videoInfo.title;
            if (isSubP) {
              items.push({
                key: 4,
                label: "视频组",
                children: videoInfo.groupTitle,
              });
            }
            let title = getTitle(videoInfo);

            return (
              <Card
                key={videoInfo.bvid + videoInfo.p.toString()}
                title={title}
                style={{
                  margin: "10px",
                  width: "400px",
                  height: "auto",
                }}
                cover={
                  <img alt="cover" src={convertFileSrc(videoInfo.coverPath)} />
                }
              >
                <Descriptions items={items} />
                <ExportButton
                  video={videoInfo}
                  ffmpeg={ffmpegPath}
                  dstDir={exportPath}
                ></ExportButton>
              </Card>
            );
          })}
        </div>
      </Spin>
    </>
  );
}

function App() {
  const [current, setCurrent] = useState("export");
  const [location, setLocation] = useLocation();

  const onClick: MenuProps["onClick"] = (e) => {
    setCurrent(e.key);
    setLocation("/" + e.key);
  };

  return (
    <div>
      <Menu
        onClick={onClick}
        selectedKeys={[current]}
        mode="horizontal"
        items={[
          {
            label: "导出",
            key: "export",
            icon: <ExportOutlined />,
          },
          {
            label: "设置",
            key: "setting",
            icon: <SettingOutlined />,
          },
        ]}
      />
      <Switch location={location}>
        <Route path="/setting" component={Setting} />
        <Route component={Export} />
      </Switch>
    </div>
  );
}

export default App;
