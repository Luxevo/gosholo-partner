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

const steps = [
  "Sélectionner le commerce",
  "Créer votre offre",
  "Disponibilité",
  "Aperçu",
  "Confirmation & Boost"
]

interface OfferCreationFlowProps {
  onCancel?: () => void
  commerceId?: string
}

export default function OfferCreationFlow({ onCancel, commerceId }: OfferCreationFlowProps) {
  const supabase = createClient()
  const { refreshCounts } = useDashboard()
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [commerces, setCommerces] = useState<Array<{id: string, name: string, type: string, address: string}>>([])
  const [form, setForm] = useState({
    title: "",
    short_description: "",
    image_url: "",
    type: "en_magasin" as "en_magasin" | "en_ligne" | "les_deux",
    business_address: "",
    conditions: "",
    status: "brouillon" as "active" | "inactive" | "brouillon" | "draft" | "actif" | "inactif",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    selectedCommerceId: commerceId || "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Load user's commerces
  useEffect(() => {
    const loadCommerces = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: commercesData } = await supabase
            .from('commerces')
            .select('id, name, type, address')
            .eq('profile_id', user.id)
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
          title: form.title,
          short_description: form.short_description,
          image_url: form.image_url || null,
          type: form.type,
          business_address: form.business_address || null,
          conditions: form.conditions || null,
          status: form.status,
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
        image_url: "",
        type: "en_magasin",
        business_address: "",
        conditions: "",
        status: "brouillon",
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        selectedCommerceId: "",
      })
      setImagePreview(null)
      setStep(0)
      
      if (onCancel) {
        onCancel()
      }
    } catch (error) {
      console.error('Unexpected error adding offer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 0: Commerce Selection
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
            <p className="text-secondary mb-4">Vous devez d'abord créer un commerce avant de pouvoir créer une offre.</p>
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
                Chaque offre doit être associée à un commerce spécifique.
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
                  Vous pouvez maintenant créer votre offre pour ce commerce.
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
            Suivant : Créer l'offre
          </Button>
        </div>
      </div>
    </>
  )

  // Step 1: Offer Details
  const Step1 = () => (
    <>
      <CardTitle className="text-lg text-primary mb-2">Créer votre offre</CardTitle>
      <div className="space-y-4">
        <Input
          placeholder="Titre de l'offre (ex: 2 cafés pour 5€, 10% sur tout)"
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
          <label className="block text-sm text-primary mb-1">Image de l'offre (optionnel)</label>
          <Input
            placeholder="URL de l'image"
            value={form.image_url}
            onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
          />
          <div className="text-xs text-secondary mt-1">Ajouter une image attire 2x plus l'attention des utilisateurs.</div>
          {form.image_url && <img src={form.image_url} alt="Aperçu" className="mt-2 rounded w-32 h-32 object-cover" onError={(e) => { const target = e.target as HTMLImageElement; target.style.display = 'none'; }} />}
        </div>
        <div>
          <label className="block text-sm text-primary mb-1">Type d'offre</label>
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
          <label className="block text-sm text-primary mb-1">Statut de l'offre</label>
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
            {(form.status === "draft" || form.status === "brouillon") && "L'offre est sauvegardée mais pas visible publiquement"}
            {(form.status === "active" || form.status === "actif") && "L'offre est visible et active pour les utilisateurs"}
            {(form.status === "inactive" || form.status === "inactif") && "L'offre est désactivée et non visible"}
          </div>
        </div>
        <div>
          <label className="block text-sm text-primary mb-1">Adresse de l'offre (optionnel)</label>
          <Input
            placeholder="Adresse spécifique pour cette offre"
            value={form.business_address}
            onChange={e => setForm(f => ({ ...f, business_address: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm text-primary mb-1">Conditions de l'offre (optionnel)</label>
          <Textarea
            placeholder="Ex: Valable pour les 100 premiers clients. Limite 1 par personne. Présentation en magasin requise."
            value={form.conditions}
            onChange={e => setForm(f => ({ ...f, conditions: e.target.value }))}
            rows={2}
          />
        </div>
        <div className="text-xs text-secondary mt-2">
          Vous pourrez marquer l'offre comme "complète" manuellement quand vous aurez atteint votre limite de clients, en magasin ou en ligne.
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
      <CardTitle className="text-lg text-primary mb-2">Définir la durée de votre offre</CardTitle>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-primary mb-1">Date de début</label>
          <Input
            type="date"
            value={form.startDate}
            onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-primary mb-1">Date de fin</label>
          <Input
            type="date"
            value={form.endDate}
            onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
            required
          />
        </div>
        <div className="text-xs text-secondary mt-2">
          Vous pourrez désactiver votre offre manuellement à tout moment.
        </div>
        <div className="flex justify-between gap-2 mt-4">
          <Button variant="outline" className="w-1/2" onClick={() => setStep(1)}>
            ← Retour
          </Button>
          <Button className="bg-accent hover:bg-accent/80 text-white w-1/2" onClick={() => setStep(3)}>
            Aperçu de mon offre
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
      <CardTitle className="text-lg text-primary mb-2">Aperçu de votre offre</CardTitle>
      <div className="space-y-4">
        <div className="font-bold text-primary text-lg">{form.title}</div>
        <div className="text-secondary text-sm">{form.short_description}</div>
        {form.image_url && <img src={form.image_url} alt="Aperçu" className="rounded w-32 h-32 object-cover" onError={(e) => { const target = e.target as HTMLImageElement; target.style.display = 'none'; }} />}
        <div className="text-sm text-primary">Type : <span className="text-secondary">{form.type}</span></div>
        <div className="text-sm text-primary">Statut : <span className="text-secondary">
          {form.status === "active" || form.status === "actif" ? "Active" : 
           form.status === "inactive" || form.status === "inactif" ? "Inactive" : 
           form.status === "draft" || form.status === "brouillon" ? "Brouillon" : form.status}
        </span></div>
        {form.business_address && <div className="text-sm text-primary">Adresse : <span className="text-secondary">{form.business_address}</span></div>}
        <div className="text-sm text-primary">Du <span className="text-secondary">{form.startDate}</span> au <span className="text-secondary">{form.endDate}</span></div>
        {form.conditions && <div className="text-sm text-primary">Conditions : <span className="text-secondary">{form.conditions}</span></div>}
        <div className="flex justify-between gap-2 mt-4">
          <Button variant="outline" className="w-1/2" onClick={() => setStep(2)}>
            ← Retour
          </Button>
          <Button className="bg-accent hover:bg-accent/80 text-white w-1/2" onClick={() => setStep(4)}>
            Publier mon offre
          </Button>
        </div>
      </div>
    </>
  )

  // Step 4: Confirmation & Boost
  const Step4 = () => (
    <>
      <CardTitle className="text-lg text-primary mb-2">🎉 Votre offre est en ligne !</CardTitle>
      <div className="space-y-4">
        <div className="text-primary">Elle est visible sur votre profil, la carte et les sections principales de l'app.</div>
        <div className="text-secondary text-sm">Vous pouvez la modifier ou la désactiver à tout moment. Les utilisateurs qui l'ont ajoutée en favori seront notifiés de toute mise à jour ou désactivation.</div>
        <Button 
          className="bg-accent hover:bg-accent/80 text-white w-full mt-2"
          onClick={handleSaveOffer}
          disabled={isLoading}
        >
          {isLoading ? "Sauvegarde..." : "Sauvegarder l'offre"}
        </Button>
        <Button variant="outline" className="w-full mt-2" onClick={() => setStep(0)}>
          Créer une nouvelle offre
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
        {step === 0 && <Step0 />}
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}
      </CardContent>
    </Card>
  )
}
