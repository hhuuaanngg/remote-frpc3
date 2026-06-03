import { cn } from "@/lib/utils";

interface FieldGroupProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export function FieldGroup({ title, children, className, description }: FieldGroupProps) {
  return (
    <div className={cn("rounded-lg border border-border/50 bg-card/50 p-4 space-y-4", className)}>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-[11px] text-muted-foreground/60 mt-0.5">{description}</p>}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
