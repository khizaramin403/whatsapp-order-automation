"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  CreditCard,
  MessageSquare,
  Bell,
  Save,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { Restaurant } from "@app/shared";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { HotelSettingsTab } from "./hotel-settings-tab";
import { PaymentSettingsTab } from "./payment-settings-tab";
import { BotTextsTab } from "./bot-texts-tab";
import { NotificationsTab } from "./notifications-tab";
import { createSettingsSchema, type SettingsFormData } from "./types";
import { toast } from "sonner";

interface SettingsFormInnerProps {
  settings: Restaurant;
}

function SettingsFormInner({ settings }: SettingsFormInnerProps) {
  const t = useTranslations("settings");
  const updateSettings = useUpdateSettings();

  const formSchema = React.useMemo(() => {
    return createSettingsSchema({
      nameRequired: t("validation.nameRequired"),
      deliveryFeePositive: t("validation.deliveryFeePositive"),
      minOrderPositive: t("validation.minOrderPositive"),
      emailInvalid: t("validation.emailInvalid"),
    });
  }, [t]);

  // Convert minor units to whole currency units for intuitive editing
  const initialValues: SettingsFormData = React.useMemo(() => {
    return {
      name: settings.name || "",
      timezone: settings.timezone || "Asia/Karachi",
      currency: settings.currency || "PKR",
      default_language: (settings.default_language as "en" | "ar" | "ur-Latn") || "en",
      delivery_fee: Math.round((settings.delivery_fee || 0) / 100),
      minimum_order: Math.round((settings.minimum_order || 0) / 100),
      delivery_area: settings.delivery_area || "",
      open_hours: settings.open_hours || {
        monday: { open: "11:00", close: "23:30", closed: false },
        tuesday: { open: "11:00", close: "23:30", closed: false },
        wednesday: { open: "11:00", close: "23:30", closed: false },
        thursday: { open: "11:00", close: "23:30", closed: false },
        friday: { open: "13:00", close: "00:00", closed: false },
        saturday: { open: "11:00", close: "00:00", closed: false },
        sunday: { open: "11:00", close: "23:30", closed: false },
      },
      payment_account: settings.payment_account || "",
      payment_instructions: settings.payment_instructions || "",
      bot_welcome_en: settings.bot_welcome_en || "",
      bot_welcome_ar: settings.bot_welcome_ar || "",
      bot_welcome_ur: settings.bot_welcome_ur || "",
      bot_payment_en: settings.bot_payment_en || "",
      bot_payment_ar: settings.bot_payment_ar || "",
      bot_payment_ur: settings.bot_payment_ur || "",
      email_notifications: settings.email_notifications ?? true,
      daily_summary_email: settings.daily_summary_email ?? true,
      push_notifications: settings.push_notifications ?? true,
      sound_notifications: settings.sound_notifications ?? true,
      notification_email: settings.notification_email || "",
    };
  }, [settings]);

  const methods = useForm<SettingsFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
    reset,
  } = methods;

  // Browser beforeunload prompt when dirty
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      const payload: Partial<Restaurant> = {
        name: data.name,
        timezone: data.timezone,
        currency: data.currency,
        default_language: data.default_language,
        delivery_fee: Math.round(Number(data.delivery_fee) * 100),
        minimum_order: Math.round(Number(data.minimum_order) * 100),
        delivery_area: data.delivery_area || null,
        open_hours: data.open_hours,
        payment_account: data.payment_account || null,
        payment_instructions: data.payment_instructions || null,
        bot_welcome_en: data.bot_welcome_en || null,
        bot_welcome_ar: data.bot_welcome_ar || null,
        bot_welcome_ur: data.bot_welcome_ur || null,
        bot_payment_en: data.bot_payment_en || null,
        bot_payment_ar: data.bot_payment_ar || null,
        bot_payment_ur: data.bot_payment_ur || null,
        email_notifications: data.email_notifications,
        daily_summary_email: data.daily_summary_email,
        push_notifications: data.push_notifications,
        sound_notifications: data.sound_notifications,
        notification_email: data.notification_email || null,
      };

      await updateSettings.mutateAsync(payload);
      toast.success(t("toast.saved"));
      reset(data); // Clear dirty state
    } catch {
      toast.error(t("toast.error"));
    }
  };

  const isPending = isSubmitting || updateSettings.isPending;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Unsaved Changes Warning Banner */}
        {isDirty && (
          <Alert
            variant="warning"
            className="border-[#FBF0DA] bg-[#FBF0DA] text-[#7A4E0B] shadow-xs"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-semibold text-sm">
              {t("unsavedChanges.warning")}
            </AlertTitle>
            <AlertDescription className="text-xs mt-0.5">
              {t("unsavedChanges.desc")}
            </AlertDescription>
          </Alert>
        )}

        {/* Header Action Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#10202D]">
              {t("title")}
            </h1>
            <p className="text-xs text-[#5F6C79] mt-1">{t("subtitle")}</p>
          </div>

          {/* Gold Accent Save Button */}
          <Button
            type="submit"
            disabled={isPending || !isDirty}
            className="h-10 bg-[#C7A667] text-[#10202D] hover:bg-[#B5964F] active:bg-[#A3853F] font-semibold transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("saving")}</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{t("save")}</span>
              </>
            )}
          </Button>
        </div>

        {/* Settings Navigation Tabs */}
        <Tabs defaultValue="hotel" className="w-full space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto pb-0">
            <TabsTrigger value="hotel" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{t("tabs.hotel")}</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>{t("tabs.payments")}</span>
            </TabsTrigger>
            <TabsTrigger value="bot" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>{t("tabs.bot")}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>{t("tabs.notifications")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Hotel Tab */}
          <TabsContent value="hotel" className="m-0 focus-visible:outline-none">
            <HotelSettingsTab />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="m-0 focus-visible:outline-none">
            <PaymentSettingsTab />
          </TabsContent>

          {/* Bot Texts Tab */}
          <TabsContent value="bot" className="m-0 focus-visible:outline-none">
            <BotTextsTab />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="m-0 focus-visible:outline-none">
            <NotificationsTab />
          </TabsContent>
        </Tabs>
      </form>
    </FormProvider>
  );
}

export function SettingsDashboard() {
  const t = useTranslations("settings");
  const { data: settings, isLoading, isError, refetch } = useSettings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-6 border-b border-[#E2E5E9] pb-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="rounded-[12px] border border-[#E2E5E9] bg-white p-6 space-y-4">
          <Skeleton className="h-5 w-48" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="rounded-[12px] border border-[#F8E4E1] bg-white p-8 text-center space-y-3 shadow-xs">
        <AlertCircle className="mx-auto h-8 w-8 text-[#8E2A22]" />
        <h3 className="text-base font-semibold text-[#10202D]">
          {t("toast.error")}
        </h3>
        <Button
          onClick={() => refetch()}
          variant="secondary"
          className="mt-2 h-9 border-[#E2E5E9]"
        >
          <RefreshCw className="me-2 h-4 w-4" />
          {t("save")}
        </Button>
      </div>
    );
  }

  return <SettingsFormInner key={settings.id} settings={settings} />;
}
