import { useRef } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, FileUp, CheckCircle, AlertCircle } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
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

export function RawToml() {
  const { rawToml, validationErrors, loadFromToml } = useConfigStore();
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawToml);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  const handleExport = async () => {
    const invoke = await getInvoke();
    if (!invoke) {
      toast.error("Tauri API 不可用");
      return;
    }
    try {
      const result = await invoke<string | null>("save_config_dialog", {
        content: rawToml,
      });
      if (result) {
        toast.success(`已保存到 ${result}`);
      }
    } catch (e) {
      toast.error(`保存失败: ${e}`);
    }
  };

  const handleImport = async () => {
    const invoke = await getInvoke();
    if (!invoke) {
      toast.error("Tauri API 不可用");
      return;
    }
    try {
      const result = await invoke<string | null>("pick_config_file");
      if (result) {
        const content = await invoke<string>("read_config_file", { path: result });
        loadFromToml(content);
        toast.success("配置已加载");
      }
    } catch (e) {
      toast.error(`加载失败: ${e}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">原始 TOML 预览</h2>
          <p className="text-sm text-muted-foreground mt-1">
            实时预览生成的 frpc.toml 配置文件
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleImport} className="gap-1.5">
            <FileUp className="h-3.5 w-3.5" />
            导入
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            复制
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            导出
          </Button>
        </div>
      </div>

      {/* Validation status */}
      <div className="flex items-center gap-2">
        {validationErrors.length === 0 ? (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1">
            <CheckCircle className="h-3 w-3" />
            配置有效
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
            <AlertCircle className="h-3 w-3" />
            {validationErrors.length} 个错误
          </Badge>
        )}
      </div>

      {validationErrors.length > 0 && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-1">
          {validationErrors.map((err, i) => (
            <p key={i} className="text-xs text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {err}
            </p>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-border/50 overflow-hidden" style={{ height: "calc(100vh - 280px)" }}>
        <Editor
          height="100%"
          language="ini"
          value={rawToml}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16 },
            theme: theme === "dark" ? "vs-dark" : "vs",
          }}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-background text-muted-foreground text-sm">
              加载编辑器...
            </div>
          }
        />
      </div>
    </div>
  );
}
