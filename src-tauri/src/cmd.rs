use crate::types::InvokeResult;
use crate::types::Stat;

#[tauri::command]
pub async fn export<'a>(
    src: &'a str,
    ffmpeg: &'a str,
    dst: &'a str,
) -> Result<InvokeResult<String>, ()> {
    Ok(crate::export::export(src, ffmpeg, dst).await.into())
}

#[tauri::command]
pub fn stat(path: &str) -> InvokeResult<Stat> {
    std::fs::metadata(path).map(|x| Stat(x)).into()
}

#[tauri::command]
pub fn home_video_dir() -> InvokeResult<String> {
    (match dirs::video_dir() {
        None => Err("invalid video directory"),
        Some(x) => Ok(x.display().to_string()),
    })
    .into()
}
