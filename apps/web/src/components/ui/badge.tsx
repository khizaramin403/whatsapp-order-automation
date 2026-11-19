import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center h-[22px] rounded-full px-2.5 text-[12px] font-semibold leading-none transition-colors select-none",
  {
    variants: {
      variant: {
        // Status variants from DESIGN.md Section 7.2
        success: "bg-[#E6F2EC] text-[#1F5C42] border border-[#E6F2EC]",
        warning: "bg-[#FBF0DA] text-[#7A4E0B] border border-[#FBF0DA]",
        danger: "bg-[#F8E4E1] text-[#8E2A22] border border-[#F8E4E1]",
        info: "bg-[#E3EDF5] text-[#1F4C73] border border-[#E3EDF5]",
        gold: "bg-[#F4ECDC] text-[#7D6228] border border-[#F4ECDC]",
        midnight: "bg-[#E3E8EE] text-[#10202D] border border-[#E3E8EE]",
        neutral: "bg-[#ECEEF1] text-[#3A4651] border border-[#ECEEF1]",

        // Brand variants
        primary: "bg-[#10202D] text-[#F7F7F7]",
        secondary: "bg-[#ECEEF1] text-[#10202D]",
        accent: "bg-[#C7A667] text-[#10202D]",
        outline: "border border-[#E2E5E9] bg-white text-[#10202D]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

const dotColors: Record<string, string> = {
  success: "bg-[#2F7D5B]",
  warning: "bg-[#B7791F]",
  danger: "bg-[#B3392F]",
  info: "bg-[#2F6690]",
  gold: "bg-[#C7A667]",
  midnight: "bg-[#10202D]",
  neutral: "bg-[#5F6C79]",
  primary: "bg-[#F7F7F7]",
  secondary: "bg-[#10202D]",
  accent: "bg-[#10202D]",
  outline: "bg-[#10202D]",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant = "neutral", dot = false, children, ...props }: BadgeProps) {
  const currentVariant = variant || "neutral";
  return (
    <div className={cn(badgeVariants({ variant: currentVariant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full me-1.5 shrink-0",
            dotColors[currentVariant] || "bg-current"
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
