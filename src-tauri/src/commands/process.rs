use std::path::Path;
use std::sync::Mutex;
use std::time::SystemTime;
use tauri::AppHandle;

#[derive(Debug, Clone, serde::Serialize)]
pub struct ProcessStatus {
    pub running: bool,
    pub pid: Option<u32>,
    pub start_time: Option<u64>,
}

// Store the child process handle to prevent it from being dropped (which would kill the process)
static FRPC_CHILD: Mutex<Option<std::process::Child>> = Mutex::new(None);
static FRPC_PID: Mutex<Option<u32>> = Mutex::new(None);
static FRPC_START_TIME: Mutex<Option<SystemTime>> = Mutex::new(None);

/// Safely lock a mutex, recovering from poisoned state if needed
fn safe_lock<T>(mutex: &Mutex<T>) -> std::sync::MutexGuard<'_, T> {
    match mutex.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[frpc-editor] Mutex poisoned, recovering...");
            poisoned.into_inner()
        }
    }
}

/// Synchronously kill any running frpc process.
/// Called before app exit to ensure frpc is not left orphaned.
pub fn kill_frpc_sync() {
    eprintln!("[frpc-editor] kill_frpc_sync: cleaning up frpc process...");

    let mut guard = safe_lock(&FRPC_CHILD);
    if let Some(mut child) = guard.take() {
        eprintln!("[frpc-editor] kill_frpc_sync: killing stored child handle...");
        let _ = child.kill();
        let _ = child.wait();
        eprintln!("[frpc-editor] kill_frpc_sync: child killed.");
    } else {
        eprintln!("[frpc-editor] kill_frpc_sync: no stored child handle.");
    }

    {
        let mut guard = safe_lock(&FRPC_PID);
        *guard = None;
    }
    {
        let mut guard = safe_lock(&FRPC_START_TIME);
        *guard = None;
    }
}

/// Synchronously check whether the frpc process managed by this app is still running.
pub fn is_frpc_running_sync() -> bool {
    let pid = {
        let guard = safe_lock(&FRPC_PID);
        *guard
    };

    let running = if let Some(p) = pid {
        let child_running = {
            let mut guard = safe_lock(&FRPC_CHILD);
            if let Some(ref mut child) = *guard {
                match child.try_wait() {
                    Ok(None) => true,
                    Ok(Some(_)) => {
                        let _ = guard.take();
                        false
                    }
                    Err(e) => {
                        eprintln!("[frpc-editor] is_frpc_running_sync try_wait error: {}", e);
                        let _ = guard.take();
                        false
                    }
                }
            } else {
                false
            }
        };

        if !child_running {
            #[cfg(target_os = "windows")]
            {
                use std::os::windows::process::CommandExt;
                const CREATE_NO_WINDOW: u32 = 0x08000000;

                std::process::Command::new("tasklist")
                    .args(["/FI", &format!("PID eq {}", p), "/NH"])
                    .creation_flags(CREATE_NO_WINDOW)
                    .output()
                    .map(|output| {
                        let stdout = String::from_utf8_lossy(&output.stdout);
                        stdout.contains(&p.to_string())
                    })
                    .unwrap_or(false)
            }
            #[cfg(not(target_os = "windows"))]
            {
                std::process::Command::new("ps")
                    .args(["-p", &p.to_string()])
                    .output()
                    .map(|output| output.status.success())
                    .unwrap_or(false)
            }
        } else {
            true
        }
    } else {
        false
    };

    if !running {
        {
            let mut guard = safe_lock(&FRPC_CHILD);
            let _ = guard.take();
        }
        {
            let mut guard = safe_lock(&FRPC_PID);
            *guard = None;
        }
        {
            let mut guard = safe_lock(&FRPC_START_TIME);
            *guard = None;
        }
    }

    running
}

#[tauri::command]
pub async fn start_frpc(config_path: String, frpc_path: String) -> Result<u32, String> {
    eprintln!("[frpc-editor] start_frpc called: path={}, config={}", frpc_path, config_path);

    // Stop any existing process first
    {
        let mut guard = safe_lock(&FRPC_CHILD);
        if let Some(mut child) = guard.take() {
            eprintln!("[frpc-editor] Killing existing frpc process...");
            let _ = child.kill();
            let _ = child.wait();
            eprintln!("[frpc-editor] Existing process terminated.");
        }
    }

    eprintln!("[frpc-editor] Spawning frpc...");

    // Set working directory to the config file's parent folder so frpc's log files
    // don't end up in src-tauri (which would trigger Tauri dev mode rebuilds)
    let work_dir = Path::new(&config_path)
        .parent()
        .and_then(|p| p.to_str())
        .map(|s| s.to_string())
        .unwrap_or_else(|| {
            std::env::current_dir()
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_default()
        });
    eprintln!("[frpc-editor] Setting frpc working directory to: {}", work_dir);

    #[cfg(target_os = "windows")]
    let child = {
        use std::os::windows::process::CommandExt;
        use std::process::Stdio;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        std::process::Command::new(&frpc_path)
            .args(["-c", &config_path])
            .current_dir(&work_dir)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()
            .map_err(|e| {
                let msg = format!("Failed to start frpc: {}", e);
                eprintln!("[frpc-editor] {}", msg);
                msg
            })?
    };

    #[cfg(not(target_os = "windows"))]
    let child = {
        use std::process::Stdio;
        std::process::Command::new(&frpc_path)
            .args(["-c", &config_path])
            .current_dir(&work_dir)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| {
                let msg = format!("Failed to start frpc: {}", e);
                eprintln!("[frpc-editor] {}", msg);
                msg
            })?
    };

    let pid = child.id();
    eprintln!("[frpc-editor] frpc spawned with PID: {}", pid);

    // Store child handle to prevent drop from killing the process
    {
        let mut guard = safe_lock(&FRPC_CHILD);
        *guard = Some(child);
    }
    {
        let mut guard = safe_lock(&FRPC_PID);
        *guard = Some(pid);
    }
    {
        let mut guard = safe_lock(&FRPC_START_TIME);
        *guard = Some(SystemTime::now());
    }

    // Give it a moment to start and check if it immediately exited
    eprintln!("[frpc-editor] Waiting 500ms to check if process stays alive...");
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

    let still_running = {
        let mut guard = safe_lock(&FRPC_CHILD);
        if let Some(ref mut child) = *guard {
            match child.try_wait() {
                Ok(None) => {
                    eprintln!("[frpc-editor] Process still running.");
                    true
                }
                Ok(Some(status)) => {
                    eprintln!("[frpc-editor] Process exited immediately with status: {:?}", status);
                    let _ = guard.take();
                    false
                }
                Err(e) => {
                    eprintln!("[frpc-editor] try_wait error: {}", e);
                    let _ = guard.take();
                    false
                }
            }
        } else {
            eprintln!("[frpc-editor] No child process found in guard.");
            false
        }
    };

    if !still_running {
        {
            let mut guard = safe_lock(&FRPC_PID);
            *guard = None;
        }
        {
            let mut guard = safe_lock(&FRPC_START_TIME);
            *guard = None;
        }
        return Err("frpc 进程启动后立即退出，请检查配置是否正确".to_string());
    }

    eprintln!("[frpc-editor] start_frpc succeeded, PID: {}", pid);
    Ok(pid)
}

