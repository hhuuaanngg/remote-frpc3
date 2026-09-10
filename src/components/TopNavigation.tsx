import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Settings, Shield, Network, Globe, FileText, Server, Users, Import, Code, Activity, Sun, Moon } from "lucide-react";

export type Section = "global" | "auth" | "transport" | "webServer" | "log" | "proxies" | "visitors" | "includes" | "rawToml" | "process";

const navGroups = [
  { label: "基础配置", items: [
    { id: "global", label: "全局配置", icon: Settings },
    { id: "auth", label: "认证配置", icon: Shield },
    { id: "transport", label: "传输配置", icon: Network },
    { id: "webServer", label: "Web 管理", icon: Globe },
    { id: "log", label: "日志配置", icon: FileText },
  ] },
  { label: "代理配置", items: [
    { id: "proxies", label: "代理映射", icon: Server },
    { id: "visitors", label: "访问端", icon: Users },
    { id: "includes", label: "Includes", icon: Import },
  ] },
  { label: "工具", items: [
    { id: "rawToml", label: "TOML 预览", icon: Code },
    { id: "process", label: "frpc 管理", icon: Activity },
  ] },
] as const;

interface TopNavigationProps {
  activeSection: Section;
  onNavigate: (section: Section) => void;
  proxyCount: number;
  visitorCount: number;
}

export function TopNavigation({ activeSection, onNavigate, proxyCount, visitorCount }: TopNavigationProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header shrink-0">
      <div className="brand-bar">
        <div className="flex items-center gap-2 min-w-0">
          <div className="brand-mark" aria-hidden="true"><Network className="h-5 w-5" /></div>
          <div className="flex items-baseline gap-3">
            <h1 className="brand-title">frpc-editor</h1>
            <span className="hidden sm:inline text-xs text-muted-foreground">配置编辑器</span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline text-[11px] font-mono text-muted-foreground">v0.1.0 · frp v0.60+</span>
          <button type="button" onClick={toggleTheme} className="theme-toggle" aria-label={theme === "dark" ? "切换到亮色模式" : "切换到暗色模式"}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{theme === "dark" ? "亮色模式" : "暗色模式"}</span>
          </button>
        </div>
      </div>
      <nav aria-label="主导航" className="top-nav">
        {navGroups.map((group) => (
          <div key={group.label} role="group" aria-label={group.label} className="nav-group">
            {group.items.map((item) => {
              const active = activeSection === item.id;
              const count = item.id === "proxies" ? proxyCount : item.id === "visitors" ? visitorCount : null;
              const Icon = item.icon;
              return (
                <button key={item.id} type="button" aria-current={active ? "page" : undefined}
                  onClick={() => onNavigate(item.id)}
                  onFocus={(event) => event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" })}
                  className={cn("nav-button", active && "nav-button-active")}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                  {count !== null && count > 0 && <span className="nav-count">{count}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </header>
  );
}
