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

interface EventCreationFlowProps {
  onCancel?: () => void
  editingEvent?: {
    id: string
    commerce_id: string
    title: string
    description: string
    picture: string
    uses_commerce_location: boolean
    custom_location: string
    condition: string
    created_at: string
    updated_at: string
  }
  onEventUpdated?: () => void
}

export default function EventCreationFlow({ onCancel, editingEvent, onEventUpdated }: EventCreationFlowProps) {
  const supabase = createClient()
  const { refreshCounts } = useDashboard()
  const [isLoading, setIsLoading] = useState(false)
  const [commerces, setCommerces] = useState<Array<{id: string, name: string, category: string, address: string}>>([])
  
  const [form, setForm] = useState({
    title: editingEvent?.title || "",
    description: editingEvent?.description || "",
    picture: editingEvent?.picture || "",
    uses_commerce_location: editingEvent?.uses_commerce_location ?? true,
    custom_location: editingEvent?.custom_location || "",
    condition: editingEvent?.condition || "",
    selectedCommerceId: editingEvent?.commerce_id || "",
  })

  // Load user's commerces
  useEffect(() => {
    if (!editingEvent) {
      const loadCommerces = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: commercesData } = await supabase
              .from('commerces')
              .select('id, name, category, address')
              .eq('user_id', user.id)
            setCommerces(commercesData || [])
            
            // Auto-select commerce if only one available
            if (commercesData && commercesData.length === 1) {
              setForm(f => ({ ...f, selectedCommerceId: commercesData[0].id }))
            }
          }
        } catch (error) {
          console.error('Error loading commerces:', error)
        }
      }
      loadCommerces()
    }
  }, [editingEvent])

  const handleSaveEvent = async () => {
    if (!form.title || !form.description || (!editingEvent && !form.selectedCommerceId)) {
      console.error('Missing required fields:', { 
        title: !!form.title, 
        description: !!form.description, 
        commerce: !!form.selectedCommerceId 
      })
      setIsLoading(false)
      return
    }

    // Validate location logic
    if (!form.uses_commerce_location && !form.custom_location.trim()) {
      console.error('Custom location required when not using commerce location')
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

      if (editingEvent) {
        // Update existing event
        const { data: eventData, error: updateError } = await supabase
          .from('events')
          .update({
            title: form.title,
            description: form.description,
            picture: form.picture || null,
            uses_commerce_location: form.uses_commerce_location,
            custom_location: form.uses_commerce_location ? null : form.custom_location,
            condition: form.condition || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingEvent.id)
          .select()
          .single()

        if (updateError) {
          console.error('Database update error:', updateError)
          setIsLoading(false)
          return
        }

        console.log('Event updated:', eventData)
        
        // Refresh dashboard counts
        refreshCounts()
        
        if (onEventUpdated) {
          onEventUpdated()
        }
      } else {
        // Create new event - commerce selection is mandatory
        const targetCommerceId = form.selectedCommerceId
        
        if (!targetCommerceId) {
          console.error('No commerce selected - this should not happen due to validation')
          setIsLoading(false)
          return
        }

        // Insert event into database
        const { data: eventData, error: insertError } = await supabase
          .from('events')
          .insert({
            commerce_id: targetCommerceId,
            user_id: user.id,
            title: form.title,
            description: form.description,
            picture: form.picture || null,
            uses_commerce_location: form.uses_commerce_location,
            custom_location: form.uses_commerce_location ? null : form.custom_location,
            condition: form.condition || null,
          })
          .select()
          .single()

        if (insertError) {
          console.error('Database insert error:', insertError)
          setIsLoading(false)
          return
        }

        console.log('Event created:', eventData)
        
        // Refresh dashboard counts
        refreshCounts()
        
        // Reset form and close
        setForm({
          title: "",
          description: "",
          picture: "",
          uses_commerce_location: true,
          custom_location: "",
          condition: "",
          selectedCommerceId: "",
        })
        
        if (onCancel) {
          onCancel()
        }
      }
    } catch (error) {
      console.error('Unexpected error saving event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl w-full mx-auto p-6 border-primary/20 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-primary">
          {editingEvent ? "Modifier l'événement" : "Créer un nouvel événement"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Commerce Selection (only for new events) */}
        {!editingEvent && (
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
                  <p className="text-secondary mb-4">Vous devez d'abord créer un commerce avant de pouvoir créer un événement.</p>
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
          </div>
        )}

        {/* Event Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Titre de l'événement * <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ex: Atelier cuisine, Soirée networking, Lancement produit"
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
              placeholder="Description détaillée de votre événement"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Image de l'événement (optionnel)
            </label>
            <Input
              placeholder="URL de l'image"
              value={form.picture}
              onChange={e => setForm(f => ({ ...f, picture: e.target.value }))}
            />
            <div className="text-xs text-secondary mt-1">
              Ajouter une image attire 2x plus l'attention des utilisateurs.
            </div>
            {form.picture && (
              <img 
                src={form.picture} 
                alt="Aperçu" 
                className="mt-2 rounded w-32 h-32 object-cover" 
                onError={(e) => { 
                  const target = e.target as HTMLImageElement; 
                  target.style.display = 'none'; 
                }} 
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Lieu de l'événement
            </label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="commerce_location"
                  name="location_type"
                  checked={form.uses_commerce_location}
                  onChange={() => setForm(f => ({ ...f, uses_commerce_location: true }))}
                  className="text-primary"
                />
                <label htmlFor="commerce_location" className="text-sm text-primary">
                  Utiliser l'adresse du commerce
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="custom_location"
                  name="location_type"
                  checked={!form.uses_commerce_location}
                  onChange={() => setForm(f => ({ ...f, uses_commerce_location: false }))}
                  className="text-primary"
                />
                <label htmlFor="custom_location" className="text-sm text-primary">
                  Adresse spécifique
                </label>
              </div>
            </div>
          </div>

          {!form.uses_commerce_location && (
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Adresse spécifique * <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Adresse complète de l'événement"
                value={form.custom_location}
                onChange={e => setForm(f => ({ ...f, custom_location: e.target.value }))}
                required={!form.uses_commerce_location}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Conditions (optionnel)
            </label>
            <Textarea
              placeholder="Ex: Inscription requise, Limite 20 participants, Apporter votre matériel"
              value={form.condition}
              onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
              rows={3}
            />
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
            onClick={handleSaveEvent}
            disabled={isLoading || !form.title || !form.description || (!editingEvent && !form.selectedCommerceId) || (!form.uses_commerce_location && !form.custom_location.trim())}
          >
            {isLoading ? "Sauvegarde..." : (editingEvent ? "Modifier l'événement" : "Créer l'événement")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 