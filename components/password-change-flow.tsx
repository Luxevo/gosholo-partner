"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Eye, EyeOff, Save, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface PasswordChangeFlowProps {
  onCancel: () => void
  onPasswordChanged: () => void
}

export default function PasswordChangeFlow({ onCancel, onPasswordChanged }: PasswordChangeFlowProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const validateForm = () => {
    const errors = []
    
    if (!form.currentPassword) errors.push('Mot de passe actuel requis')
    if (!form.newPassword) errors.push('Nouveau mot de passe requis')
    if (form.newPassword.length < 6) errors.push('Le nouveau mot de passe doit contenir au moins 6 caractères')
    if (form.newPassword !== form.confirmPassword) errors.push('Les mots de passe ne correspondent pas')
    if (form.currentPassword === form.newPassword) errors.push('Le nouveau mot de passe doit être différent de l\'actuel')
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const handleSave = async () => {
    const validation = validateForm()
    if (!validation.isValid) {
      toast({
        title: "Erreur de validation",
        description: validation.errors.join(', '),
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      // First, verify the current password
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        toast({
          title: "Erreur",
          description: "Erreur d'authentification",
          variant: "destructive"
        })
        return
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: form.newPassword
      })

      if (error) {
        console.error('Error updating password:', error)
        toast({
          title: "Erreur",
          description: error.message || "Erreur lors du changement de mot de passe",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Succès",
        description: "Mot de passe mis à jour avec succès",
      })

      // Reset form
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      onPasswordChanged()
    } catch (error) {
      console.error('Unexpected error updating password:', error)
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors du changement de mot de passe",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <Card className="max-w-2xl w-full mx-auto border-primary/20 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Changer le mot de passe
        </CardTitle>
        <CardDescription>
          Mettez à jour votre mot de passe pour sécuriser votre compte
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Password Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-primary">
              Mot de passe actuel *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-primary/50" />
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                placeholder="Votre mot de passe actuel"
                value={form.currentPassword}
                onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
                className="pl-10 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-primary">
              Nouveau mot de passe *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-primary/50" />
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                placeholder="Nouveau mot de passe (min. 6 caractères)"
                value={form.newPassword}
                onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                className="pl-10 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-primary">
              Confirmer le nouveau mot de passe *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-primary/50" />
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Confirmez le nouveau mot de passe"
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className="pl-10 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Security Tips */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Conseils de sécurité</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Utilisez au moins 6 caractères</li>
            <li>• Combinez lettres, chiffres et symboles</li>
            <li>• Évitez les informations personnelles</li>
            <li>• Ne partagez jamais votre mot de passe</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading || !form.currentPassword || !form.newPassword || !form.confirmPassword}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Mise à jour..." : "Changer le mot de passe"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
