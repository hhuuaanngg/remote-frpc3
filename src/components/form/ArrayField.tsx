import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArrayFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  description?: string;
  tooltip?: string;
  className?: string;
}

export function ArrayField({ label, values = [], onChange, description, tooltip, className }: ArrayFieldProps) {
  const [inputValue, setInputValue] = useState("");

  const addValue = () => {
    if (inputValue.trim() && !values.includes(inputValue.trim())) {
      onChange([...values, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeValue = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {tooltip && <HelpTooltip content={tooltip} />}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addValue();
            }
          }}
          placeholder="输入后按回车添加..."
          className="h-8 text-sm font-mono"
        />
        <Button type="button" variant="outline" size="sm" className="h-8 px-2" onClick={addValue}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {values.map((v, i) => (
            <Badge key={`${v}-${i}`} variant="secondary" className="font-mono text-[11px] gap-1">
              {v}
              <button onClick={() => removeValue(i)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {description && <p className="text-[11px] text-muted-foreground/60">{description}</p>}
    </div>
  );
}
