import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "primary" | "secondary" | "destructive";
  label?: string;
  fullScreen?: boolean;
}

export default function Spinner({
  size = "md",
  className,
  variant = "default",
  label,
  fullScreen = false,
}: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const variantClasses = {
    default: "text-foreground",
    primary: "text-primary",
    secondary: "text-secondary-foreground",
    destructive: "text-destructive",
  };

  const spinner = (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2
        className={cn(
          sizeClasses[size],
          variantClasses[variant],
          "animate-spin"
        )}
      />
      {label && (
        <p className="mt-2 text-sm text-muted-foreground animate-pulse">
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
