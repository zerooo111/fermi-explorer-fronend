import { format } from "date-fns";
import { cn } from "@/shared/lib/utils";
import { AnimatedNumber } from "@/shared/components/ui/animated-number";

interface LastUpdatedProps {
  timestamp: number | Date;
  className?: string;
}

export function LastUpdated({ timestamp, className }: LastUpdatedProps) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className="text-xs sm:text-sm text-muted-foreground">Last updated</span>
      <span className="text-xs sm:text-sm text-muted-foreground font-mono font-medium">
        <span className="hidden sm:inline">{format(date, "MM/dd/yyyy")} </span>
        <AnimatedNumber
          value={Number(format(date, "HH"))}
          format={{ minimumIntegerDigits: 2, maximumFractionDigits: 0 }}
          duration={450}
        />
        :
        <AnimatedNumber
          value={Number(format(date, "mm"))}
          format={{ minimumIntegerDigits: 2, maximumFractionDigits: 0 }}
          duration={450}
        />
        :
        <AnimatedNumber
          value={Number(format(date, "ss"))}
          format={{ minimumIntegerDigits: 2, maximumFractionDigits: 0 }}
          duration={450}
        />
        .
        <AnimatedNumber
          value={Number(format(date, "SSS"))}
          format={{ minimumIntegerDigits: 3, maximumFractionDigits: 0 }}
          duration={300}
        />
      </span>
    </div>
  );
}

