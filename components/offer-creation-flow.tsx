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

interface OfferCreationFlowProps {
  onCancel?: () => void
  commerceId?: string
}

export default function OfferCreationFlow({ onCancel, commerceId }: OfferCreationFlowProps) {
  const supabase = createClient()
  const { refreshCounts } = useDashboard()
  const [isLoading, setIsLoading] = useState(false)
  const [commerces, setCommerces] = useState<Array<{id: string, name: string, category: string, address: string}>>([])
  const [form, setForm] = useState({
    title: "",
    short_description: "",
    type: "en_magasin" as "en_magasin" | "en_ligne" | "les_deux",
    business_address: "",
    conditions: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    selectedCommerceId: commerceId || "",
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
          if (commercesData && commercesData.length === 1 && !commerceId) {
            setForm(f => ({ ...f, selectedCommerceId: commercesData[0].id }))
          }
        }
      } catch (error) {
        console.error('Error loading commerces:', error)
      }
    }
    loadCommerces()
  }, [commerceId])

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

      // Insert offer into database
      const { data: offerData, error: insertError } = await supabase
        .from('offers')
        .insert({
          commerce_id: targetCommerceId,
          user_id: user.id,
          title: form.title,
          description: form.short_description,
          offer_type: form.type === "en_magasin" ? "in_store" : 
                     form.type === "en_ligne" ? "online" : "both",
          uses_commerce_location: !form.business_address,
          custom_location: form.business_address || null,
          condition: form.conditions || null,
          is_active: true, // Explicitly set as active
        })
        .select()
        .single()

      if (insertError) {
        console.error('Database insert error:', insertError)
        setIsLoading(false)
        return
      }

      console.log('Offer created:', offerData)
      
      // Refresh dashboard counts
      refreshCounts()
      
      // Reset form and close
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
      
      if (onCancel) {
        onCancel()
      }
    } catch (error) {
      console.error('Unexpected error adding offer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl w-full mx-auto p-6 border-primary/20 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-primary">Créer une nouvelle offre</CardTitle>
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
            {isLoading ? "Sauvegarde..." : "Créer l'offre"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
