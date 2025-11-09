import { Label } from "@/components/ui/label";

interface ProfitMarginDisplayProps {
  profitMargin: string | null;
  className?: string;
}

export function ProfitMarginDisplay({ profitMargin, className = "" }: ProfitMarginDisplayProps) {
  return (
    <div className={`p-3 bg-green-50 dark:bg-green-950/20 rounded-lg ${className}`}>
      <Label className="text-xs text-muted-foreground">
        Profit Margin
      </Label>
      <p className="text-2xl font-bold text-green-600 mt-1">
        {profitMargin}%
      </p>
    </div>
  );
}