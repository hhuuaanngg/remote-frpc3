mod commands;

use commands::autostart::{disable_autostart, enable_autostart, get_autostart_status};
use commands::file::{
    get_default_config_path, load_app_config, pick_config_file, read_config_file,
    resolve_config_path, save_app_config, save_config_dialog, write_config_file,
};
use commands::process::{get_frpc_status, pick_frpc_executable, start_frpc, stop_frpc};
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, WindowEvent,
};

#[tauri::command]
fn exit_app(app: AppHandle) {
    eprintln!("[frpc-editor] exit_app: stopping frpc before exit...");
    commands::process::kill_frpc_sync();
    app.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_autostart::Builder::new()
                .arg("--auto-start-frpc")
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Check startup args for auto-start-frpc flag
            let args: Vec<String> = std::env::args().collect();
            let auto_start_frpc = args.contains(&"--auto-start-frpc".to_string());
            if auto_start_frpc {
                let app_handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    // Wait for app to fully initialize before notifying frontend
                    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
                    let _ = app_handle.emit("auto-start-frpc", ());
                });
            }

            // Create system tray icon and menu
            let show_i = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
            let start_frpc_i = MenuItem::with_id(app, "start_frpc", "启动 frpc", true, None::<&str>)?;
            let stop_frpc_i = MenuItem::with_id(app, "stop_frpc", "停止 frpc", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;
            let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let menu = Menu::with_items(
                app,
                &[&show_i, &separator, &start_frpc_i, &stop_frpc_i, &separator, &quit_i],
            )?;

            // Close button behavior:
            // - if frpc is running, keep it alive and hide the window to the tray
            // - if frpc is not running, close the whole app
            let window = app.get_webview_window("main").unwrap();
            let app_handle = app.handle().clone();
            window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    if commands::process::is_frpc_running_sync() {
                        api.prevent_close();
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = window.hide();
                        }
                    } else {
                        commands::process::kill_frpc_sync();
                        app_handle.exit(0);
                    }
                }
            });

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("frpc-editor")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.unminimize();
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "start_frpc" => {
                        let _ = app.emit("tray-start-frpc", ());
                    }
                    "stop_frpc" => {
                        let _ = app.emit("tray-stop-frpc", ());
                    }
                    "quit" => {
                        eprintln!("[frpc-editor] tray quit: stopping frpc before exit...");
                        commands::process::kill_frpc_sync();
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } => {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.unminimize();
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            read_config_file,
            write_config_file,
            pick_config_file,
            save_config_dialog,
            get_default_config_path,
            resolve_config_path,
            load_app_config,
            save_app_config,
            start_frpc,
            stop_frpc,
            get_frpc_status,
            pick_frpc_executable,
            get_autostart_status,
            enable_autostart,
            disable_autostart,
            exit_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
