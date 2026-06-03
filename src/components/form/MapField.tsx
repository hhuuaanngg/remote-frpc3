import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapFieldProps {
  label: string;
  value: Record<string, string> | undefined;
  onChange: (value: Record<string, string>) => void;
  description?: string;
  tooltip?: string;
  className?: string;
}

export function MapField({ label, value = {}, onChange, description, tooltip, className }: MapFieldProps) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const addEntry = () => {
    if (newKey.trim()) {
      onChange({ ...value, [newKey.trim()]: newValue });
      setNewKey("");
      setNewValue("");
    }
  };

  const removeEntry = (key: string) => {
    const updated = { ...value };
    delete updated[key];
    onChange(updated);
  };

  const updateValue = (key: string, val: string) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {tooltip && <HelpTooltip content={tooltip} />}
      </div>
      <div className="flex gap-2">
        <Input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Key"
          className="h-8 text-sm font-mono flex-1"
        />
        <Input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Value"
          className="h-8 text-sm font-mono flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addEntry();
            }
          }}
        />
        <Button type="button" variant="outline" size="sm" className="h-8 px-2" onClick={addEntry}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      {Object.entries(value).length > 0 && (
        <div className="space-y-1 mt-1.5">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="flex gap-2 items-center">
              <Input value={k} readOnly className="h-7 text-[11px] font-mono bg-muted/50 flex-1" />
              <Input
                value={v}
                onChange={(e) => updateValue(k, e.target.value)}
                className="h-7 text-[11px] font-mono flex-1"
              />
              <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeEntry(k)}>
                <X className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      )}
      {description && <p className="text-[11px] text-muted-foreground/60">{description}</p>}
    </div>
  );
}
