"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useDashboard } from "@/contexts/dashboard-context"

interface EventCreationFlowProps {
  onCancel?: () => void
  editingEvent?: {
    id: string
    commerce_id: string
    title: string
    short_description: string
    image_url: string
    location: string
    conditions: string
    max_participants: number
    participants_count: number
    status: "active" | "inactive" | "brouillon" | "draft" | "actif" | "inactif"
    start_date: string
    end_date: string
    created_at: string
    updated_at: string
  }
  onEventUpdated?: () => void
}

export default function EventCreationFlow({ onCancel, editingEvent, onEventUpdated }: EventCreationFlowProps) {
  const supabase = createClient()
  const { refreshCounts } = useDashboard()
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [commerces, setCommerces] = useState<Array<{id: string, name: string, type: string, address: string}>>([])
  
  const steps = [
    editingEvent ? "Modifier votre événement" : "Sélectionner le commerce",
    editingEvent ? "Disponibilité" : "Créer votre événement",
    editingEvent ? "Aperçu" : "Disponibilité",
    editingEvent ? "Confirmation" : "Aperçu",
    editingEvent ? "" : "Confirmation & Boost"
  ]
  
  const [form, setForm] = useState({
    title: editingEvent?.title || "",
    short_description: editingEvent?.short_description || "",
    image_url: editingEvent?.image_url || "",
    location: editingEvent?.location || "",
    conditions: editingEvent?.conditions || "",
    max_participants: editingEvent?.max_participants || 50,
    status: editingEvent?.status || "brouillon" as "active" | "inactive" | "brouillon" | "draft" | "actif" | "inactif",
    start_date: editingEvent?.start_date ? format(new Date(editingEvent.start_date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    start_time: editingEvent?.start_date ? format(new Date(editingEvent.start_date), "HH:mm") : "18:00",
    end_date: editingEvent?.end_date ? format(new Date(editingEvent.end_date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    end_time: editingEvent?.end_date ? format(new Date(editingEvent.end_date), "HH:mm") : "22:00",
    selectedCommerceId: editingEvent?.commerce_id || "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(editingEvent?.image_url || null)

  // Load user's commerces
  useEffect(() => {
    if (!editingEvent) {
      const loadCommerces = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: commercesData } = await supabase
              .from('commerces')
              .select('id, name, type, address')
              .eq('profile_id', user.id)
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
    if (!form.title || !form.short_description || !form.location || (!editingEvent && !form.selectedCommerceId)) {
      console.error('Missing required fields:', { 
        title: !!form.title, 
        description: !!form.short_description, 
        location: !!form.location,
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

      // Create datetime strings
      const startDateTime = `${form.start_date}T${form.start_time}:00.000Z`
      const endDateTime = `${form.end_date}T${form.end_time}:00.000Z`

      if (editingEvent) {
        // Update existing event
        const { data: eventData, error: updateError } = await supabase
          .from('events')
          .update({
            title: form.title,
            short_description: form.short_description,
            image_url: form.image_url || null,
            location: form.location,
            conditions: form.conditions || null,
            max_participants: form.max_participants,
            status: form.status,
            start_date: startDateTime,
            end_date: endDateTime,
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
            title: form.title,
            short_description: form.short_description,
            image_url: form.image_url || null,
            location: form.location,
            conditions: form.conditions || null,
            max_participants: form.max_participants,
            status: form.status,
            start_date: startDateTime,
            end_date: endDateTime,
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
          short_description: "",
          image_url: "",
          location: "",
          conditions: "",
          max_participants: 50,
          status: "brouillon",
          start_date: format(new Date(), "yyyy-MM-dd"),
          start_time: "18:00",
          end_date: format(new Date(), "yyyy-MM-dd"),
          end_time: "22:00",
          selectedCommerceId: "",
        })
        setImagePreview(null)
        setStep(0)
        
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

  // Stepper UI
  const Stepper = () => (
    <div className="flex items-center justify-between mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex-1 flex flex-col items-center">
          <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm ${i === step ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>{i + 1}</div>
          <span className={`mt-2 text-xs text-center ${i === step ? 'text-primary font-semibold' : 'text-primary/60'}`}>{s}</span>
        </div>
      ))}
    </div>
  )

  // Step 0: Commerce Selection (only for new events)
  const Step0 = () => (
    <>
      <CardTitle className="text-lg text-primary mb-2">Sélectionner le commerce *</CardTitle>
      <div className="space-y-4">
        {commerces.length === 0 ? (
          <div className="text-center py-8">
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
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Choisir un commerce <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-secondary mb-2">
                Chaque événement doit être associé à un commerce spécifique.
              </p>
            </div>
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
                      <span className="text-xs text-secondary">{commerce.type} • {commerce.address}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.selectedCommerceId && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>✓ Commerce sélectionné:</strong> {commerces.find(c => c.id === form.selectedCommerceId)?.name}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Vous pouvez maintenant créer votre événement pour ce commerce.
                </p>
              </div>
            )}
            {!form.selectedCommerceId && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⚠ Attention:</strong> Vous devez sélectionner un commerce pour continuer.
                </p>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-between gap-2 mt-4">
          {onCancel && (
            <Button variant="outline" className="w-1/2" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button 
            className="bg-accent hover:bg-accent/80 text-white w-1/2" 
            onClick={() => setStep(1)}
            disabled={!form.selectedCommerceId}
          >
            Suivant : Créer l'événement
          </Button>
        </div>
      </div>
    </>
  )

  // Step 1: Event Details
  const Step1 = () => (
    <>
      <CardTitle className="text-lg text-primary mb-2">{editingEvent ? "Modifier votre événement" : "Créer votre événement"}</CardTitle>
      <div className="space-y-4">
        <Input
          placeholder="Titre de l'événement (ex: Dégustation gratuite ce samedi, Soirée DJ terrasse, Pop-up au Marché Jean-Talon)"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          required
        />
        <Textarea
          placeholder="Description courte (max 250 caractères)"
          maxLength={250}
          value={form.short_description}
          onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
          required
        />
        <div>
          <label className="block text-sm text-primary mb-1">Image de l'événement (optionnel)</label>
          <Input
            placeholder="URL de l'image"
            value={form.image_url}
            onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
          />
          <div className="text-xs text-secondary mt-1">Ajouter une image attire 2x plus l'attention des utilisateurs.</div>
          {form.image_url && <img src={form.image_url} alt="Aperçu" className="mt-2 rounded w-32 h-32 object-cover" onError={(e) => { const target = e.target as HTMLImageElement; target.style.display = 'none'; }} />}
        </div>
        <div>
          <label className="block text-sm text-primary mb-1">Lieu de l'événement</label>
          <Input
            placeholder="Adresse ou lieu de l'événement"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-primary mb-1">Nombre maximum de participants</label>
          <Input
            type="number"
            min="1"
            placeholder="50"
            value={form.max_participants}
            onChange={e => setForm(f => ({ ...f, max_participants: parseInt(e.target.value) || 1 }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-primary mb-1">Statut de l'événement</label>
          <Select value={form.status} onValueChange={(value: any) => setForm(f => ({ ...f, status: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brouillon">Brouillon</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-secondary mt-1">
            {(form.status === "draft" || form.status === "brouillon") && "L'événement est sauvegardé mais pas visible publiquement"}
            {(form.status === "active" || form.status === "actif") && "L'événement est visible et actif pour les utilisateurs"}
            {(form.status === "inactive" || form.status === "inactif") && "L'événement est désactivé et non visible"}
          </div>
        </div>
        <div>
          <label className="block text-sm text-primary mb-1">Conditions de l'événement (optionnel)</label>
          <Textarea
            placeholder="Ex: Gratuit pour les 50 premiers visiteurs. Merci d'arriver 10 min en avance."
            value={form.conditions}
            onChange={e => setForm(f => ({ ...f, conditions: e.target.value }))}
            rows={2}
          />
        </div>
        <div className="text-xs text-secondary mt-2">
          Vous pourrez marquer l'événement comme "complet" manuellement quand vous aurez atteint votre limite de participants.
        </div>
        <div className="flex justify-between gap-2 mt-4">
          <Button variant="outline" className="w-1/2" onClick={() => setStep(0)}>
            ← Retour
          </Button>
          <Button className="bg-accent hover:bg-accent/80 text-white w-1/2" onClick={() => setStep(2)}>
            Suivant : Disponibilité
          </Button>
        </div>
        {onCancel && (
          <Button variant="ghost" className="w-full mt-2" onClick={onCancel}>
            Annuler
          </Button>
        )}
      </div>
    </>
  )

  // Step 2: Availability
  const Step2 = () => (
    <>
      <CardTitle className="text-lg text-primary mb-2">Définir la durée de votre événement</CardTitle>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-primary mb-1">Date de début</label>
            <Input
              type="date"
              value={form.start_date}
              onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-primary mb-1">Heure de début</label>
            <Input
              type="time"
              value={form.start_time}
              onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-primary mb-1">Date de fin</label>
            <Input
              type="date"
              value={form.end_date}
              onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-primary mb-1">Heure de fin</label>
            <Input
              type="time"
              value={form.end_time}
              onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="text-xs text-secondary mt-2">
          Vous pourrez désactiver votre événement manuellement à tout moment.
        </div>
        <div className="flex justify-between gap-2 mt-4">
          <Button variant="outline" className="w-1/2" onClick={() => setStep(editingEvent ? 0 : 1)}>
            ← Retour
          </Button>
          <Button className="bg-accent hover:bg-accent/80 text-white w-1/2" onClick={() => setStep(editingEvent ? 2 : 3)}>
            Aperçu de mon événement
          </Button>
        </div>
        {onCancel && (
          <Button variant="ghost" className="w-full mt-2" onClick={onCancel}>
            Annuler
          </Button>
        )}
      </div>
    </>
  )

  // Step 3: Preview
  const Step3 = () => (
    <>
      <CardTitle className="text-lg text-primary mb-2">Aperçu de votre événement</CardTitle>
      <div className="space-y-4">
        <div className="font-bold text-primary text-lg">{form.title}</div>
        <div className="text-secondary text-sm">{form.short_description}</div>
        {form.image_url && <img src={form.image_url} alt="Aperçu" className="rounded w-32 h-32 object-cover" onError={(e) => { const target = e.target as HTMLImageElement; target.style.display = 'none'; }} />}
        <div className="text-sm text-primary">Lieu : <span className="text-secondary">{form.location}</span></div>
        <div className="text-sm text-primary">Statut : <span className="text-secondary">
          {form.status === "active" || form.status === "actif" ? "Active" : 
           form.status === "inactive" || form.status === "inactif" ? "Inactive" : 
           form.status === "draft" || form.status === "brouillon" ? "Brouillon" : form.status}
        </span></div>
        <div className="text-sm text-primary">Participants max : <span className="text-secondary">{form.max_participants}</span></div>
        <div className="text-sm text-primary">Du <span className="text-secondary">{form.start_date} {form.start_time}</span> au <span className="text-secondary">{form.end_date} {form.end_time}</span></div>
        {form.conditions && <div className="text-sm text-primary">Conditions : <span className="text-secondary">{form.conditions}</span></div>}
        <div className="flex justify-between gap-2 mt-4">
          <Button variant="outline" className="w-1/2" onClick={() => setStep(editingEvent ? 1 : 2)}>
            ← Retour
          </Button>
          <Button className="bg-accent hover:bg-accent/80 text-white w-1/2" onClick={() => setStep(editingEvent ? 3 : 4)}>
            Publier mon événement
          </Button>
        </div>
      </div>
    </>
  )

  // Step 4: Confirmation & Boost
  const Step4 = () => (
    <>
      <CardTitle className="text-lg text-primary mb-2">🎉 Votre événement est en ligne !</CardTitle>
      <div className="space-y-4">
        <div className="text-primary">Il est visible sur votre profil, la carte et les sections événements de l'app.</div>
        <div className="text-secondary text-sm">Vous pouvez le modifier ou le désactiver à tout moment. Les utilisateurs qui l'ont ajouté en favori seront notifiés de toute mise à jour ou désactivation.</div>
        <Button 
          className="bg-accent hover:bg-accent/80 text-white w-full mt-2"
          onClick={handleSaveEvent}
          disabled={isLoading}
        >
          {isLoading ? "Sauvegarde..." : editingEvent ? "Mettre à jour l'événement" : "Sauvegarder l'événement"}
        </Button>
        <Button variant="outline" className="w-full mt-2" onClick={() => setStep(0)}>
          {editingEvent ? "Modifier un autre événement" : "Créer un nouvel événement"}
        </Button>
        <Button variant="ghost" className="w-full mt-2" onClick={onCancel}>
          Retour au tableau de bord
        </Button>
      </div>
    </>
  )

  return (
    <Card className="max-w-2xl w-full mx-auto p-2 border-primary/20 shadow-none">
      <CardHeader className="pb-2">
        <Stepper />
      </CardHeader>
      <CardContent className="space-y-2 py-4">
        {step === 0 && (editingEvent ? <Step1 /> : <Step0 />)}
        {step === 1 && (editingEvent ? <Step2 /> : <Step1 />)}
        {step === 2 && (editingEvent ? <Step3 /> : <Step2 />)}
        {step === 3 && (editingEvent ? <Step4 /> : <Step3 />)}
        {step === 4 && !editingEvent && <Step4 />}
      </CardContent>
    </Card>
  )
} 