import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[8px] border bg-white ps-3 pe-3 py-2 text-sm text-[#10202D] placeholder:text-[#66737F] transition-colors duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:bg-[#F2F4F6] disabled:text-[#AEB7C0]",
          error
            ? "border-[#B3392F] focus-visible:border-[#B3392F] focus-visible:ring-3 focus-visible:ring-[#B3392F]/20"
            : "border-[#D5DAE0] hover:border-[#AEB7C0] focus-visible:outline-none focus-visible:border-[#10202D] focus-visible:ring-3 focus-visible:ring-[#C7A667]/35",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
