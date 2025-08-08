"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, Save, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Profile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string | null
  updated_at: string | null
}

interface ProfileEditFlowProps {
  profile: Profile
  onCancel: () => void
  onProfileUpdated: () => void
}

export default function ProfileEditFlow({ profile, onCancel, onProfileUpdated }: ProfileEditFlowProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    phone: profile?.phone || "",
  })

  const validateForm = () => {
    const errors = []
    if (!form.first_name.trim()) errors.push('Prénom requis')
    if (!form.last_name.trim()) errors.push('Nom requis')
    if (form.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(form.phone)) {
      errors.push('Numéro de téléphone invalide')
    }
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
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) {
        console.error('Error updating profile:', error)
        toast({
          title: "Erreur",
          description: "Erreur lors de la mise à jour du profil",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      })

      onProfileUpdated()
    } catch (error) {
      console.error('Unexpected error updating profile:', error)
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors de la mise à jour",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl w-full mx-auto border-primary/20 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <User className="h-5 w-5" />
          Modifier le profil
        </CardTitle>
        <CardDescription>
          Mettez à jour vos informations personnelles
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="font-medium text-primary">Informations personnelles</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-primary">
                Prénom *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-primary/50" />
                <Input
                  id="first_name"
                  placeholder="Jean"
                  value={form.first_name}
                  onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-primary">
                Nom *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-primary/50" />
                <Input
                  id="last_name"
                  placeholder="Dupont"
                  value={form.last_name}
                  onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-primary">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-primary/50" />
              <Input
                id="email"
                value={profile?.email || ""}
                disabled
                className="pl-10 bg-gray-50"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              L'email ne peut pas être modifié. Contactez le support si nécessaire.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-primary">
              Téléphone (optionnel)
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-primary/50" />
              <Input
                id="phone"
                placeholder="+33 6 12 34 56 78"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading || !form.first_name.trim() || !form.last_name.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
