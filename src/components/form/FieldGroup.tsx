import { cn } from "@/lib/utils";

interface FieldGroupProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
  columns?: 1 | 2 | 3;
}

export function FieldGroup({ title, children, className, description, columns = 2 }: FieldGroupProps) {
  return (
    <div className={cn("field-group", className)}>
      <div className="field-group-heading">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      <div className={cn("form-fields", `form-fields-${columns}`)}>
        {children}
      </div>
    </div>
  );
}
