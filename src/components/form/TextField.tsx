import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { cn } from "@/lib/utils";

interface TextFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}

export function TextField({ label, value, onChange, placeholder, description, tooltip, disabled, className }: TextFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {tooltip && <HelpTooltip content={tooltip} />}
      </div>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="font-mono text-sm h-8"
      />
      {description && <p className="text-[11px] text-muted-foreground/60">{description}</p>}
    </div>
  );
}
