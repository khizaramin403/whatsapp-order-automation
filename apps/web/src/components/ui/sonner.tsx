"use client";

import { useLocale } from "next-intl";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const position = props.position || (dir === "rtl" ? "top-left" : "top-right");

  return (
    <Sonner
      dir={dir}
      position={position}
      duration={4000}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#10202D] group-[.toaster]:border-[#E2E5E9] group-[.toaster]:shadow-[0_8px_24px_rgba(16,32,45,0.12)] group-[.toaster]:rounded-[12px] group-[.toaster]:p-4 group-[.toaster]:text-sm",
          description: "group-[.toast]:text-[#5F6C79] text-xs",
          actionButton:
            "group-[.toast]:bg-[#10202D] group-[.toast]:text-[#F7F7F7] group-[.toast]:rounded-[8px] text-xs font-semibold px-3 py-1.5",
          cancelButton:
            "group-[.toast]:bg-[#F2F4F6] group-[.toast]:text-[#10202D] group-[.toast]:rounded-[8px] text-xs font-semibold px-3 py-1.5",
          error:
            "group-[.toaster]:border-[#B3392F]/30 group-[.toaster]:bg-[#F8E4E1] group-[.toaster]:text-[#8E2A22]",
          success:
            "group-[.toaster]:border-[#2F7D5B]/30 group-[.toaster]:bg-[#E6F2EC] group-[.toaster]:text-[#1F5C42]",
          warning:
            "group-[.toaster]:border-[#B7791F]/30 group-[.toaster]:bg-[#FBF0DA] group-[.toaster]:text-[#7A4E0B]",
          info:
            "group-[.toaster]:border-[#2F6690]/30 group-[.toaster]:bg-[#E3EDF5] group-[.toaster]:text-[#1F4C73]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
