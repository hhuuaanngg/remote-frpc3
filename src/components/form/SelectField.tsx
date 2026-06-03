import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string | undefined;
  options: SelectOption[];
  onChange: (value: string) => void;
  description?: string;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}

export function SelectField({ label, value, options, onChange, description, tooltip, disabled, className }: SelectFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {tooltip && <HelpTooltip content={tooltip} />}
      </div>
      <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder="选择..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <p className="text-[11px] text-muted-foreground/60">{description}</p>}
    </div>
  );
}
