import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Shield,
  Network,
  Globe,
  FileText,
  Server,
  Users,
  Import,
  Code,
  Activity,
  HardDrive,
  Sun,
  Moon,
} from "lucide-react";

export type Section =
  | "global"
  | "auth"
  | "transport"
  | "webServer"
  | "log"
  | "proxies"
  | "visitors"
  | "includes"
  | "rawToml"
  | "process";

interface NavItem {
  id: Section;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: "global", label: "全局配置", icon: <Settings className="h-4 w-4" /> },
  { id: "auth", label: "认证配置", icon: <Shield className="h-4 w-4" /> },
  { id: "transport", label: "传输配置", icon: <Network className="h-4 w-4" /> },
  { id: "webServer", label: "Web 管理", icon: <Globe className="h-4 w-4" /> },
  { id: "log", label: "日志配置", icon: <FileText className="h-4 w-4" /> },
];

const proxyItems: NavItem[] = [
  { id: "proxies", label: "代理映射", icon: <Server className="h-4 w-4" /> },
  { id: "visitors", label: "访问端", icon: <Users className="h-4 w-4" /> },
  { id: "includes", label: "Includes", icon: <Import className="h-4 w-4" /> },
];

const toolItems: NavItem[] = [
  { id: "rawToml", label: "TOML 预览", icon: <Code className="h-4 w-4" /> },
  { id: "process", label: "frpc 管理", icon: <Activity className="h-4 w-4" /> },
];

interface SidebarProps {
  activeSection: Section;
  onNavigate: (section: Section) => void;
  proxyCount: number;
  visitorCount: number;
}

export function Sidebar({ activeSection, onNavigate, proxyCount, visitorCount }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  const renderNavItem = (item: NavItem) => {
    const isActive = activeSection === item.id;
    const count = item.id === "proxies" ? proxyCount : item.id === "visitors" ? visitorCount : null;

    return (
      <button
        key={item.id}
        onClick={() => onNavigate(item.id)}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 group",
          isActive
            ? "bg-primary/10 text-primary border-l-2 border-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-l-2 border-transparent"
        )}
      >
        <span className={cn("transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
          {item.icon}
        </span>
        <span className="flex-1 text-left">{item.label}</span>
        {count !== null && count > 0 && (
          <span className={cn(
            "text-[10px] font-mono px-1.5 py-0.5 rounded-full",
            isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-[200px] min-w-[200px] h-screen bg-background border-r border-border/50 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center">
          <HardDrive className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground tracking-tight">frpc-editor</h1>
          <p className="text-[10px] text-muted-foreground font-mono">v0.1.0</p>
        </div>
      </div>

      <Separator className="bg-border/30 mx-3 w-auto" />

      <ScrollArea className="flex-1 px-2 py-3">
        <div className="space-y-0.5">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
            基础配置
          </p>
          {navItems.map(renderNavItem)}
        </div>

        <div className="mt-4 space-y-0.5">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
            代理配置
          </p>
          {proxyItems.map(renderNavItem)}
        </div>

        <div className="mt-4 space-y-0.5">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
            工具
          </p>
          {toolItems.map(renderNavItem)}
        </div>
      </ScrollArea>

      <div className="px-2 py-2 border-t border-border/30">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-150"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="flex-1 text-left">{theme === "dark" ? "亮色模式" : "暗色模式"}</span>
        </button>
        <p className="text-[10px] text-muted-foreground/40 text-center font-mono mt-2">
          frp v0.60+
        </p>
      </div>
    </aside>
  );
}
