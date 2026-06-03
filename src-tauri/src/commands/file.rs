use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;

/// Get the directory where the executable is located
fn get_exe_dir() -> Result<PathBuf, String> {
    std::env::current_exe()
        .map_err(|e| format!("Failed to get exe path: {}", e))?
        .parent()
        .map(|p| p.to_path_buf())
        .ok_or_else(|| "Failed to get exe directory".to_string())
}

/// Get the default config path: frpc.toml in the same directory as the exe
fn get_default_config_path_internal() -> Result<PathBuf, String> {
    let mut path = get_exe_dir()?;
    path.push("frpc.toml");
    Ok(path)
}

/// Resolve the config path to use:
/// 1. If user_path is provided and exists, use it
/// 2. If user_path is provided but doesn't exist, return it anyway (will be created on save)
/// 3. Otherwise use exe_dir/frpc.toml
#[tauri::command]
pub async fn resolve_config_path(user_path: Option<String>) -> Result<String, String> {
    if let Some(path) = user_path {
        return Ok(path);
    }
    let path = get_default_config_path_internal()?;
    Ok(path.to_string_lossy().to_string())
}

/// Load config from the resolved path
#[tauri::command]
pub async fn load_app_config(user_path: Option<String>) -> Result<String, String> {
    let path_str = resolve_config_path(user_path).await?;
    let path = PathBuf::from(&path_str);

    if path.exists() {
        fs::read_to_string(&path).map_err(|e| format!("Failed to read config: {}", e))
    } else {
        Ok(String::new())
    }
}

/// Save config to the resolved path
#[tauri::command]
pub async fn save_app_config(content: String, user_path: Option<String>) -> Result<String, String> {
    let path_str = resolve_config_path(user_path).await?;
    let path = PathBuf::from(&path_str);

    // Ensure parent directory exists
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| {
                format!(
                    "Failed to create parent directory '{}': {}",
                    parent.display(),
                    e
                )
            })?;
        }
    }

    fs::write(&path, &content)
        .map_err(|e| format!("Failed to write config '{}': {}", path.display(), e))?;
    Ok(path.to_string_lossy().to_string())
}

/// Get the path that would be used (for display purposes)
#[tauri::command]
pub async fn get_default_config_path() -> Result<String, String> {
    let path = get_default_config_path_internal()?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn read_config_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub async fn write_config_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
pub async fn pick_config_file(app: AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app
        .dialog()
        .file()
        .add_filter("TOML", &["toml"])
        .blocking_pick_file();

    Ok(file_path.map(|p| p.to_string()))
}

#[tauri::command]
pub async fn save_config_dialog(app: AppHandle, content: String) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app
        .dialog()
        .file()
        .add_filter("TOML", &["toml"])
        .blocking_save_file();

    if let Some(ref path) = file_path {
        let path_str = path.to_string();
        fs::write(&path_str, content).map_err(|e| format!("Failed to write file: {}", e))?;
    }

    Ok(file_path.map(|p| p.to_string()))
}
