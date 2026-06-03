import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SwitchField } from "@/components/form/SwitchField";
import { Play, Square, FolderOpen, FileText, RotateCw, Trash2 } from "lucide-react";
import { useConfigStore } from "@/store/configStore";
import { toast } from "sonner";

let invokeFn: typeof import("@tauri-apps/api/core").invoke | null = null;
async function getInvoke() {
  if (!invokeFn) {
    try {
      const tauri = await import("@tauri-apps/api/core");
      invokeFn = tauri.invoke;
    } catch {
      return null;
    }
  }
  return invokeFn;
}

interface ProcessStatus {
  running: boolean;
  pid: number | null;
  start_time: number | null;
}

export function ProcessManager() {
  const { rawToml, settings, setFrpcPath, setConfigPath, setAutoLaunch, setAutoLaunchWithFrpc } = useConfigStore();
  const frpcPath = settings.frpcPath;
  const configPath = settings.configPath;
  const [status, setStatus] = useState<ProcessStatus>({ running: false, pid: null, start_time: null });
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSavePath, setAutoSavePath] = useState<string>("");
  const logEndRef = useRef<HTMLDivElement>(null);
  const statusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusRef = useRef(status);
  const isStartingRef = useRef(false);
  const isStoppingRef = useRef(false);

  const addLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  }, []);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const checkStatus = useCallback(async () => {
    const inv = await getInvoke();
    if (!inv) return;
    try {
      const result = await inv<ProcessStatus>("get_frpc_status");
      setStatus((prev) => {
        if (prev.running && !result.running) {
          addLog("frpc 进程已退出");
        }
        return result;
      });
    } catch {
      // Ignore errors
    }
  }, [addLog]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Poll status when running
  useEffect(() => {
    if (status.running) {
      statusIntervalRef.current = setInterval(() => {
        checkStatus();
      }, 2000);
    } else {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
    }
    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, [status.running, checkStatus]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Listen for tray events
  useEffect(() => {
    const onTrayStart = () => {
      if (!statusRef.current.running && !isStartingRef.current) {
        addLog("托盘菜单：启动 frpc");
        handleStart();
      }
    };
    const onTrayStop = () => {
      if (statusRef.current.running && statusRef.current.pid && !isStoppingRef.current) {
        addLog("托盘菜单：停止 frpc");
        handleStop();
      }
    };

    window.addEventListener("tray-start-frpc", onTrayStart);
    window.addEventListener("tray-stop-frpc", onTrayStop);
    window.addEventListener("frpc-status-changed", checkStatus);

    return () => {
      window.removeEventListener("tray-start-frpc", onTrayStart);
      window.removeEventListener("tray-stop-frpc", onTrayStop);
      window.removeEventListener("frpc-status-changed", checkStatus);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.running, status.pid, frpcPath, configPath, rawToml, addLog, checkStatus]);

  const pickFrpcPath = async () => {
    const inv = await getInvoke();
    if (!inv) {
      toast.error("Tauri API 不可用");
      return;
    }
    try {
      const result = await inv<string | null>("pick_frpc_executable");
      if (result) {
        setFrpcPath(result);
        addLog(`frpc.exe 路径已设置: ${result}`);
      }
    } catch (e) {
      toast.error(`选择失败: ${e}`);
    }
  };

  const pickConfigPath = async () => {
    const inv = await getInvoke();
    if (!inv) {
      toast.error("Tauri API 不可用");
      return;
    }
    try {
      const result = await inv<string | null>("pick_config_file");
      if (result) {
        setConfigPath(result);
        addLog(`配置文件路径已设置: ${result}`);
      }
    } catch (e) {
      toast.error(`选择失败: ${e}`);
    }
  };

  const saveTempConfig = async (): Promise<string | null> => {
    const inv = await getInvoke();
    if (!inv) {
      toast.error("Tauri API 不可用");
      return null;
    }
    try {
      const result = await inv<string | null>("save_config_dialog", {
        content: rawToml,
      });
      if (result) {
        setConfigPath(result);
        setAutoSavePath(result);
        addLog(`配置已保存到: ${result}`);
        return result;
      }
    } catch (e) {
      toast.error(`保存失败: ${e}`);
    }
    return null;
  };

  const handleStart = async () => {
    if (isStartingRef.current || statusRef.current.running) {
      return;
    }
    isStartingRef.current = true;

    try {
      const inv = await getInvoke();
      if (!inv) {
        toast.error("Tauri API 不可用");
        return;
      }
      if (!frpcPath) {
        toast.error("请先选择 frpc.exe 路径");
        return;
      }

      let actualConfigPath = configPath;

      // If no config path, save to temp file first
      if (!actualConfigPath) {
        addLog("未设置配置文件路径，正在保存...");
        actualConfigPath = await saveTempConfig() || "";
        if (!actualConfigPath) {
          toast.error("保存配置失败，无法启动");
          return;
        }
      }

      setIsLoading(true);
      addLog(`正在启动 frpc...`);
      addLog(`  exe: ${frpcPath}`);
      addLog(`  config: ${actualConfigPath}`);
      const pid = await inv<number>("start_frpc", {
        frpcPath,
        configPath: actualConfigPath,
      });
      const nextStatus = { running: true, pid, start_time: Date.now() / 1000 };
      statusRef.current = nextStatus;
      setStatus(nextStatus);
      addLog(`frpc 已启动，PID: ${pid}`);
      toast.success(`frpc 已启动，PID: ${pid}`);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      addLog(`启动失败: ${errMsg}`);
      toast.error(`启动失败: ${errMsg}`);
      const nextStatus = { running: false, pid: null, start_time: null };
      statusRef.current = nextStatus;
      setStatus(nextStatus);
    } finally {
      isStartingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    if (isStoppingRef.current || !statusRef.current.running || !statusRef.current.pid) {
      return;
    }
    isStoppingRef.current = true;

    try {
      const inv = await getInvoke();
      if (!inv) {
        toast.error("Tauri API 不可用");
        return;
      }
      const pid = statusRef.current.pid;
      if (!pid) return;

      setIsLoading(true);
      await inv("stop_frpc", { pid });
      const nextStatus = { running: false, pid: null, start_time: null };
      statusRef.current = nextStatus;
      setStatus(nextStatus);
      addLog("frpc 已停止");
      toast.success("frpc 已停止");
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      addLog(`停止失败: ${errMsg}`);
      toast.error(`停止失败: ${errMsg}`);
    } finally {
      isStoppingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    const inv = await getInvoke();
    if (!inv) {
      toast.error("Tauri API 不可用");
      return;
    }
    try {
      const result = await inv<string | null>("save_config_dialog", {
        content: rawToml,
      });
      if (result) {
        setConfigPath(result);
        setAutoSavePath(result);
        addLog(`配置已保存到: ${result}`);
        toast.success(`配置已保存到 ${result}`);
      }
    } catch (e) {
      toast.error(`保存失败: ${e}`);
    }
  };

  const clearAutoSave = () => {
    if (autoSavePath && configPath === autoSavePath) {
      setConfigPath("");
    }
    setAutoSavePath("");
  };

  // Autostart toggle
  const handleAutoLaunchChange = async (enabled: boolean) => {
    const inv = await getInvoke();
    if (!inv) {
      toast.error("Tauri API 不可用");
      return;
    }
    try {
      if (enabled) {
        await inv("enable_autostart", { autoStartFrpc: settings.autoLaunchWithFrpc });
      } else {
        await inv("disable_autostart");
      }
      setAutoLaunch(enabled);
      toast.success(enabled ? "已启用开机自动启动" : "已禁用开机自动启动");
    } catch (e) {
      toast.error(`设置失败: ${e}`);
    }
  };

  const handleAutoLaunchWithFrpcChange = async (enabled: boolean) => {
    setAutoLaunchWithFrpc(enabled);
    // Starting frpc on boot requires the editor itself to be launched by the OS.
    if (enabled && !settings.autoLaunch) {
      const inv = await getInvoke();
      if (inv) {
        try {
          await inv("enable_autostart", { autoStartFrpc: enabled });
          setAutoLaunch(true);
        } catch (e) {
          toast.error(`更新设置失败: ${e}`);
        }
      }
    }
  };

  // Sync autostart status on mount
  useEffect(() => {
    async function syncStatus() {
      const inv = await getInvoke();
      if (!inv) return;
      try {
        const enabled = await inv<boolean>("get_autostart_status");
        if (enabled !== settings.autoLaunch) {
          setAutoLaunch(enabled);
        }
      } catch {
        // Ignore
      }
    }
    syncStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">frpc 程序管理</h2>
        <p className="text-sm text-muted-foreground mt-1">
          启动和管理本地 frpc 客户端进程
        </p>
      </div>

      {/* Status */}
      <div className="rounded-lg border border-border/50 p-4 flex items-center gap-4">
        <div className={`w-3 h-3 rounded-full ${status.running ? "bg-emerald-500 animate-pulse" : "bg-muted"}`} />
        <div className="flex-1">
          <p className="text-sm font-medium">
            {status.running ? "运行中" : "已停止"}
          </p>
          {status.pid && (
            <p className="text-xs text-muted-foreground font-mono">
              PID: {status.pid}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={checkStatus}
          className="gap-1.5"
        >
          <RotateCw className="h-3.5 w-3.5" />
          刷新
        </Button>
        {status.running ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleStop}
            disabled={isLoading}
            className="gap-1.5"
          >
            <Square className="h-3.5 w-3.5" />
            停止
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleStart}
            disabled={isLoading || !frpcPath}
            className="gap-1.5"
          >
            <Play className="h-3.5 w-3.5" />
            启动
          </Button>
        )}
      </div>

      {/* Paths */}
      <div className="rounded-lg border border-border/50 p-4 space-y-3">
        <h3 className="text-sm font-semibold">路径配置</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20 shrink-0">frpc.exe</span>
            <Input
              value={frpcPath}
              onChange={(e) => setFrpcPath(e.target.value)}
              placeholder="frpc.exe 路径..."
              className="h-8 text-xs font-mono flex-1"
            />
            <Button variant="outline" size="sm" className="h-8 px-2" onClick={pickFrpcPath}>
              <FolderOpen className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20 shrink-0">配置文件</span>
            <Input
              value={configPath}
              onChange={(e) => setConfigPath(e.target.value)}
              placeholder="frpc.toml 路径..."
              className="h-8 text-xs font-mono flex-1"
            />
            <Button variant="outline" size="sm" className="h-8 px-2" onClick={pickConfigPath}>
              <FileText className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-2" onClick={handleSaveConfig}>
              保存
            </Button>
            {autoSavePath && configPath === autoSavePath && (
              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={clearAutoSave} title="清除自动保存">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          {autoSavePath && configPath === autoSavePath && (
            <p className="text-[10px] text-muted-foreground/60 ml-20">
              此配置为自动保存的临时文件
            </p>
          )}
        </div>
      </div>

      {/* Autostart Settings */}
      <div className="rounded-lg border border-border/50 p-4 space-y-3">
        <h3 className="text-sm font-semibold">启动设置</h3>
        <div className="space-y-1">
          <SwitchField
            label="开机自动启动 frpc-editor"
            checked={settings.autoLaunch}
            onChange={handleAutoLaunchChange}
          />
          <SwitchField
            label="开机时自动启动 frpc"
            checked={settings.autoLaunchWithFrpc}
            onChange={handleAutoLaunchWithFrpcChange}
          />
        </div>
      </div>

      {/* Logs */}
      <div className="rounded-lg border border-border/50 flex flex-col" style={{ height: "calc(100vh - 520px)" }}>
        <div className="px-4 py-2 border-b border-border/30 flex items-center justify-between">
          <h3 className="text-sm font-semibold">日志输出</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => setLogs([])}
          >
            清空
          </Button>
        </div>
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-1 font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-muted-foreground/40">暂无日志...</p>
            ) : (
              logs.map((log, i) => (
                <p key={i} className="text-muted-foreground">
                  {log}
                </p>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
