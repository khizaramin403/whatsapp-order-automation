import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden border",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[10px]",    // 24px
        sm: "h-8 w-8 text-xs",         // 32px
        default: "h-10 w-10 text-sm",  // 40px
        lg: "h-16 w-16 text-lg",       // 64px
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-[8px]",       // Hotel logo option
      },
      dark: {
        true: "border-[#3A5266] bg-[#22394B]",
        false: "border-[#E2E5E9] bg-white",
      },
    },
    defaultVariants: {
      size: "default",
      shape: "circle",
      dark: false,
    },
  }
);

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, shape, dark, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(avatarVariants({ size, shape, dark, className }))}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  dark?: boolean;
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, dark = false, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center font-semibold select-none",
      dark
        ? "bg-[#22394B] text-[#E8D9B5]"
        : "bg-[#F4ECDC] text-[#7D6228]",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
