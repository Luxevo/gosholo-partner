"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useDashboard } from "@/contexts/dashboard-context"

interface Offer {
  id: string
  commerce_id: string
  user_id: string
  title: string
  description: string
  picture: string | null
  offer_type: "in_store" | "online" | "both"
  uses_commerce_location: boolean
  custom_location: string | null
  condition: string | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

interface OfferCreationFlowProps {
  onCancel?: () => void
  commerceId?: string
  offer?: Offer // For editing existing offers
}

export default function OfferCreationFlow({ onCancel, commerceId, offer }: OfferCreationFlowProps) {
  const supabase = createClient()
  const { refreshCounts } = useDashboard()
  const [isLoading, setIsLoading] = useState(false)
  const [commerces, setCommerces] = useState<Array<{id: string, name: string, category: string, address: string}>>([])
  
  // Determine if we're in edit mode
  const isEditMode = !!offer
  
  // Initialize form with offer data if editing, otherwise with defaults
  const [form, setForm] = useState({
    title: offer?.title || "",
    short_description: offer?.description || "",
    type: offer?.offer_type === "in_store" ? "en_magasin" as "en_magasin" | "en_ligne" | "les_deux" :
          offer?.offer_type === "online" ? "en_ligne" as "en_magasin" | "en_ligne" | "les_deux" :
          "les_deux" as "en_magasin" | "en_ligne" | "les_deux",
    business_address: offer?.custom_location || "",
    conditions: offer?.condition || "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    selectedCommerceId: offer?.commerce_id || commerceId || "",
  })

  // Load user's commerces
  useEffect(() => {
    const loadCommerces = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: commercesData } = await supabase
            .from('commerces')
            .select('id, name, category, address')
            .eq('user_id', user.id)
          setCommerces(commercesData || [])
          
          // Auto-select commerce if only one available and no commerceId provided
          if (commercesData && commercesData.length === 1 && !commerceId && !offer) {
            setForm(f => ({ ...f, selectedCommerceId: commercesData[0].id }))
          }
        }
      } catch (error) {
        console.error('Error loading commerces:', error)
      }
    }
    loadCommerces()
  }, [commerceId, offer])

  const handleSaveOffer = async () => {
    if (!form.title || !form.short_description || !form.selectedCommerceId) {
      console.error('Missing required fields:', { 
        title: !!form.title, 
        description: !!form.short_description, 
        commerce: !!form.selectedCommerceId 
      })
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Authentication error:', userError)
        setIsLoading(false)
        return
      }

      // Use selected commerce - this is now mandatory
      const targetCommerceId = form.selectedCommerceId
      
      if (!targetCommerceId) {
        console.error('No commerce selected - this should not happen due to validation')
        setIsLoading(false)
        return
      }

      const offerData = {
        commerce_id: targetCommerceId,
        user_id: user.id,
        title: form.title,
        description: form.short_description,
        offer_type: form.type === "en_magasin" ? "in_store" : 
                   form.type === "en_ligne" ? "online" : "both",
        uses_commerce_location: !form.business_address,
        custom_location: form.business_address || null,
        condition: form.conditions || null,
      }

      let result
      
      if (isEditMode && offer) {
        // Update existing offer
        const { data: updateData, error: updateError } = await supabase
          .from('offers')
          .update({
            ...offerData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', offer.id)
          .select()
          .single()

        if (updateError) {
          console.error('Database update error:', updateError)
          setIsLoading(false)
          return
        }

        result = updateData
        console.log('Offer updated:', result)
      } else {
        // Create new offer
        const { data: insertData, error: insertError } = await supabase
          .from('offers')
          .insert({
            ...offerData,
            is_active: true, // Explicitly set as active for new offers
          })
          .select()
          .single()

        if (insertError) {
          console.error('Database insert error:', insertError)
          setIsLoading(false)
          return
        }

        result = insertData
        console.log('Offer created:', result)
      }
      
      // Refresh dashboard counts
      refreshCounts()
      
      // Reset form and close
      if (!isEditMode) {
        setForm({
          title: "",
          short_description: "",
          type: "en_magasin",
          business_address: "",
          conditions: "",
          startDate: format(new Date(), "yyyy-MM-dd"),
          endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
          selectedCommerceId: "",
        })
      }
      
      if (onCancel) {
        onCancel()
      }
    } catch (error) {
      console.error('Unexpected error saving offer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl w-full mx-auto p-6 border-primary/20 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-primary">
          {isEditMode ? "Modifier l'offre" : "Créer une nouvelle offre"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Commerce Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Commerce * <span className="text-red-500">*</span>
            </label>
            {commerces.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-red-500 mb-2">
                  <Store className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-medium">Aucun commerce disponible</p>
                </div>
                <p className="text-secondary mb-4">Vous devez d'abord créer un commerce avant de pouvoir créer une offre.</p>
                <Button variant="outline" onClick={onCancel}>
                  Retour au tableau de bord
                </Button>
              </div>
            ) : (
              <Select 
                value={form.selectedCommerceId} 
                onValueChange={(value) => setForm(f => ({ ...f, selectedCommerceId: value }))}
                disabled={isEditMode} // Disable commerce selection in edit mode
              >
                <SelectTrigger className={!form.selectedCommerceId ? "border-red-300 focus:border-red-500" : ""}>
                  <SelectValue placeholder="Sélectionner un commerce (obligatoire)" />
                </SelectTrigger>
                <SelectContent>
                  {commerces.map((commerce) => (
                    <SelectItem key={commerce.id} value={commerce.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{commerce.name}</span>
                        <span className="text-xs text-secondary">{commerce.category} • {commerce.address}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Offer Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Titre de l'offre * <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Ex: 2 cafés pour $5, 10% sur tout"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Description * <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Description courte (max 250 caractères)"
                maxLength={250}
                value={form.short_description}
                onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
                required
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Type d'offre
              </label>
              <Select value={form.type} onValueChange={(value: any) => setForm(f => ({ ...f, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_magasin">En magasin</SelectItem>
                  <SelectItem value="en_ligne">En ligne</SelectItem>
                  <SelectItem value="les_deux">Les deux</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Adresse spécifique (optionnel)
              </label>
              <Input
                placeholder="Adresse spécifique pour cette offre"
                value={form.business_address}
                onChange={e => setForm(f => ({ ...f, business_address: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Conditions (optionnel)
              </label>
              <Textarea
                placeholder="Ex: Valable pour les 100 premiers clients. Limite 1 par personne."
                value={form.conditions}
                onChange={e => setForm(f => ({ ...f, conditions: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Date de début
                </label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Date de fin
                </label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>
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
            onClick={handleSaveOffer}
            disabled={isLoading || !form.title || !form.short_description || !form.selectedCommerceId}
          >
            {isLoading ? "Sauvegarde..." : (isEditMode ? "Mettre à jour l'offre" : "Créer l'offre")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
