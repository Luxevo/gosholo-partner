"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulation d'envoi d'email
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
    }, 2000)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-primary/5 via-white to-brand-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-brand-primary/20">
          <CardContent className="text-center p-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-brand-primary">Email envoyé !</h2>
            <p className="text-brand-primary/70">
              Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full bg-brand-primary hover:bg-brand-primary/90">
                <Link href="/auth/login">
                  Retour à la connexion
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsSuccess(false)}
                className="w-full border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5"
              >
                Renvoyer l'email
              </Button>
            </div>
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
          <h1 className="text-2xl font-bold text-brand-primary">Mot de passe oublié</h1>
          <p className="text-brand-primary/70">Entrez votre adresse email pour recevoir un lien de réinitialisation</p>
        </div>

        {/* Formulaire */}
        <Card className="border-brand-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-brand-primary">Réinitialiser le mot de passe</CardTitle>
            <CardDescription>
              Nous vous enverrons un email avec les instructions pour créer un nouveau mot de passe
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
                <Label htmlFor="email" className="text-brand-primary">
                  Adresse email
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

              <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90" disabled={isLoading}>
                {isLoading ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    Envoyer le lien de réinitialisation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lien retour */}
        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-sm text-brand-primary hover:text-brand-primary/80 underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}
