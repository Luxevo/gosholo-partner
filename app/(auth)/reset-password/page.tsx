"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Eye, EyeOff, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

function ResetPasswordForm() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [isValidSession, setIsValidSession] = useState(false)

  useEffect(() => {
    // Check if user has a valid session for password reset
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsValidSession(true)
      } else {
        setError("Lien de réinitialisation invalide ou expiré.")
      }
    }
    checkSession()
  }, [supabase.auth])

  const validatePassword = (pwd: string) => {
    if (pwd.length < 6) {
      return "Le mot de passe doit contenir au moins 6 caractères"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate password
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setIsLoading(false)
      return
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError("Erreur lors de la mise à jour du mot de passe. Veuillez réessayer.")
        console.error('Password update error:', error)
      } else {
        setIsSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (err) {
      setError("Erreur lors de la mise à jour du mot de passe. Veuillez réessayer.")
      console.error('Password update error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidSession && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-primary/5 via-white to-brand-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-brand-primary/20">
          <CardContent className="text-center p-8">
            <p className="text-brand-primary/70">Vérification du lien de réinitialisation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-primary/5 via-white to-brand-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-brand-primary/20">
          <CardContent className="text-center p-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-brand-light/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-brand-primary" />
            </div>
            <h2 className="text-xl font-bold text-brand-primary">Mot de passe mis à jour !</h2>
            <p className="text-brand-primary/70">
              Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion.
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
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/5 via-white to-brand-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo et titre */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-brand-primary rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">G</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-primary">Nouveau mot de passe</h1>
          <p className="text-brand-primary/70">Choisissez un nouveau mot de passe sécurisé</p>
        </div>

        {/* Formulaire */}
        <Card className="border-brand-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-brand-primary">Réinitialiser le mot de passe</CardTitle>
            <CardDescription>
              Entrez votre nouveau mot de passe ci-dessous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-brand-primary">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre nouveau mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-brand-primary/20 focus:border-brand-primary"
                    required
                    minLength={6}
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
                <p className="text-xs text-brand-primary/60">Minimum 6 caractères</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-brand-primary">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmez votre nouveau mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 border-brand-primary/20 focus:border-brand-primary"
                    required
                    minLength={6}
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
              </div>

              <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90" disabled={isLoading || !isValidSession}>
                {isLoading ? (
                  "Mise à jour..."
                ) : (
                  <>
                    Mettre à jour le mot de passe
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Loading component for Suspense fallback
function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/5 via-white to-brand-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-brand-primary/20">
        <CardContent className="text-center p-8">
          <p className="text-brand-primary/70">Chargement...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResetPasswordForm />
    </Suspense>
  )
}