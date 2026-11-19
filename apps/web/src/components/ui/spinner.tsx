import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "default" | "lg";
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  default: "h-4 w-4", // 16px
  lg: "h-6 w-6",
};

export function Spinner({ size = "default", className, ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-flex items-center justify-center text-inherit", className)}
      {...props}
    >
      <Loader2
        className={cn(
          "animate-spin text-inherit motion-reduce:animate-none",
          sizeClasses[size]
        )}
      />
    </span>
  );
}
