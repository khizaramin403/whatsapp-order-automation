import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[8px] text-sm font-semibold transition-colors duration-150 focus-visible:outline-none cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-100",
  {
    variants: {
      variant: {
        // Primary: Default #10202D, text #F7F7F7, hover #1B3345, pressed #0B1620, disabled #AEB7C0, focus Navy + ring
        primary:
          "bg-[#10202D] text-[#F7F7F7] hover:bg-[#1B3345] active:bg-[#0B1620] disabled:bg-[#AEB7C0] disabled:text-[#F7F7F7] focus-visible:ring-2 focus-visible:ring-[#10202D] focus-visible:ring-offset-2",
        // Accent (gold): Default #C7A667, text #10202D, hover #B5964F, pressed #A3853F, disabled #E6D9BB text #7D6228, focus Gold + navy ring
        accent:
          "bg-[#C7A667] text-[#10202D] hover:bg-[#B5964F] active:bg-[#A3853F] disabled:bg-[#E6D9BB] disabled:text-[#7D6228] focus-visible:ring-2 focus-visible:ring-[#C7A667] focus-visible:ring-offset-2",
        // Secondary: White, border #D5DAE0, text #10202D, hover #F2F4F6, pressed #E2E5E9, disabled text #AEB7C0
        secondary:
          "bg-white border border-[#D5DAE0] text-[#10202D] hover:bg-[#F2F4F6] active:bg-[#E2E5E9] disabled:bg-white disabled:border-[#D5DAE0] disabled:text-[#AEB7C0] focus-visible:ring-2 focus-visible:ring-[#10202D] focus-visible:ring-offset-2",
        // Ghost: Transparent, text #10202D, hover #ECEEF1, pressed #E2E5E9, disabled text #AEB7C0
        ghost:
          "bg-transparent text-[#10202D] hover:bg-[#ECEEF1] active:bg-[#E2E5E9] disabled:text-[#AEB7C0] focus-visible:ring-2 focus-visible:ring-[#10202D] focus-visible:ring-offset-2",
        // Destructive: #B3392F, text white, hover #9C2F26, pressed #852720, disabled #E3B8B3
        destructive:
          "bg-[#B3392F] text-white hover:bg-[#9C2F26] active:bg-[#852720] disabled:bg-[#E3B8B3] disabled:text-white focus-visible:ring-2 focus-visible:ring-[#B3392F] focus-visible:ring-offset-2",
        // Dark variant for buttons placed on dark sidebar
        dark:
          "bg-[#1B2D3B] text-[#F7F7F7] hover:bg-[#22394B] active:bg-[#10202D] disabled:text-[#5F6C79] focus-visible:ring-2 focus-visible:ring-[#C7A667] focus-visible:ring-offset-2",
      },
      size: {
        default: "h-10 px-4 py-2", // 40px height, 16px horizontal padding
        sm: "h-8 px-3 text-xs",     // Small variant 32px
        lg: "h-11 px-6",            // Mobile tap target 44px
        icon: "h-10 w-10 p-0",      // 40px icon button
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="me-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
