import { useState, useEffect, useRef } from "react";
import { TopNavigation, type Section } from "@/components/TopNavigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/hooks/useTheme";
import { useConfigStore } from "@/store/configStore";
import { GlobalConfig } from "@/sections/GlobalConfig";
import { AuthConfig } from "@/sections/AuthConfig";
import { TransportConfig } from "@/sections/TransportConfig";
import { WebServerConfig } from "@/sections/WebServerConfig";
import { LogConfig } from "@/sections/LogConfig";
import { ProxyList } from "@/sections/proxies/ProxyList";
import { VisitorList } from "@/sections/visitors/VisitorList";
import { IncludesConfig } from "@/sections/IncludesConfig";
import { RawToml } from "@/sections/RawToml";
import { ProcessManager } from "@/sections/ProcessManager";

function App() {
  const [activeSection, setActiveSection] = useState<Section>("global");
  const { config, lastSavedPath, loadFromDisk } = useConfigStore();
  const autoStartFrpcInFlightRef = useRef(false);

  // Auto-load config from disk on app start
  useEffect(() => {
    loadFromDisk();
  }, [loadFromDisk]);

  // Listen for tray menu events and auto-start-frpc event
  useEffect(() => {
    let cancelled = false;
    const unlisteners: (() => void)[] = [];
    const addUnlistener = (unlisten: () => void) => {
      if (cancelled) {
        unlisten();
      } else {
        unlisteners.push(unlisten);
      }
    };

    async function setupEventListeners() {
      try {
        const { listen } = await import("@tauri-apps/api/event");

        // Auto-start frpc on boot if configured
        const unlistenAuto = await listen("auto-start-frpc", async () => {
          if (autoStartFrpcInFlightRef.current) return;

          const store = useConfigStore.getState();
          if (!store.settings.autoLaunchWithFrpc) return;

          autoStartFrpcInFlightRef.current = true;
          try {
            await store.loadFromDisk();

            const { invoke } = await import("@tauri-apps/api/core");
            const latestSettings = useConfigStore.getState().settings;
            const frpcPath = latestSettings.frpcPath;
            const userPath = latestSettings.configPath || null;

            if (!frpcPath) {
              console.warn("[frpc-editor] auto-start-frpc skipped: frpc.exe path is not set");
              return;
            }

            const status = await invoke<{ running: boolean }>("get_frpc_status");
            if (status.running) return;

            const configPath = await invoke<string>("resolve_config_path", { userPath });
            await invoke<number>("start_frpc", { frpcPath, configPath });
            window.dispatchEvent(new CustomEvent("frpc-status-changed"));
          } catch (e) {
            console.error("[frpc-editor] auto-start-frpc failed:", e);
          } finally {
            autoStartFrpcInFlightRef.current = false;
          }
        });
        addUnlistener(unlistenAuto);

        // Tray menu: start frpc
        const unlistenTrayStart = await listen("tray-start-frpc", () => {
          window.dispatchEvent(new CustomEvent("tray-start-frpc"));
        });
        addUnlistener(unlistenTrayStart);

        // Tray menu: stop frpc
        const unlistenTrayStop = await listen("tray-stop-frpc", () => {
          window.dispatchEvent(new CustomEvent("tray-stop-frpc"));
        });
        addUnlistener(unlistenTrayStop);
      } catch {
        // Not in Tauri environment
      }
    }

    setupEventListeners();

    return () => {
      cancelled = true;
      unlisteners.forEach((fn) => fn());
    };
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case "global": return <GlobalConfig />;
      case "auth": return <AuthConfig />;
      case "transport": return <TransportConfig />;
      case "webServer": return <WebServerConfig />;
      case "log": return <LogConfig />;
      case "proxies": return <ProxyList />;
      case "visitors": return <VisitorList />;
      case "includes": return <IncludesConfig />;
      case "rawToml": return <RawToml />;
      case "process": return <ProcessManager />;
      default: return <GlobalConfig />;
    }
  };

  return (
    <div className="app-shell flex h-dvh flex-col bg-background overflow-hidden">
      <TopNavigation
        activeSection={activeSection}
        onNavigate={setActiveSection}
        proxyCount={config.proxies?.length || 0}
        visitorCount={config.visitors?.length || 0}
      />
      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        <ScrollArea key={activeSection} className="flex-1 min-h-0">
          <div className="workspace-content">
            {renderContent()}
          </div>
        </ScrollArea>
      </main>
      <footer className="desktop-statusbar">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0">工作文件:</span>
          <span className="font-mono truncate" title={lastSavedPath || undefined}>{lastSavedPath || "未加载文件"}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {lastSavedPath && <AutoSaveIndicator />}
          <span>代理 {config.proxies?.length || 0} · 访问端 {config.visitors?.length || 0}</span>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

function AutoSaveIndicator() {
  const { isDirty, saveToDisk } = useConfigStore();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const path = await saveToDisk();
    setSaving(false);
    if (path) {
      // toast is handled by the caller or silently saved
    }
  };

  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 2000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);

  return (
    <div className="flex items-center gap-2 shrink-0">
      {isDirty ? (
        <span className="text-[10px] text-amber-700 dark:text-amber-300">未保存</span>
      ) : saving ? (
        <span className="text-[10px] text-muted-foreground">保存中...</span>
      ) : (
        <span className="text-[10px] text-emerald-700 dark:text-emerald-300">已保存</span>
      )}
    </div>
  );
}

export default function AppWithProvider() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
