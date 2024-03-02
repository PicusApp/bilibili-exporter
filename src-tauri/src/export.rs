use std::fs::File;
use std::io::Seek;
use std::io::SeekFrom;
use std::path::PathBuf;
use std::vec;

use anyhow::anyhow;
use anyhow::Context;
use tauri::api::process::Command;
use tempfile::NamedTempFile;
use tracing::error;

pub async fn export<'a>(
    src: &'a str,
    ffmpeg: &'a str,
    dst: &'a str,
) -> Result<String, anyhow::Error> {
    let stat = std::fs::metadata(src).context("stat failed")?;
    if !stat.is_dir() {
        return Err(anyhow!("src {} is not a dir", src));
    }

    let dst_path = PathBuf::from(dst);
    let dst_dir = dst_path.parent().unwrap();
    std::fs::create_dir_all(dst_dir)?;

    let mut to_merge = vec![];
    for file in std::fs::read_dir(src).context("read dir failed")? {
        let file_name = file?.path().display().to_string();
        if file_name.ends_with(".m4s") {
            to_merge.push(file_name);
        }
    }
    if to_merge.len() != 2 {
        return Err(anyhow!(
            "invalid video source, src: {}, segment count: {}",
            src,
            to_merge.len()
        ));
    }

    let mut truncated: Vec<NamedTempFile> = vec![];
    for file in &to_merge {
        let mut temp_file =
            NamedTempFile::with_prefix("bilibili-exporter-").context("create tmp file failed")?;
        let mut src_file = File::open(file).context("open src file failed")?;
        // from: 00000000: 3030 3030 3030 3030 3000 0000 2466 7479
        // to  : 00000000:                       00 0000 2466 7479
        src_file.seek(SeekFrom::Start(9))?;
        std::io::copy(&mut src_file, &mut temp_file)?;
        truncated.push(temp_file);
    }

    let mut args: Vec<String> = vec!["-y".to_string()];
    for file in &truncated {
        args.push("-i".into());
        args.push(file.path().display().to_string());
    }
    args.push("-codec".into());
    args.push("copy".into());
    args.push(dst.into());

    match Command::new(ffmpeg).args(args).output() {
        Ok(output) => {
            if output.status.success() {
                Ok("ok".to_string())
            } else {
                error!("stderr: {}", output.stderr);
                error!("stdout: {}", output.stdout);
                Err(anyhow!("execute ffmpeg failed"))
            }
        }
        Err(e) => Err(e.into()),
    }
}
