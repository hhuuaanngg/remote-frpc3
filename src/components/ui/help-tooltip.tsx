import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTooltipProps {
  content: string;
}

export function HelpTooltip({ content }: HelpTooltipProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-3 w-3 text-muted-foreground/40 hover:text-muted-foreground cursor-help shrink-0" />
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[320px] leading-relaxed">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