#[tauri::command]
pub async fn stop_frpc(pid: u32) -> Result<(), String> {
    eprintln!("[frpc-editor] stop_frpc called for PID: {}", pid);

    // First try to kill via stored child handle
    {
        let mut guard = safe_lock(&FRPC_CHILD);
        if let Some(mut child) = guard.take() {
            eprintln!("[frpc-editor] Killing via stored child handle...");
            let _ = child.kill();
            let _ = child.wait();
        }
    }

    // Also try OS-level kill
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        eprintln!("[frpc-editor] Running taskkill /PID {} /F", pid);
        let output = std::process::Command::new("taskkill")
            .args(["/PID", &pid.to_string(), "/F"])
            .creation_flags(CREATE_NO_WINDOW)
            .output();
        match output {
            Ok(o) => eprintln!("[frpc-editor] taskkill output: {}", String::from_utf8_lossy(&o.stdout)),
            Err(e) => eprintln!("[frpc-editor] taskkill failed: {}", e),
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = std::process::Command::new("kill")
            .args(["-9", &pid.to_string()])
            .output();
    }

    {
        let mut guard = safe_lock(&FRPC_PID);
        *guard = None;
    }
    {
        let mut guard = safe_lock(&FRPC_START_TIME);
        *guard = None;
    }

    eprintln!("[frpc-editor] stop_frpc completed.");
    Ok(())
}

#[tauri::command]
pub async fn get_frpc_status() -> Result<ProcessStatus, String> {
    let pid = {
        let guard = safe_lock(&FRPC_PID);
        *guard
    };

    let start_time = {
        let guard = safe_lock(&FRPC_START_TIME);
        guard.map(|t| {
            t.duration_since(SystemTime::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs()
        })
    };

    // Check if the stored child process is still running
    let running = if let Some(p) = pid {
        let child_running = {
            let mut guard = safe_lock(&FRPC_CHILD);
            if let Some(ref mut child) = *guard {
                match child.try_wait() {
                    Ok(None) => true,
                    Ok(Some(_)) => {
                        let _ = guard.take();
                        false
                    }
                    Err(e) => {
                        eprintln!("[frpc-editor] get_frpc_status try_wait error: {}", e);
                        let _ = guard.take();
                        false
                    }
                }
            } else {
                false
            }
        };

        if !child_running {
            // Fallback to OS-level check
            #[cfg(target_os = "windows")]
            {
                use std::os::windows::process::CommandExt;
                const CREATE_NO_WINDOW: u32 = 0x08000000;

                std::process::Command::new("tasklist")
                    .args(["/FI", &format!("PID eq {}", p), "/NH"])
                    .creation_flags(CREATE_NO_WINDOW)
                    .output()
                    .map(|output| {
                        let stdout = String::from_utf8_lossy(&output.stdout);
                        stdout.contains(&p.to_string())
                    })
                    .unwrap_or(false)
            }
            #[cfg(not(target_os = "windows"))]
            {
                std::process::Command::new("ps")
                    .args(["-p", &p.to_string()])
                    .output()
                    .map(|output| output.status.success())
                    .unwrap_or(false)
            }
        } else {
            true
        }
    } else {
        false
    };

    if !running {
        {
            let mut guard = safe_lock(&FRPC_CHILD);
            let _ = guard.take();
        }
        {
            let mut guard = safe_lock(&FRPC_PID);
            *guard = None;
        }
        {
            let mut guard = safe_lock(&FRPC_START_TIME);
            *guard = None;
        }
    }

    Ok(ProcessStatus {
        running,
        pid: if running { pid } else { None },
        start_time: if running { start_time } else { None },
    })
}

#[tauri::command]
pub async fn pick_frpc_executable(app: AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;

    #[cfg(target_os = "windows")]
    let file_path = app
        .dialog()
        .file()
        .add_filter("Executable", &["exe"])
        .blocking_pick_file();

    #[cfg(not(target_os = "windows"))]
    let file_path = app.dialog().file().blocking_pick_file();

    Ok(file_path.map(|p| p.to_string()))
}
