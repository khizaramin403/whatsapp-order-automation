"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import type { User, Role, SupportedLanguage } from "@app/shared";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTeamMember, useUpdateTeamMember } from "@/hooks/use-team";
import { toast } from "sonner";

interface TeamMemberSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: User | null;
}

interface FormValues {
  name: string;
  email: string;
  role: Role;
  language: SupportedLanguage;
  password?: string;
}

interface TeamMemberFormProps {
  member?: User | null;
  onClose: () => void;
}

function TeamMemberForm({ member, onClose }: TeamMemberFormProps) {
  const t = useTranslations("team");
  const createMember = useCreateTeamMember();
  const updateMember = useUpdateTeamMember();
  const isEditing = Boolean(member);

  const formSchema = React.useMemo(() => {
    return z.object({
      name: z.string().min(1, t("validation.nameRequired")),
      email: z.string().email(t("validation.emailInvalid")),
      role: z.enum(["owner", "manager", "chef", "rider", "super_admin"] as const, {
        required_error: t("validation.roleRequired"),
      }),
      language: z.enum(["en", "ar", "ur-Latn"] as const),
      password: isEditing
        ? z
            .string()
            .optional()
            .refine((val) => !val || val.length >= 6, {
              message: t("validation.passwordMin"),
            })
        : z
            .string()
            .min(1, t("validation.passwordRequired"))
            .min(6, t("validation.passwordMin")),
    });
  }, [t, isEditing]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: member?.name ?? "",
      email: member?.email ?? "",
      role: (member?.role as Role) ?? "manager",
      language: (member?.language as SupportedLanguage) ?? "en",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing && member) {
        await updateMember.mutateAsync({
          id: member.id,
          data: {
            name: data.name,
            email: data.email,
            role: data.role,
            language: data.language,
            ...(data.password ? { password: data.password } : {}),
          },
        });
        toast.success(t("toast.updated"));
      } else {
        await createMember.mutateAsync({
          name: data.name,
          email: data.email,
          role: data.role,
          language: data.language,
          is_active: true,
          avatar_key: null,
          password: data.password,
        });
        toast.success(t("toast.created"));
      }
      onClose();
    } catch {
      toast.error(t("toast.error"));
    }
  };

  const isPending = isSubmitting || createMember.isPending || updateMember.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col justify-between">
      <div className="space-y-5 px-6 py-4 overflow-y-auto max-h-[calc(100vh-140px)]">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="member-name" className="text-[13px] font-medium text-[#10202D]">
            {t("sheet.fullName")}
          </Label>
          <Input
            id="member-name"
            placeholder={t("sheet.fullNamePlaceholder")}
            {...register("name")}
            className="h-10 border-[#D5DAE0] focus-visible:ring-[#10202D]"
          />
          {errors.name && (
            <p className="text-xs text-[#8E2A22]">{errors.name.message}</p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <Label htmlFor="member-email" className="text-[13px] font-medium text-[#10202D]">
            {t("sheet.email")}
          </Label>
          <Input
            id="member-email"
            type="email"
            placeholder={t("sheet.emailPlaceholder")}
            {...register("email")}
            className="h-10 border-[#D5DAE0] focus-visible:ring-[#10202D]"
          />
          {errors.email && (
            <p className="text-xs text-[#8E2A22]">{errors.email.message}</p>
          )}
        </div>

        {/* Role Select */}
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-[#10202D]">
            {t("sheet.role")}
          </Label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-10 border-[#D5DAE0] focus:ring-[#10202D]">
                  <SelectValue placeholder={t("sheet.rolePlaceholder")} />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E2E5E9]">
                  <SelectItem value="manager">{t("roles.manager")}</SelectItem>
                  <SelectItem value="chef">{t("roles.chef")}</SelectItem>
                  <SelectItem value="rider">{t("roles.rider")}</SelectItem>
                  {isEditing && member?.role === "owner" && (
                    <SelectItem value="owner">{t("roles.owner")}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && (
            <p className="text-xs text-[#8E2A22]">{errors.role.message}</p>
          )}
        </div>

        {/* Language Select */}
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-[#10202D]">
            {t("sheet.language")}
          </Label>
          <Controller
            control={control}
            name="language"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-10 border-[#D5DAE0] focus:ring-[#10202D]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E2E5E9]">
                  <SelectItem value="en">{t("languages.en")}</SelectItem>
                  <SelectItem value="ar">{t("languages.ar")}</SelectItem>
                  <SelectItem value="ur-Latn">{t("languages.ur")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Temporary Password */}
        <div className="space-y-1.5">
          <Label htmlFor="member-password" className="text-[13px] font-medium text-[#10202D]">
            {t("sheet.tempPassword")}
          </Label>
          <Input
            id="member-password"
            type="password"
            placeholder={
              isEditing ? "•••••••• (unchanged)" : t("sheet.tempPasswordPlaceholder")
            }
            {...register("password")}
            className="h-10 border-[#D5DAE0] focus-visible:ring-[#10202D]"
          />
          <p className="text-xs text-[#5F6C79] leading-relaxed">
            {t("sheet.tempPasswordNote")}
          </p>
          {errors.password && (
            <p className="text-xs text-[#8E2A22]">{errors.password.message}</p>
          )}
        </div>
      </div>

      <SheetFooter className="border-t border-[#E2E5E9] p-4 sm:flex-row sm:justify-end gap-2 bg-[#F7F7F7]">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          className="h-10 border-[#D5DAE0] text-[#10202D] hover:bg-[#F2F4F6]"
        >
          {t("deactivateDialog.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 bg-[#C7A667] text-[#10202D] hover:bg-[#B5964F] active:bg-[#A3853F] font-semibold transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t("sheet.saving")}
            </>
          ) : (
            t("sheet.save")
          )}
        </Button>
      </SheetFooter>
    </form>
  );
}

export function TeamMemberSheet({
  open,
  onOpenChange,
  member,
}: TeamMemberSheetProps) {
  const t = useTranslations("team");
  const locale = useLocale();
  const isEditing = Boolean(member);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={locale === "ar" ? "left" : "right"}
        className="w-full sm:max-w-md p-0 flex flex-col justify-between border-s border-[#E2E5E9] bg-white shadow-[0_8px_24px_rgba(16,32,45,0.12)]"
      >
        <SheetHeader className="p-6 border-b border-[#E2E5E9] text-start">
          <SheetTitle className="text-lg font-semibold text-[#10202D]">
            {isEditing ? t("sheet.editTitle") : t("sheet.addTitle")}
          </SheetTitle>
          <SheetDescription className="text-xs text-[#5F6C79]">
            {isEditing ? t("sheet.editSubtitle") : t("sheet.addSubtitle")}
          </SheetDescription>
        </SheetHeader>

        {open && (
          <TeamMemberForm
            key={member?.id ?? "new-member"}
            member={member}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
