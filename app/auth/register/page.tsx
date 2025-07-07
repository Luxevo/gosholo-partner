"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff, User, Mail, Lock, Building, MapPin, Phone, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessType: "",
    address: "",
    city: "",
    postalCode: "",
    description: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    }
    if (!formData.businessName.trim()) newErrors.businessName = "Le nom du commerce est requis"
    if (!acceptTerms) newErrors.terms = "Vous devez accepter les conditions d'utilisation"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Simulation d'inscription
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
    }, 2000)
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
              <Link href="/auth/login">
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
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-brand-primary">
                      Confirmer le mot de passe *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Répétez votre mot de passe"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="pl-10 pr-10 border-brand-primary/20 focus:border-brand-primary"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-brand-primary/50" />
                        ) : (
                          <Eye className="h-4 w-4 text-brand-primary/50" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              {/* Informations commerce */}
              <div className="space-y-4">
                <h3 className="font-medium text-brand-primary">Informations de votre commerce</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-brand-primary">
                      Nom du commerce *
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                      <Input
                        id="businessName"
                        placeholder="Café des Arts"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange("businessName", e.target.value)}
                        className="pl-10 border-brand-primary/20 focus:border-brand-primary"
                      />
                    </div>
                    {errors.businessName && <p className="text-sm text-red-600">{errors.businessName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType" className="text-brand-primary">
                      Type de commerce
                    </Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(value) => handleInputChange("businessType", value)}
                    >
                      <SelectTrigger className="border-brand-primary/20 focus:border-brand-primary">
                        <SelectValue placeholder="Sélectionnez votre secteur d'activité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="cafe">Café / Bar</SelectItem>
                        <SelectItem value="mode">Mode / Vêtements</SelectItem>
                        <SelectItem value="beaute">Beauté / Bien-être</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="alimentation">Alimentation</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address" className="text-brand-primary">
                        Adresse
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                        <Input
                          id="address"
                          placeholder="123 rue de la Paix"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="pl-10 border-brand-primary/20 focus:border-brand-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-brand-primary">
                        Code postal
                      </Label>
                      <Input
                        id="postalCode"
                        placeholder="75001"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        className="border-brand-primary/20 focus:border-brand-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-brand-primary">
                      Ville
                    </Label>
                    <Input
                      id="city"
                      placeholder="Paris"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="border-brand-primary/20 focus:border-brand-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-brand-primary">
                      Description (optionnel)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez brièvement votre commerce..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="border-brand-primary/20 focus:border-brand-primary"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Conditions d'utilisation */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="terms" className="text-sm text-brand-primary cursor-pointer">
                      J'accepte les{" "}
                      <Link href="#" className="underline hover:text-brand-primary/80">
                        conditions d'utilisation
                      </Link>{" "}
                      et la{" "}
                      <Link href="#" className="underline hover:text-brand-primary/80">
                        politique de confidentialité
                      </Link>
                    </Label>
                    {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90" disabled={isLoading}>
                {isLoading ? (
                  "Création du compte..."
                ) : (
                  <>
                    Créer mon compte
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lien vers connexion */}
        <div className="text-center">
          <p className="text-sm text-brand-primary/70">
            Vous avez déjà un compte ?{" "}
            <Link href="/auth/login" className="text-brand-primary hover:text-brand-primary/80 font-medium underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
