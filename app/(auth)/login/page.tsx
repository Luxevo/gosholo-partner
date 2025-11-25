"use client";

import type React from "react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Languages } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { TermsOfUse } from "@/components/terms-of-use";
import { PrivacyPolicy } from "@/components/privacy-policy";
import { useLanguage } from "@/contexts/language-context";
import { t } from "@/lib/category-translations";

function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, setLocale } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      setError(t('auth.incorrectCredentials', locale));
      setIsLoading(false);
      return;
    }

    // Add user to Brevo list
    try {
      await fetch('/api/brevo/add-user-to-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.user.email!,
          firstName: data.user.user_metadata?.first_name || '',
          lastName: data.user.user_metadata?.last_name || '',
          locale: data.user.user_metadata?.preferred_locale || locale,
        }),
      });
    } catch (error) {
      // Don't block login if Brevo fails
      console.error('Failed to add to Brevo:', error);
    }

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      // Create profile if it doesn't exist
      const { error: createProfileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          email: data.user.email!,
          first_name: data.user.user_metadata?.first_name || null,
          last_name: data.user.user_metadata?.last_name || null,
          phone: data.user.user_metadata?.phone || null,
        });

      if (createProfileError) {
        console.error("Error creating profile:", createProfileError);
      }
    }

    // Redirect to the originally requested page or dashboard
    const redirectTo = searchParams.get("redirectedFrom") || "/dashboard";
    router.push(redirectTo);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/5 via-white to-brand-secondary/5 flex items-center justify-center p-4 py-8 sm:py-4 overflow-auto">
      <div className="w-full max-w-md space-y-4 sm:space-y-6 animate-in fade-in-50 duration-300">
        {/* Logo Section */}
        <div className="text-center space-y-2 sm:space-y-3 flex flex-col items-center">
          <div className="relative w-48 h-16 sm:w-64 sm:h-24 overflow-hidden transition-transform hover:scale-105 duration-300">
            <Image
              src="/logo.png"
              alt="Gosholo Logo"
              fill
              className="object-cover scale-[1.8]"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-bold text-brand-primary">
              {t('auth.welcomeTitle', locale)}
            </h1>
            <p className="text-brand-primary/70 text-xs">
              {t('auth.welcomeSubtitle', locale)}
            </p>
          </div>
        </div>

        <Card className="border-brand-primary/10 shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-2 pb-4 sm:pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg sm:text-xl font-semibold text-brand-primary">
                {t('auth.loginTitle', locale)}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
                className="flex items-center gap-2 h-8"
              >
                <Languages className="h-4 w-4" />
                <span className="font-medium">{locale === 'fr' ? 'FR' : 'EN'}</span>
              </Button>
            </div>
            <CardDescription className="text-center text-brand-primary/70 text-xs sm:text-sm">
              {t('auth.loginDescription', locale)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {error && (
                <Alert className="border-red-200/50 bg-red-50/50 animate-in fade-in-50 slide-in-from-top-2 duration-300">
                  <AlertDescription className="text-red-700 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-brand-primary font-medium text-sm"
                >
                  {t('auth.emailLabel', locale)}
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder', locale)}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-10 sm:h-12 border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-brand-primary font-medium text-sm"
                >
                  {t('auth.passwordLabel', locale)}
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('auth.passwordPlaceholder', locale)}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 h-10 sm:h-12 border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 hover:bg-brand-primary/10 rounded-md transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-brand-primary/60" />
                    ) : (
                      <Eye className="h-4 w-4 text-brand-primary/60" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-end pt-1">
                <Link
                  href="/forgot-password"
                  className="text-sm text-brand-primary hover:text-brand-primary/80 underline underline-offset-4 transition-colors"
                >
                  {t('auth.forgotPassword', locale)}
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-10 sm:h-12 bg-brand-primary hover:bg-brand-primary/90 transition-all duration-200 font-medium text-sm sm:text-base shadow-md hover:shadow-lg disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('auth.loggingIn', locale)}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>{t('auth.loginButton', locale)}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center space-y-3">
          <p className="text-sm text-brand-primary/70">
            {t('auth.noAccount', locale)}{" "}
            <Link
              href="/register"
              className="text-brand-primary hover:text-brand-primary/80 font-semibold underline underline-offset-4 transition-colors"
            >
              {t('auth.createAccount', locale)}
            </Link>
          </p>

          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed">
              {t('auth.loginAcceptTerms', locale)}{" "}
              <TermsOfUse>
                <button className="text-brand-primary hover:underline">
                  {t('auth.termsOfUse', locale)}
                </button>
              </TermsOfUse>{" "}
              {t('auth.andOur', locale)}{" "}
              <PrivacyPolicy>
                <button className="text-brand-primary hover:underline">
                  {t('auth.privacyPolicy', locale)}
                </button>
              </PrivacyPolicy>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          {t('auth.loading', 'fr')}
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
