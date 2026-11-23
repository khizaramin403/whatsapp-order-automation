"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, Volume2, Sparkles } from "lucide-react";
import type { SettingsFormData } from "./types";

export function NotificationsTab() {
  const t = useTranslations("settings");
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<SettingsFormData>();

  return (
    <div className="space-y-6">
      <div className="rounded-[12px] border border-[#E2E5E9] bg-white p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-semibold text-[#10202D] flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#C7A667]" />
            <span>{t("notifications.title")}</span>
          </h2>
          <p className="text-xs text-[#5F6C79] mt-0.5">
            {t("notifications.subtitle")}
          </p>
        </div>

        {/* Notification Email Input */}
        <div className="space-y-1.5 max-w-md">
          <Label htmlFor="notification-email" className="text-[13px] font-medium text-[#10202D]">
            {t("notifications.notificationEmail")}
          </Label>
          <Input
            id="notification-email"
            type="email"
            placeholder={t("notifications.notificationEmailPlaceholder")}
            {...register("notification_email")}
            className="h-10 border-[#D5DAE0] focus-visible:ring-[#10202D]"
          />
          {errors.notification_email && (
            <p className="text-xs text-[#8E2A22]">{errors.notification_email.message}</p>
          )}
        </div>

        {/* Switches List */}
        <div className="divide-y divide-[#E2E5E9] border border-[#E2E5E9] rounded-[8px] overflow-hidden">
          {/* Email on new order */}
          <div className="flex items-center justify-between p-4 bg-white hover:bg-[#F2F4F6]/50 transition-colors">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-[#5F6C79] mt-0.5" />
              <div>
                <Label htmlFor="email-new-order" className="text-sm font-medium text-[#10202D] cursor-pointer">
                  {t("notifications.emailOnNewOrder")}
                </Label>
                <p className="text-xs text-[#5F6C79] mt-0.5">
                  {t("notifications.emailOnNewOrderDesc")}
                </p>
              </div>
            </div>
            <Controller
              control={control}
              name="email_notifications"
              render={({ field }) => (
                <Switch
                  id="email-new-order"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Daily summary email */}
          <div className="flex items-center justify-between p-4 bg-white hover:bg-[#F2F4F6]/50 transition-colors">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-[#5F6C79] mt-0.5" />
              <div>
                <Label htmlFor="daily-summary" className="text-sm font-medium text-[#10202D] cursor-pointer">
                  {t("notifications.dailySummaryEmail")}
                </Label>
                <p className="text-xs text-[#5F6C79] mt-0.5">
                  {t("notifications.dailySummaryEmailDesc")}
                </p>
              </div>
            </div>
            <Controller
              control={control}
              name="daily_summary_email"
              render={({ field }) => (
                <Switch
                  id="daily-summary"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Web push notifications */}
          <div className="flex items-center justify-between p-4 bg-white hover:bg-[#F2F4F6]/50 transition-colors">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-[#5F6C79] mt-0.5" />
              <div>
                <Label htmlFor="web-push" className="text-sm font-medium text-[#10202D] cursor-pointer">
                  {t("notifications.pushNotifications")}
                </Label>
                <p className="text-xs text-[#5F6C79] mt-0.5">
                  {t("notifications.pushNotificationsDesc")}
                </p>
              </div>
            </div>
            <Controller
              control={control}
              name="push_notifications"
              render={({ field }) => (
                <Switch
                  id="web-push"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Sound alerts */}
          <div className="flex items-center justify-between p-4 bg-white hover:bg-[#F2F4F6]/50 transition-colors">
            <div className="flex items-start gap-3">
              <Volume2 className="h-5 w-5 text-[#5F6C79] mt-0.5" />
              <div>
                <Label htmlFor="sound-alerts" className="text-sm font-medium text-[#10202D] cursor-pointer">
                  {t("notifications.sound")}
                </Label>
                <p className="text-xs text-[#5F6C79] mt-0.5">
                  {t("notifications.soundDesc")}
                </p>
              </div>
            </div>
            <Controller
              control={control}
              name="sound_notifications"
              render={({ field }) => (
                <Switch
                  id="sound-alerts"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
