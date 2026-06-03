import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { cn } from "@/lib/utils";

interface SwitchFieldProps {
  label: string;
  checked: boolean | undefined;
  onChange: (checked: boolean) => void;
  description?: string;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}

export function SwitchField({ label, checked, onChange, description, tooltip, disabled, className }: SwitchFieldProps) {
  return (
    <div className={cn("flex items-center justify-between py-2", className)}>
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
          {tooltip && <HelpTooltip content={tooltip} />}
        </div>
        {description && <p className="text-[11px] text-muted-foreground/60">{description}</p>}
      </div>
      <Switch checked={checked ?? false} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
