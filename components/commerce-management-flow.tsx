"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useDashboard } from "@/contexts/dashboard-context"
import { useToast } from "@/hooks/use-toast"

interface Commerce {
  id: string
  user_id: string
  name: string
  description: string
  address: string
  category: string
  email: string
  phone: string
  website: string
  image_url: string
  status: string
  created_at: string
  updated_at: string
}

interface CommerceManagementFlowProps {
  commerce: Commerce
  onCancel?: () => void
  onCommerceUpdated?: () => void
}

const COMMERCE_CATEGORIES = [
  { value: "Restaurant", label: "Restaurant" },
  { value: "Café", label: "Café" },
  { value: "Boulangerie", label: "Boulangerie" },
  { value: "Épicerie", label: "Épicerie" },
  { value: "Commerce", label: "Commerce" },
  { value: "Service", label: "Service" },
  { value: "Santé", label: "Santé" },
  { value: "Beauté", label: "Beauté" },
  { value: "Sport", label: "Sport" },
  { value: "Culture", label: "Culture" },
  { value: "Éducation", label: "Éducation" },
  { value: "Autre", label: "Autre" }
]

export default function CommerceManagementFlow({ commerce, onCancel, onCommerceUpdated }: CommerceManagementFlowProps) {
  const supabase = createClient()
  const { refreshCounts } = useDashboard()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  const [form, setForm] = useState({
    name: commerce.name || "",
    description: commerce.description || "",
    address: commerce.address || "",
    category: commerce.category || "",
    email: commerce.email || "",
    phone: commerce.phone || "",
    website: commerce.website || "",
    image_url: commerce.image_url || "",
  })

  const validateForm = () => {
    const errors = []
    if (!form.name.trim()) errors.push('Nom du commerce requis')
    if (!form.description.trim()) errors.push('Description requise')
    if (!form.address.trim()) errors.push('Adresse requise')
    if (!form.category) errors.push('Catégorie requise')
    if (!form.email.trim()) errors.push('Email requis')
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const handleSaveCommerce = async () => {
    const validation = validateForm()
    if (!validation.isValid) {
      toast({
        title: "Erreur de validation",
        description: `Veuillez corriger les erreurs suivantes : ${validation.errors.join(', ')}`,
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Authentication error:', userError)
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour modifier un commerce",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      // Update commerce in database
      const { data: commerceData, error: updateError } = await supabase
        .from('commerces')
        .update({
          name: form.name.trim(),
          description: form.description.trim(),
          address: form.address.trim(),
          category: form.category,
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          website: form.website.trim() || null,
          image_url: form.image_url.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commerce.id)
        .select()
        .single()

      if (updateError) {
        console.error('Database update error:', updateError)
        toast({
          title: "Erreur",
          description: "Erreur lors de la mise à jour du commerce",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      console.log('Commerce updated:', commerceData)
      
      toast({
        title: "Succès",
        description: "Commerce mis à jour avec succès",
      })
      
      // Refresh dashboard counts
      refreshCounts()
      
      if (onCommerceUpdated) {
        onCommerceUpdated()
      }
    } catch (error) {
      console.error('Unexpected error updating commerce:', error)
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
    <Card className="max-w-2xl w-full mx-auto p-6 border-primary/20 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-primary">
          Gérer le commerce
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Commerce Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Nom du commerce * <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ex: Boulangerie du Centre"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Description * <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Description de votre commerce"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Adresse * <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Adresse complète du commerce"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Catégorie * <span className="text-red-500">*</span>
            </label>
            <Select value={form.category} onValueChange={(value) => setForm(f => ({ ...f, category: value }))}>
              <SelectTrigger className={!form.category ? "border-red-300 focus:border-red-500" : ""}>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {COMMERCE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Email * <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="contact@commerce.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Téléphone (optionnel)
            </label>
            <Input
              type="tel"
              placeholder="+33 1 23 45 67 89"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Site web (optionnel)
            </label>
            <Input
              type="url"
              placeholder="https://www.commerce.com"
              value={form.website}
              onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Image du commerce (optionnel)
            </label>
            <Input
              type="url"
              placeholder="URL de l'image"
              value={form.image_url}
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
            />
            <div className="text-xs text-secondary mt-1">
              Ajouter une image améliore la visibilité de votre commerce.
            </div>
            {form.image_url && (
              <img 
                src={form.image_url} 
                alt="Aperçu" 
                className="mt-2 rounded w-32 h-32 object-cover" 
                onError={(e) => { 
                  const target = e.target as HTMLImageElement; 
                  target.style.display = 'none'; 
                }} 
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4 border-t">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button 
            className="bg-accent hover:bg-accent/80 text-white flex-1" 
            onClick={handleSaveCommerce}
            disabled={isLoading || !form.name || !form.description || !form.address || !form.category || !form.email}
          >
            {isLoading ? "Sauvegarde..." : "Mettre à jour le commerce"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
