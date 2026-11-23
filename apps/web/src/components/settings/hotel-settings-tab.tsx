"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SettingsFormData } from "./types";

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export function HotelSettingsTab() {
  const t = useTranslations("settings");
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<SettingsFormData>();

  return (
    <div className="space-y-8">
      {/* Hotel Identity Card */}
      <div className="rounded-[12px] border border-[#E2E5E9] bg-white p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-semibold text-[#10202D]">
            {t("hotel.title")}
          </h2>
          <p className="text-xs text-[#5F6C79] mt-0.5">
            {t("hotel.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Hotel Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="hotel-name" className="text-[13px] font-medium text-[#10202D]">
              {t("hotel.name")}
            </Label>
            <Input
              id="hotel-name"
              placeholder={t("hotel.namePlaceholder")}
              {...register("name")}
              className="h-10 border-[#D5DAE0] focus-visible:ring-[#10202D]"
            />
            {errors.name && (
              <p className="text-xs text-[#8E2A22]">{errors.name.message}</p>
            )}
          </div>

          {/* Timezone */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-[#10202D]">
              {t("hotel.timezone")}
            </Label>
            <Controller
              control={control}
              name="timezone"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 border-[#D5DAE0] focus:ring-[#10202D]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E2E5E9]">
                    <SelectItem value="Asia/Karachi">Asia/Karachi (PKT +05:00)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (GST +04:00)</SelectItem>
                    <SelectItem value="Asia/Riyadh">Asia/Riyadh (AST +03:00)</SelectItem>
                    <SelectItem value="UTC">UTC (GMT +00:00)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Currency */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-[#10202D]">
              {t("hotel.currency")}
            </Label>
            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 border-[#D5DAE0] focus:ring-[#10202D]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E2E5E9]">
                    <SelectItem value="PKR">PKR (Rs)</SelectItem>
                    <SelectItem value="SAR">SAR (ر.س)</SelectItem>
                    <SelectItem value="AED">AED (د.إ)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Default Language */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-[#10202D]">
              {t("hotel.defaultLanguage")}
            </Label>
            <Controller
              control={control}
              name="default_language"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 border-[#D5DAE0] focus:ring-[#10202D]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E2E5E9]">
                    <SelectItem value="en">{t("bot.languages.en")}</SelectItem>
                    <SelectItem value="ar">{t("bot.languages.ar")}</SelectItem>
                    <SelectItem value="ur-Latn">{t("bot.languages.ur")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Delivery Fee */}
          <div className="space-y-1.5">
            <Label htmlFor="delivery-fee" className="text-[13px] font-medium text-[#10202D]">
              {t("hotel.deliveryFee")}
            </Label>
            <Input
              id="delivery-fee"
              type="number"
              min="0"
              step="1"
              placeholder={t("hotel.deliveryFeePlaceholder")}
              {...register("delivery_fee", { valueAsNumber: true })}
              className="h-10 border-[#D5DAE0] focus-visible:ring-[#10202D]"
            />
            {errors.delivery_fee && (
              <p className="text-xs text-[#8E2A22]">{errors.delivery_fee.message}</p>
            )}
          </div>

          {/* Minimum Order */}
          <div className="space-y-1.5">
            <Label htmlFor="minimum-order" className="text-[13px] font-medium text-[#10202D]">
              {t("hotel.minimumOrder")}
            </Label>
            <Input
              id="minimum-order"
              type="number"
              min="0"
              step="1"
              placeholder={t("hotel.minimumOrderPlaceholder")}
              {...register("minimum_order", { valueAsNumber: true })}
              className="h-10 border-[#D5DAE0] focus-visible:ring-[#10202D]"
            />
            {errors.minimum_order && (
              <p className="text-xs text-[#8E2A22]">{errors.minimum_order.message}</p>
            )}
          </div>

          {/* Delivery Area Note */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="delivery-area" className="text-[13px] font-medium text-[#10202D]">
              {t("hotel.deliveryArea")}
            </Label>
            <Input
              id="delivery-area"
              placeholder={t("hotel.deliveryAreaPlaceholder")}
              {...register("delivery_area")}
              className="h-10 border-[#D5DAE0] focus-visible:ring-[#10202D]"
            />
          </div>
        </div>
      </div>

      {/* Opening Hours Card */}
      <div className="rounded-[12px] border border-[#E2E5E9] bg-white p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-semibold text-[#10202D]">
            {t("hotel.openingHours")}
          </h2>
          <p className="text-xs text-[#5F6C79] mt-0.5">
            {t("hotel.openingHoursSubtitle")}
          </p>
        </div>

        <div className="divide-y divide-[#E2E5E9] border border-[#E2E5E9] rounded-[8px] overflow-hidden">
          {DAYS_OF_WEEK.map((day) => {
            const isClosed = watch(`open_hours.${day}.closed`);

            return (
              <div
                key={day}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3 bg-white hover:bg-[#F2F4F6]/50 transition-colors"
              >
                <div className="w-32 font-medium text-sm text-[#10202D] capitalize">
                  {day === "monday"
                    ? t("hotel.days.monday")
                    : day === "tuesday"
                    ? t("hotel.days.tuesday")
                    : day === "wednesday"
                    ? t("hotel.days.wednesday")
                    : day === "thursday"
                    ? t("hotel.days.thursday")
                    : day === "friday"
                    ? t("hotel.days.friday")
                    : day === "saturday"
                    ? t("hotel.days.saturday")
                    : t("hotel.days.sunday")}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Closed toggle */}
                  <div className="flex items-center gap-2">
                    <Controller
                      control={control}
                      name={`open_hours.${day}.closed`}
                      render={({ field }) => (
                        <Switch
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          id={`closed-${day}`}
                        />
                      )}
                    />
                    <Label
                      htmlFor={`closed-${day}`}
                      className="text-xs text-[#5F6C79] cursor-pointer"
                    >
                      {t("hotel.closed")}
                    </Label>
                  </div>

                  {/* Time Inputs */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#5F6C79]">{t("hotel.openTime")}:</span>
                      <Input
                        type="time"
                        disabled={isClosed}
                        {...register(`open_hours.${day}.open`)}
                        className="h-8 w-28 text-xs border-[#D5DAE0] disabled:bg-[#ECEEF1] disabled:text-[#5F6C79]"
                      />
                    </div>
                    <span className="text-[#5F6C79]">-</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#5F6C79]">{t("hotel.closeTime")}:</span>
                      <Input
                        type="time"
                        disabled={isClosed}
                        {...register(`open_hours.${day}.close`)}
                        className="h-8 w-28 text-xs border-[#D5DAE0] disabled:bg-[#ECEEF1] disabled:text-[#5F6C79]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
