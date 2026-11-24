"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, CircleAlert, TriangleAlert } from "lucide-react";

import { useAuth } from "@/stores/auth.store";
import {
  login,
  mapApiUserToProfile,
  ApiError,
  getApiErrorMessage,
} from "@/lib/api";
import { setLocale } from "@/actions/locale";
import { ROLE_HOME_PAGES } from "@/components/layout/RoleGuard";
import { BRAND_NAME } from "@/config/brand";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const t = useTranslations("login");
  const tErrors = useTranslations("errors");
  const currentLocale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuth((s) => s.setAuth);

  const [passwordShown, setPasswordShown] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [warningMessage, setWarningMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form schema validation with Zod
  const loginSchema = React.useMemo(() => {
    return z.object({
      email: z
        .string()
        .min(1, { message: t("errors.invalidEmail") })
        .email({ message: t("errors.invalidEmail") }),
      password: z
        .string()
        .min(6, { message: t("errors.passwordRequired") }),
      remember: z.boolean().optional(),
    });
  }, [t]);

  type LoginFormValues = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    setWarningMessage(null);

    try {
      const res = await login({
        email: values.email.trim(),
        password: values.password,
      });

      queryClient.clear();
      const profile = mapApiUserToProfile(res.user);
      setAuth(res.accessToken, profile);

      // Apply the user's saved language preference from their profile
      if (profile.language && profile.language !== currentLocale) {
        await setLocale(profile.language);
      }

      const redirectPath = ROLE_HOME_PAGES[profile.role] || "/orders";
      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "RATE_LIMITED") {
          setWarningMessage(
            err.retryAfterSeconds
              ? tErrors("RATE_LIMITED_SECONDS", { seconds: err.retryAfterSeconds })
              : t("errors.tooManyAttempts")
          );
        } else if (err.code === "UNAUTHENTICATED") {
          setErrorMessage(t("errors.invalidCredentials"));
        } else if (err.code === "FORBIDDEN") {
          setErrorMessage(t("errors.accountInactive"));
        } else {
          setErrorMessage(getApiErrorMessage(err, tErrors));
        }
      } else {
        setErrorMessage(getApiErrorMessage(err, tErrors));
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F7F7F7]">
      {/* Brand Panel (Midnight Blue, 50% width on Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#10202D] text-[#F7F7F7] flex-col justify-between p-12 xl:p-16 relative overflow-hidden select-none">
        {/* Faint Concentric Circles Background Pattern (~6% opacity) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] flex items-center justify-center">
          <svg
            className="w-[800px] h-[800px]"
            viewBox="0 0 800 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="400" cy="400" r="100" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="400" cy="400" r="180" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="400" cy="400" r="260" stroke="#C7A667" strokeWidth="1.5" />
            <circle cx="400" cy="400" r="340" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="400" cy="400" r="420" stroke="#FFFFFF" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Top: Brand wordmark & mark */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-9 w-9 rounded-[8px] bg-[#1B2D3B] border border-[#22394B] flex items-center justify-center text-[#C7A667] font-brand font-semibold text-lg shrink-0 shadow-xs">
            Y
          </div>
          <span className="font-brand font-semibold text-xl text-[#F7F7F7] tracking-tight">
            {BRAND_NAME}
          </span>
        </div>

        {/* Center: Two-line Serif Statement & 64px Gold Rule */}
        <div className="relative z-10 max-w-lg my-auto py-12">
          <h2 className="font-brand font-semibold text-4xl xl:text-5xl text-[#F7F7F7] leading-[1.15] whitespace-pre-line">
            {t("brandStatement")}
          </h2>

          {/* 64px gold rule */}
          <div className="w-16 h-[2px] bg-[#C7A667] my-6" aria-hidden="true" />

          <p className="text-[#A9B4BE] text-base xl:text-lg leading-relaxed">
            {t("brandSupporting")}
          </p>
        </div>

        {/* Bottom placeholder text */}
        <div className="relative z-10 text-xs text-[#A9B4BE]">
          {t("placeholderCopy")}
        </div>
      </div>

      {/* Form Panel (Soft White, 50% width on Desktop, Full width on Mobile) */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-center relative p-6 sm:p-12 lg:p-16">
        {/* Language switcher pill in the top corner */}
        <div className="absolute top-6 end-6 z-20">
          <LanguageSwitcher />
        </div>

        {/* Form Card (Max width 400px, Centered) */}
        <div className="max-w-[400px] w-full mx-auto my-auto py-8">
          {/* Brand Mark (40px rounded square) */}
          <div className="h-10 w-10 rounded-[8px] bg-[#10202D] border border-[#22394B] flex items-center justify-center text-[#C7A667] font-brand font-semibold text-xl mx-auto shadow-xs">
            Y
          </div>

          {/* Heading in Playfair Display 34px */}
          <h1 className="font-brand font-semibold text-[34px] leading-tight text-[#10202D] text-center mt-4">
            {t("welcomeBack")}
          </h1>
          <p className="text-sm text-[#5F6C79] text-center mt-1 mb-8">
            {t("signInSubtitle")}
          </p>

          {/* Error Alert */}
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <CircleAlert className="h-4 w-4" />
              <div>
                <AlertTitle>{errorMessage}</AlertTitle>
              </div>
            </Alert>
          )}

          {/* Warning Alert (Too many attempts) */}
          {warningMessage && (
            <Alert variant="warning" className="mb-6">
              <TriangleAlert className="h-4 w-4" />
              <div>
                <AlertTitle>{warningMessage}</AlertTitle>
              </div>
            </Alert>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium text-[#10202D]">
                {t("emailLabel")}
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder={t("emailPlaceholder")}
                disabled={isLoading}
                aria-invalid={!!errors.email}
                className={errors.email ? "border-[#B3392F]" : ""}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-[#8E2A22] mt-1" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px] font-medium text-[#10202D]">
                {t("passwordLabel")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={passwordShown ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={t("passwordPlaceholder")}
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                  className={errors.password ? "pe-10 border-[#B3392F]" : "pe-10"}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setPasswordShown(!passwordShown)}
                  disabled={isLoading}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-[#5F6C79] hover:text-[#10202D] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10202D] rounded-[4px]"
                  title={passwordShown ? t("hidePassword") : t("showPassword")}
                  aria-label={passwordShown ? t("hidePassword") : t("showPassword")}
                >
                  {passwordShown ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-[#8E2A22] mt-1" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="remember"
                  render={({ field }) => (
                    <Checkbox
                      id="remember"
                      disabled={isLoading}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label
                  htmlFor="remember"
                  className="text-xs text-[#5F6C79] font-normal cursor-pointer select-none"
                >
                  {t("rememberMe")}
                </Label>
              </div>

              <button
                type="button"
                className="text-xs font-semibold text-[#7D6228] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10202D] focus-visible:ring-offset-2 rounded-[2px]"
              >
                {t("forgotPassword")}
              </button>
            </div>

            {/* Full-width Primary Sign In Button (46px height) */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-[46px] w-full text-base font-semibold bg-[#10202D] hover:bg-[#1B3345] text-[#F7F7F7] mt-2 shadow-xs cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="me-2 text-[#F7F7F7]" />
                  <span>{t("signingIn")}</span>
                </>
              ) : (
                <span>{t("signInButton")}</span>
              )}
            </Button>
          </form>

          {/* Need access helper text */}
          <p className="text-xs text-[#5F6C79] text-center mt-6">
            {t("needAccess")}
          </p>
        </div>
      </div>
    </div>
  );
}
