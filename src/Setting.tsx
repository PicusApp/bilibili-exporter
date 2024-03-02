import { Button, Col, Input, Row, message } from "antd";
import { useEffect, useState } from "react";
import { getInstance } from "./setting-manager";

export function Setting() {
  const [downloadPath, setDownloadPath] = useState("");
  const [exportPath, setExportPath] = useState("");
  const [ffmpegPath, setFFmpegPath] = useState("");
  const [messageAPI, messageContextHolder] = message.useMessage();

  useEffect(() => {
    async function loadConfig() {
      let settingsManager = getInstance();
      setDownloadPath(settingsManager?.getCache("downloadPath")!);
      setExportPath(settingsManager?.getCache("exportPath")!);
      setFFmpegPath(settingsManager?.getCache("ffmpegPath")!);
    }
    loadConfig();
  }, []);

  return (
    <>
      {messageContextHolder}

      <Row align="middle">
        <Col span={4}>
          <p>Bilibili 下载路径</p>
        </Col>
        <Col span={18}>
          <Input
            value={downloadPath}
            onChange={(e) => setDownloadPath(e.target.value)}
          />
        </Col>
      </Row>

      <Row align="middle">
        <Col span={4}>
          <p>导出路径</p>
        </Col>
        <Col span={18}>
          <Input
            value={exportPath}
            onChange={(e) => setExportPath(e.target.value)}
          ></Input>
        </Col>
      </Row>

      <Row align="middle">
        <Col span={4}>
          <p>ffmpeg.exe 路径</p>
        </Col>
        <Col span={18}>
          <Input
            value={ffmpegPath}
            onChange={(e) => setFFmpegPath(e.target.value)}
          ></Input>
        </Col>
      </Row>

      <Row>
        <Button
          type="primary"
          onClick={async () => {
            let settings = getInstance()!;
            settings.setCache("downloadPath", downloadPath);
            settings.setCache("exportPath", exportPath);
            settings.setCache("ffmpegPath", ffmpegPath);
            settings.syncCache();
            messageAPI.success("设置保存成功");
          }}
        >
          保存
        </Button>
      </Row>
    </>
  );
}
