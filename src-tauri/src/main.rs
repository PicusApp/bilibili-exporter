// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cmd;
mod types;
mod export;

fn main() {
    tracing_subscriber::fmt::init();
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![cmd::stat, cmd::export, cmd::home_video_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
