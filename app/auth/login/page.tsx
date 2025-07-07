"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
  
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  
    if (error || !data.session) {
      setError("Email ou mot de passe incorrect.")
      setIsLoading(false)
      return
    }
  
    // 🔁 Vérifie la session actuelle
    const { data: sessionData } = await supabase.auth.getSession()
  
    if (sessionData.session) {
      router.push("/commerces")
    } else {
      setError("Une erreur est survenue. Veuillez réessayer.")
    }
  
    setIsLoading(false)
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/5 via-white to-brand-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-brand-primary rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">G</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-primary">Gosholo Partner</h1>
          <p className="text-brand-primary/70">Connectez-vous à votre tableau de bord</p>
        </div>

        <Alert className="border-brand-primary/20 bg-brand-primary/5">
          <AlertDescription className="text-sm">
            <strong>Compte de démonstration :</strong>
            <br />
            Email: demo@gosholo.com
            <br />
            Mot de passe: demo123
          </AlertDescription>
        </Alert>

        <Card className="border-brand-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-brand-primary">Connexion</CardTitle>
            <CardDescription>Entrez vos identifiants pour accéder à votre espace commerçant</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-brand-primary">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-brand-primary/20 focus:border-brand-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-brand-primary">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-brand-primary/20 focus:border-brand-primary"
                    required
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
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-brand-primary hover:text-brand-primary/80 underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90" disabled={isLoading}>
                {isLoading ? (
                  "Connexion..."
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-brand-primary/70">
            Pas encore de compte ?{" "}
            <Link
              href="/auth/register"
              className="text-brand-primary hover:text-brand-primary/80 font-medium underline"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
