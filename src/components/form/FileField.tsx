import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { open } from "@tauri-apps/plugin-dialog";

interface FileFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  description?: string;
  tooltip?: string;
  filters?: { name: string; extensions: string[] }[];
  className?: string;
}

export function FileField({ label, value, onChange, description, tooltip, filters, className }: FileFieldProps) {
  const handlePickFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters,
      });
      if (selected && typeof selected === "string") {
        onChange(selected);
      }
    } catch (e) {
      console.error("Failed to pick file:", e);
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {tooltip && <HelpTooltip content={tooltip} />}
      </div>
      <div className="flex gap-2">
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="文件路径..."
          className="font-mono text-sm h-8 flex-1"
        />
        <Button type="button" variant="outline" size="sm" className="h-8 px-2" onClick={handlePickFile}>
          <FolderOpen className="h-3.5 w-3.5" />
        </Button>
      </div>
      {description && <p className="text-[11px] text-muted-foreground/60">{description}</p>}
    </div>
  );
}
