"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Bot, CheckCircle2, MessageSquare } from "lucide-react";
import type { SettingsFormData } from "./types";

export function BotTextsTab() {
  const t = useTranslations("settings");
  const { register, control } = useFormContext<SettingsFormData>();

  const [activeLangTab, setActiveLangTab] = React.useState<"en" | "ar" | "ur">("en");

  // Watch messages for live WhatsApp preview
  const welcomeEn = useWatch({ control, name: "bot_welcome_en" });
  const welcomeAr = useWatch({ control, name: "bot_welcome_ar" });
  const welcomeUr = useWatch({ control, name: "bot_welcome_ur" });
  const paymentEn = useWatch({ control, name: "bot_payment_en" });
  const paymentAr = useWatch({ control, name: "bot_payment_ar" });
  const paymentUr = useWatch({ control, name: "bot_payment_ur" });

  const currentWelcome =
    activeLangTab === "en"
      ? welcomeEn
      : activeLangTab === "ar"
      ? welcomeAr
      : welcomeUr;

  const currentPayment =
    activeLangTab === "en"
      ? paymentEn
      : activeLangTab === "ar"
      ? paymentAr
      : paymentUr;

  const isRtlPreview = activeLangTab === "ar";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Editor Column (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="rounded-[12px] border border-[#E2E5E9] bg-white p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-semibold text-[#10202D] flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#C7A667]" />
              <span>{t("bot.title")}</span>
            </h2>
            <p className="text-xs text-[#5F6C79] mt-0.5">
              {t("bot.subtitle")}
            </p>
          </div>

          <Tabs
            value={activeLangTab}
            onValueChange={(val) => setActiveLangTab(val as "en" | "ar" | "ur")}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="en">{t("bot.languages.en")}</TabsTrigger>
              <TabsTrigger value="ar">{t("bot.languages.ar")}</TabsTrigger>
              <TabsTrigger value="ur">{t("bot.languages.ur")}</TabsTrigger>
            </TabsList>

            {/* English Tab */}
            <TabsContent value="en" className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="bot-welcome-en" className="text-[13px] font-medium text-[#10202D]">
                  {t("bot.welcomeMessage")}
                </Label>
                <textarea
                  id="bot-welcome-en"
                  rows={3}
                  placeholder={t("bot.welcomePlaceholder")}
                  {...register("bot_welcome_en")}
                  className="w-full rounded-[8px] border border-[#D5DAE0] bg-white p-3 text-sm text-[#10202D] focus:outline-none focus:ring-2 focus:ring-[#10202D] focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bot-payment-en" className="text-[13px] font-medium text-[#10202D]">
                  {t("bot.paymentMessage")}
                </Label>
                <textarea
                  id="bot-payment-en"
                  rows={3}
                  placeholder={t("bot.paymentPlaceholder")}
                  {...register("bot_payment_en")}
                  className="w-full rounded-[8px] border border-[#D5DAE0] bg-white p-3 text-sm text-[#10202D] focus:outline-none focus:ring-2 focus:ring-[#10202D] focus:border-transparent transition-all"
                />
              </div>
            </TabsContent>

            {/* Arabic Tab (RTL) */}
            <TabsContent value="ar" className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="bot-welcome-ar" className="text-[13px] font-medium text-[#10202D]">
                  {t("bot.welcomeMessage")}
                </Label>
                <textarea
                  id="bot-welcome-ar"
                  rows={3}
                  dir="rtl"
                  placeholder={t("bot.welcomePlaceholder")}
                  {...register("bot_welcome_ar")}
                  className="w-full rounded-[8px] border border-[#D5DAE0] bg-white p-3 text-sm text-[#10202D] focus:outline-none focus:ring-2 focus:ring-[#10202D] focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bot-payment-ar" className="text-[13px] font-medium text-[#10202D]">
                  {t("bot.paymentMessage")}
                </Label>
                <textarea
                  id="bot-payment-ar"
                  rows={3}
                  dir="rtl"
                  placeholder={t("bot.paymentPlaceholder")}
                  {...register("bot_payment_ar")}
                  className="w-full rounded-[8px] border border-[#D5DAE0] bg-white p-3 text-sm text-[#10202D] focus:outline-none focus:ring-2 focus:ring-[#10202D] focus:border-transparent transition-all"
                />
              </div>
            </TabsContent>

            {/* Roman Urdu Tab */}
            <TabsContent value="ur" className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="bot-welcome-ur" className="text-[13px] font-medium text-[#10202D]">
                  {t("bot.welcomeMessage")}
                </Label>
                <textarea
                  id="bot-welcome-ur"
                  rows={3}
                  placeholder={t("bot.welcomePlaceholder")}
                  {...register("bot_welcome_ur")}
                  className="w-full rounded-[8px] border border-[#D5DAE0] bg-white p-3 text-sm text-[#10202D] focus:outline-none focus:ring-2 focus:ring-[#10202D] focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bot-payment-ur" className="text-[13px] font-medium text-[#10202D]">
                  {t("bot.paymentMessage")}
                </Label>
                <textarea
                  id="bot-payment-ur"
                  rows={3}
                  placeholder={t("bot.paymentPlaceholder")}
                  {...register("bot_payment_ur")}
                  className="w-full rounded-[8px] border border-[#D5DAE0] bg-white p-3 text-sm text-[#10202D] focus:outline-none focus:ring-2 focus:ring-[#10202D] focus:border-transparent transition-all"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Live WhatsApp Preview (5 cols) */}
      <div className="lg:col-span-5 space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#5F6C79]">
          {t("bot.preview.title")}
        </div>

        <div className="rounded-[16px] border border-[#E2E5E9] bg-[#EFEAE2] shadow-sm overflow-hidden max-w-sm mx-auto w-full">
          {/* WhatsApp Header */}
          <div className="bg-[#10202D] text-white p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#C7A667] text-[#10202D] flex items-center justify-center font-bold text-sm shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold truncate text-[#F7F7F7]">
                  {t("bot.preview.botName")}
                </span>
                <CheckCircle2 className="h-3.5 w-3.5 text-[#2F7D5B] fill-current shrink-0" />
              </div>
              <div className="text-[10px] text-[#A9B4BE] truncate">
                {t("bot.preview.verified")}
              </div>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div
            className="p-3.5 space-y-3 min-h-[300px] text-xs flex flex-col justify-end"
            dir={isRtlPreview ? "rtl" : "ltr"}
          >
            {/* Customer greeting message */}
            <div className="flex justify-end">
              <div className="bg-[#DCF8C6] text-[#10202D] p-2.5 rounded-[10px] rounded-tr-none max-w-[80%] shadow-xs">
                <p className="leading-snug">{t("bot.preview.sampleCustomer")}</p>
                <div className="text-[9px] text-[#5F6C79] text-end mt-1">11:02 AM</div>
              </div>
            </div>

            {/* Bot Welcome Greeting Message */}
            <div className="flex justify-start">
              <div className="bg-white text-[#10202D] p-2.5 rounded-[10px] rounded-tl-none max-w-[85%] shadow-xs border border-black/5">
                <p className="leading-snug whitespace-pre-wrap">
                  {currentWelcome || t("bot.welcomePlaceholder")}
                </p>
                <div className="text-[9px] text-[#5F6C79] text-end mt-1">11:02 AM</div>
              </div>
            </div>

            {/* Customer order confirmation */}
            <div className="flex justify-end">
              <div className="bg-[#DCF8C6] text-[#10202D] p-2.5 rounded-[10px] rounded-tr-none max-w-[80%] shadow-xs">
                <p className="leading-snug">Order #1085 • Online Payment</p>
                <div className="text-[9px] text-[#5F6C79] text-end mt-1">11:05 AM</div>
              </div>
            </div>

            {/* Bot Payment Instructions Message */}
            <div className="flex justify-start">
              <div className="bg-white text-[#10202D] p-2.5 rounded-[10px] rounded-tl-none max-w-[85%] shadow-xs border border-black/5">
                <p className="leading-snug whitespace-pre-wrap">
                  {currentPayment || t("bot.paymentPlaceholder")}
                </p>
                <div className="text-[9px] text-[#5F6C79] text-end mt-1">11:05 AM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
