import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Server } from "lucide-react";
import { useConfigStore } from "@/store/configStore";
import type { ProxyConfig } from "@/types/frpc";
import { proxyTypeColor } from "@/lib/utils";
import { ProxyDrawer } from "./ProxyDrawer";

export function ProxyList() {
  const { config, addProxy, updateProxy, removeProxy, moveProxy } = useConfigStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const proxies = config.proxies || [];

  const handleAdd = () => {
    setEditingIndex(null);
    setDrawerOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setDrawerOpen(true);
  };

  const handleSave = (proxy: ProxyConfig) => {
    if (editingIndex !== null) {
      updateProxy(editingIndex, proxy);
    } else {
      addProxy(proxy);
    }
  };

  const handleDelete = () => {
    if (editingIndex !== null) {
      removeProxy(editingIndex);
      setDrawerOpen(false);
    }
  };

  const handleToggleEnabled = (index: number) => {
    const proxy = proxies[index];
    updateProxy(index, { ...proxy, enabled: proxy.enabled !== false ? false : true });
  };

  const getProxySummary = (proxy: ProxyConfig) => {
    const parts: string[] = [];
    if (proxy.localIP || proxy.localPort) {
      parts.push(`${proxy.localIP || "?"}:${proxy.localPort || "?"}`);
    }
    if (proxy.remotePort !== undefined && ["tcp", "udp"].includes(proxy.type)) {
      parts.push(`→ remote:${proxy.remotePort}`);
    }
    if (proxy.subdomain) {
      parts.push(`→ ${proxy.subdomain}`);
    }
    if (proxy.customDomains && proxy.customDomains.length > 0) {
      parts.push(`→ ${proxy.customDomains[0]}${proxy.customDomains.length > 1 ? " +" + (proxy.customDomains.length - 1) : ""}`);
    }
    if (proxy.secretKey) {
      parts.push(`🔒 ${proxy.secretKey.substring(0, 8)}...`);
    }
    return parts.join("  ");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">代理映射</h2>
          <p className="text-sm text-muted-foreground mt-1">
            配置 frpc 的代理规则，共 {proxies.length} 个代理
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-1.5">
          <Plus className="h-4 w-4" />
          新建代理
        </Button>
      </div>

      {proxies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/50 rounded-lg">
          <Server className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">暂无代理配置</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            点击「新建代理」添加第一个代理规则
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {proxies.map((proxy, index) => (
            <motion.div
              key={`${proxy.name}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="group flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-card/40 hover:bg-card/80 hover:border-border/60 transition-all"
            >
              {/* Order controls */}
              <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => index > 0 && moveProxy(index, index - 1)}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={index === 0}
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => index < proxies.length - 1 && moveProxy(index, index + 1)}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={index === proxies.length - 1}
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>

              {/* Type badge */}
              <Badge variant="outline" className={proxyTypeColor(proxy.type)}>
                {proxy.type}
              </Badge>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">{proxy.name}</span>
                  {proxy.enabled === false && (
                    <Badge variant="secondary" className="text-[10px]">已禁用</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                  {getProxySummary(proxy)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={proxy.enabled !== false}
                  onCheckedChange={() => handleToggleEnabled(index)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleEdit(index)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeProxy(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ProxyDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        proxy={editingIndex !== null ? proxies[editingIndex] : undefined}
        onSave={handleSave}
        onDelete={editingIndex !== null ? handleDelete : undefined}
      />
    </div>
  );
}
