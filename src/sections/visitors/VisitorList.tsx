import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Users } from "lucide-react";
import { useConfigStore } from "@/store/configStore";
import type { VisitorConfig } from "@/types/frpc";
import { visitorTypeColor } from "@/lib/utils";
import { VisitorDrawer } from "./VisitorDrawer";

export function VisitorList() {
  const { config, addVisitor, updateVisitor, removeVisitor, moveVisitor } = useConfigStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const visitors = config.visitors || [];

  const handleAdd = () => {
    setEditingIndex(null);
    setDrawerOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setDrawerOpen(true);
  };

  const handleSave = (visitor: VisitorConfig) => {
    if (editingIndex !== null) {
      updateVisitor(editingIndex, visitor);
    } else {
      addVisitor(visitor);
    }
  };

  const handleDelete = () => {
    if (editingIndex !== null) {
      removeVisitor(editingIndex);
      setDrawerOpen(false);
    }
  };

  const getVisitorSummary = (visitor: VisitorConfig) => {
    const parts: string[] = [];
    if (visitor.serverName) {
      parts.push(`→ ${visitor.serverName}`);
    }
    if (visitor.bindAddr || visitor.bindPort !== undefined) {
      parts.push(`bind: ${visitor.bindAddr || "127.0.0.1"}:${visitor.bindPort ?? "?"}`);
    }
    if (visitor.keepTunnelOpen) {
      parts.push("tunnel open");
    }
    return parts.join("  ");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">访问端配置</h2>
          <p className="text-sm text-muted-foreground mt-1">
            配置 frpc 的访问端规则，共 {visitors.length} 个访问端
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-1.5">
          <Plus className="h-4 w-4" />
          新建访问端
        </Button>
      </div>

      {visitors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/50 rounded-lg">
          <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">暂无访问端配置</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            点击「新建访问端」添加第一个访问端规则
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visitors.map((visitor, index) => (
            <motion.div
              key={`${visitor.name}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="group flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-card/40 hover:bg-card/80 hover:border-border/60 transition-all"
            >
              <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => index > 0 && moveVisitor(index, index - 1)}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={index === 0}
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => index < visitors.length - 1 && moveVisitor(index, index + 1)}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={index === visitors.length - 1}
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>

              <Badge variant="outline" className={visitorTypeColor(visitor.type)}>
                {visitor.type}
              </Badge>

              <div className="flex-1 min-w-0">
                <span className="font-mono text-sm font-medium">{visitor.name}</span>
                <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                  {getVisitorSummary(visitor)}
                </p>
              </div>

              <div className="flex items-center gap-2">
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
                  onClick={() => removeVisitor(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <VisitorDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        visitor={editingIndex !== null ? visitors[editingIndex] : undefined}
        onSave={handleSave}
        onDelete={editingIndex !== null ? handleDelete : undefined}
      />
    </div>
  );
}
