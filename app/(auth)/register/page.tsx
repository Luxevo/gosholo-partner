"use client";

import React, { useState, Suspense } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  CheckCircle,
  MailCheck,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { TermsOfUse } from "@/components/terms-of-use";
import { PrivacyPolicy } from "@/components/privacy-policy";
import { useLanguage } from "@/contexts/language-context";
import { t } from "@/lib/category-translations";

function RegisterForm() {
  const { locale } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "Le prénom est requis";
    if (!formData.lastName.trim()) newErrors.lastName = "Le nom est requis";
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    if (formData.password.length < 6)
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";

    if (!acceptTerms)
      newErrors.terms = "Vous devez accepter les conditions d'utilisation";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    const supabase = createClient();

    // Create user account with metadata
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
          },
        },
      }
    );

    if (signUpError) {
      setIsLoading(false);
      setErrors({
        email: signUpError.message || "Erreur lors de la création du compte",
      });
      return;
    }

    if (!signUpData.user) {
      setIsLoading(false);
      setErrors({
        email: t('auth.checkEmailError', locale),
      });
      return;
    }

    setIsLoading(false);
    setIsSuccess(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (isSuccess) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/5 via-white to-brand-secondary/5 flex items-center justify-center p-4 py-8 sm:py-4 overflow-auto">
      <div className="w-full max-w-md space-y-4 sm:space-y-6 animate-in fade-in-50 duration-300">
          <Card className="border-brand-primary/10 shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm bg-white/95">
            <CardContent className="text-center p-4 sm:p-8 space-y-4 sm:space-y-5">
              <div className="mx-auto w-16 h-16 bg-brand-secondary/10 rounded-full flex items-center justify-center">
                <MailCheck className="h-8 w-8 text-brand-secondary" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-brand-primary">
                {t('auth.registrationSuccess', locale)}
              </h2>
              <div className="space-y-3">
                <p className="text-brand-primary/70 text-sm">
                  {t('auth.accountCreated', locale)}
                </p>
                <div className="bg-brand-secondary/10 border border-brand-secondary/30 rounded-lg p-3">
                  <p className="text-brand-primary text-sm font-medium">
                    {t('auth.checkEmail', locale)}
                  </p>
                  <p className="text-brand-primary/80 text-xs mt-1">
                    {t('auth.confirmationSent', locale)} <strong>{formData.email}</strong>.
                  </p>
                </div>
                <p className="text-brand-primary/60 text-xs">
                  {t('auth.loginAfterConfirmation', locale)}
                </p>
              </div>
              <Button
                asChild
                className="w-full h-9 sm:h-11 bg-brand-primary hover:bg-brand-primary/90"
              >
                <Link href="/login">
                  {t('auth.signIn', locale)}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/5 via-white to-brand-secondary/5 flex items-center justify-center p-4 py-6 sm:py-4 overflow-auto">
      <div className="w-full max-w-2xl space-y-3 sm:space-y-4 animate-in fade-in-50 duration-300 pt-2 sm:pt-6">
        {/* Logo Section */}
        <div className="text-center space-y-1 sm:space-y-2 flex flex-col items-center">
          <div className="relative w-48 h-16 sm:w-64 sm:h-24 overflow-hidden transition-transform hover:scale-105 duration-300">
            <Image
              src="/logo.png"
              alt="Gosholo Logo"
              fill
              className="object-cover scale-[1.8]"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-sm sm:text-lg font-bold text-brand-primary leading-tight">
            Crée ton compte pour accéder à ta plateforme entreprise Gosholo
            </h1>
            <p className="text-brand-primary/70 text-xs leading-tight px-2 sm:px-0">
            Ces informations servent uniquement à créer votre accès personnel au tableau de bord. Elles ne seront pas visibles sur votre profil ni dans l'application
            </p>
          </div>
        </div>

        {/* Formulaire d'inscription */}
        <Card className="border-brand-primary/10 shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-2 pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl font-semibold text-brand-primary text-center">
              Créer votre compte
            </CardTitle>
            <CardDescription className="text-center text-brand-primary/70 text-xs sm:text-sm">
              Remplissez les informations ci-dessous pour créer votre compte
              commerçant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Informations personnelles */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-medium text-brand-primary text-sm">
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-brand-primary font-medium text-sm"
                    >
                      Prénom *
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                      <Input
                        id="firstName"
                        placeholder="Jean"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className="pl-10 h-9 sm:h-11 border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200"
                        required
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-brand-primary font-medium text-sm"
                    >
                      Nom *
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Dupont"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="h-9 sm:h-11 border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200"
                      required
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-brand-primary font-medium text-sm"
                    >
                      Email *
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="jean@exemple.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="pl-10 h-9 sm:h-11 border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200"
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-brand-primary font-medium text-sm"
                    >
                      Téléphone
                    </Label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="012 234-6789"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="pl-10 h-9 sm:h-11 border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-3">
                <h3 className="font-medium text-brand-primary text-sm">
                  Sécurité
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-brand-primary font-medium text-sm"
                    >
                      Mot de passe *
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 6 caractères"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className="pl-10 pr-12 h-9 sm:h-11 border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9 hover:bg-brand-primary/10 rounded-md transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-brand-primary/60" />
                        ) : (
                          <Eye className="h-4 w-4 text-brand-primary/60" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Conditions d'utilisation */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) =>
                    setAcceptTerms(Boolean(checked))
                  }
                  className="mt-0.5 shrink-0"
                  style={{ 
                    height: '16px', 
                    width: '16px', 
                    minHeight: '16px', 
                    minWidth: '16px',
                    maxHeight: '16px',
                    maxWidth: '16px'
                  }}
                />
                <Label
                  htmlFor="acceptTerms"
                  className="text-xs sm:text-sm text-brand-primary/80 leading-tight"
                >
                  J'accepte les{" "}
                  <TermsOfUse>
                    <button type="button" className="underline hover:text-brand-primary">
                      conditions d'utilisation
                    </button>
                  </TermsOfUse>{" "}
                  *
                </Label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-600">{errors.terms}</p>
              )}

              {/* Bouton submit */}
              <Button
                type="submit"
                className="w-full h-9 sm:h-11 bg-brand-primary hover:bg-brand-primary/90 transition-all duration-200 font-medium text-sm sm:text-base shadow-md hover:shadow-lg disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Chargement...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Créer mon compte</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center space-y-3">
          <p className="text-sm text-brand-primary/70">
            Vous avez déjà un compte ?{" "}
            <Link
              href="/login"
              className="text-brand-primary hover:text-brand-primary/80 font-semibold underline underline-offset-4 transition-colors"
            >
              Connectez-vous
            </Link>
          </p>

          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed">
              En créant un compte, vous acceptez nos{" "}
              <TermsOfUse>
                <button className="text-brand-primary hover:underline">
                  conditions d'utilisation
                </button>
              </TermsOfUse>{" "}
              et notre{" "}
              <PrivacyPolicy>
                <button className="text-brand-primary hover:underline">
                  politique de confidentialité
                </button>
              </PrivacyPolicy>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Chargement...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
