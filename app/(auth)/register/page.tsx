"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, User, Mail, Lock, Phone, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "Le prénom est requis"
    if (!formData.lastName.trim()) newErrors.lastName = "Le nom est requis"
    if (!formData.email.trim()) newErrors.email = "L'email est requis"
    if (!formData.password) newErrors.password = "Le mot de passe est requis"
    if (formData.password.length < 6) newErrors.password = "Le mot de passe doit contenir au moins 6 caractères"

    if (!acceptTerms) newErrors.terms = "Vous devez accepter les conditions d'utilisation"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    setErrors({})
    const supabase = createClient()

    // Create user account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          phone: formData.phone,
          first_name: formData.firstName,
          last_name: formData.lastName,
        }
      }
    })

    if (signUpError || !signUpData.user) {
      setIsLoading(false)
      setErrors({ email: signUpError?.message || "Erreur lors de la création du compte" })
      return
    }

    // Create profile in database
    if (signUpData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: signUpData.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Don't fail registration if profile creation fails
      }
    }

    setIsLoading(false)
    setIsSuccess(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-primary/5 via-white to-brand-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-brand-primary/20">
          <CardContent className="text-center p-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-brand-primary">Inscription réussie !</h2>
            <p className="text-brand-primary/70">
              Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.
            </p>
            <Button asChild className="w-full bg-brand-primary hover:bg-brand-primary/90">
              <Link href="/login">
                Se connecter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/5 via-white to-brand-secondary/5 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Logo et titre */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-brand-primary rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">G</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-primary">Rejoignez Gosholo Partner</h1>
          <p className="text-brand-primary/70">Créez votre compte commerçant et boostez votre visibilité</p>
        </div>

        {/* Avantages */}
        <Card className="border-brand-primary/20 bg-brand-primary/5">
          <CardContent className="p-6">
            <h3 className="font-semibold text-brand-primary mb-3">Pourquoi choisir Gosholo ?</h3>
            <ul className="space-y-2 text-sm text-brand-primary/80">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-brand-secondary mr-2" />
                Augmentez votre visibilité locale
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-brand-secondary mr-2" />
                Créez des offres et événements facilement
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-brand-secondary mr-2" />
                Boostez vos contenus pour plus d'impact
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-brand-secondary mr-2" />
                Tableau de bord complet et intuitif
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Formulaire d'inscription */}
        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle className="text-xl text-brand-primary">Créer votre compte</CardTitle>
            <CardDescription>Remplissez les informations ci-dessous pour créer votre compte commerçant</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="font-medium text-brand-primary">Informations personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-brand-primary">
                      Prénom *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                      <Input
                        id="firstName"
                        placeholder="Jean"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="pl-10 border-brand-primary/20 focus:border-brand-primary"
                      />
                    </div>
                    {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-brand-primary">
                      Nom *
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Dupont"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="border-brand-primary/20 focus:border-brand-primary"
                    />
                    {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-brand-primary">
                      Email *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="jean@exemple.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10 border-brand-primary/20 focus:border-brand-primary"
                      />
                    </div>
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-brand-primary">
                      Téléphone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="01 23 45 67 89"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="pl-10 border-brand-primary/20 focus:border-brand-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-4">
                <h3 className="font-medium text-brand-primary">Sécurité</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-brand-primary">
                      Mot de passe *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 6 caractères"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pl-10 pr-10 border-brand-primary/20 focus:border-brand-primary"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-brand-primary/50" />
                        ) : (
                          <Eye className="h-4 w-4 text-brand-primary/50" />
                        )}
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                  </div>
                </div>
              </div>

              {/* Conditions d'utilisation */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(Boolean(checked))}
                />
                <Label htmlFor="acceptTerms" className="text-sm text-brand-primary/80">
                  J'accepte les{" "}
                  <Link href="/terms" className="underline hover:text-brand-primary">
                    conditions d'utilisation
                  </Link>{" "}
                  *
                </Label>
              </div>
              {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}

              {/* Bouton submit */}
              <Button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Chargement..." : "Créer mon compte"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-brand-primary/80">
          Vous avez déjà un compte ?{" "}
          <Link href="/login" className="underline hover:text-brand-primary">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  )
}