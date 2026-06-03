import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { cn } from "@/lib/utils";

interface NumberFieldProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  description?: string;
  tooltip?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function NumberField({ label, value, onChange, placeholder, description, tooltip, min, max, disabled, className }: NumberFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {tooltip && <HelpTooltip content={tooltip} />}
      </div>
      <Input
        type="number"
        value={value ?? ""}
        onChange={(e) => {
          const val = e.target.value === "" ? undefined : Number(e.target.value);
          onChange(val);
        }}
        placeholder={placeholder}
        min={min}
        max={max}
        disabled={disabled}
        className="font-mono text-sm h-8"
      />
      {description && <p className="text-[11px] text-muted-foreground/60">{description}</p>}
    </div>
  );
}
