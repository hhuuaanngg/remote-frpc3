use tauri::AppHandle;
use tauri_plugin_autostart::ManagerExt;

#[tauri::command]
pub async fn get_autostart_status(app: AppHandle) -> Result<bool, String> {
    let autostart = app.autolaunch();
    autostart
        .is_enabled()
        .map_err(|e| format!("Failed to get autostart status: {}", e))
}

#[tauri::command]
pub async fn enable_autostart(app: AppHandle, _auto_start_frpc: bool) -> Result<(), String> {
    let autostart = app.autolaunch();

    // The startup args are configured on the plugin builder in lib.rs.
    // The frontend setting controls whether the emitted startup event starts frpc.
    autostart
        .enable()
        .map_err(|e| format!("Failed to enable autostart: {}", e))
}

#[tauri::command]
pub async fn disable_autostart(app: AppHandle) -> Result<(), String> {
    let autostart = app.autolaunch();
    autostart
        .disable()
        .map_err(|e| format!("Failed to disable autostart: {}", e))
}
