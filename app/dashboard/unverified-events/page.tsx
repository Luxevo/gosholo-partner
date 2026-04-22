"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { Loader2, Trash2, Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import CategoryEventsSelector from "@/components/category-events-selector"
import AddressAutocomplete from "@/components/address-autocomplete"
import { AddressSuggestion } from "@/lib/mapbox-geocoding"

interface GeoData {
  latitude: number
  longitude: number
  address: string
}

export default function UnverifiedEventsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [isCheckingRole, setIsCheckingRole] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [geoData, setGeoData] = useState<GeoData | null>(null)
  const [unverifiedEvents, setUnverifiedEvents] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    commerce_name: "",
    title: "",
    description: "",
    category_events_id: null as number | null,
    custom_location: "",
    postal_code: "",
    condition: "",
    source: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
  })

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.replace('/dashboard'); return }

      setIsCheckingRole(false)
      await fetchEvents()
    }
    checkRole()
  }, [])

  const fetchEvents = async () => {
    const res = await fetch('/api/unverified-events')
    if (res.ok) {
      const data = await res.json()
      setUnverifiedEvents(data.events || [])
    }
  }

  const handleEdit = (event: any) => {
    setEditingId(event.id)
    setForm({
      commerce_name: event.commerce_name || "",
      title: event.title || "",
      description: event.description || "",
      category_events_id: event.category_events_id || null,
      custom_location: event.custom_location || "",
      postal_code: event.postal_code || "",
      condition: event.condition || "",
      source: event.source || "",
      start_date: event.start_date || format(new Date(), "yyyy-MM-dd"),
      end_date: event.end_date || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet événement ?')) return
    const res = await fetch('/api/unverified-events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) await fetchEvents()
    else toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de supprimer l'événement" })
  }

  const handleReset = () => {
    setGeoData(null)
    setForm({
      commerce_name: "",
      title: "",
      description: "",
      category_events_id: null,
      custom_location: "",
      postal_code: "",
      condition: "",
      source: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    })
  }

  const handleSubmit = async () => {
    const errors = []
    if (!form.commerce_name) errors.push("Nom du commerce requis")
    if (!form.title) errors.push("Titre requis")
    if (!form.description) errors.push("Description requise")
    if (!form.start_date) errors.push("Date de début requise")
    if (!form.end_date) errors.push("Date de fin requise")
    if (form.end_date < form.start_date) errors.push("La date de fin doit être après la date de début")

    if (errors.length > 0) {
      toast({ variant: "destructive", title: "Erreurs", description: errors.join(', ') })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/unverified-events', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          ...form,
          latitude: geoData?.latitude || null,
          longitude: geoData?.longitude || null,
          custom_location: form.custom_location || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({ variant: "destructive", title: "Erreur", description: data.error })
        return
      }

      const wasEditing = editingId
      setEditingId(null)
      await fetchEvents()
      handleReset()
      toast({ title: wasEditing ? "Événement modifié" : "Événement ajouté" })
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Une erreur inattendue s'est produite" })
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingRole) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl text-primary">
              {editingId ? "Modifier l'événement" : "Ajouter un événement non vérifié"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Nom du commerce */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Nom du commerce <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Ex: Salle des fêtes de Paris"
                value={form.commerce_name}
                onChange={e => setForm(f => ({ ...f, commerce_name: e.target.value }))}
              />
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Titre de l'événement <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Ex: Concert de jazz du vendredi"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Décrivez l'événement en détail..."
                maxLength={250}
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Catégorie
              </label>
              <CategoryEventsSelector
                value={form.category_events_id}
                onValueChange={(value) => setForm(f => ({ ...f, category_events_id: value }))}
                placeholder="Sélectionner une catégorie"
              />
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Adresse
              </label>
              <AddressAutocomplete
                value={form.custom_location}
                onChange={(value) => setForm(f => ({ ...f, custom_location: value }))}
                onSelect={(suggestion: AddressSuggestion) => {
                  setForm(f => ({
                    ...f,
                    custom_location: suggestion.place_name,
                    postal_code: suggestion.postal_code,
                  }))
                  setGeoData({
                    latitude: suggestion.latitude,
                    longitude: suggestion.longitude,
                    address: suggestion.place_name,
                  })
                }}
                placeholder="Rechercher une adresse..."
              />
            </div>

            {/* Conditions */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Conditions <span className="text-muted-foreground text-xs">(optionnel)</span>
              </label>
              <Textarea
                placeholder="Ex: Entrée payante, réservation obligatoire..."
                rows={2}
                value={form.condition}
                onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Date de début <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Date de fin <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={form.end_date}
                  min={form.start_date}
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                />
              </div>
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Source <span className="text-muted-foreground text-xs">(optionnel)</span>
              </label>
              <Input
                placeholder="Ex: Facebook, Journal de Montréal, https://..."
                value={form.source}
                onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">Où avez-vous trouvé cet événement ?</p>
            </div>

            {/* Boutons */}
            <div className="pt-2 border-t flex gap-3">
              {editingId && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setEditingId(null); handleReset() }}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
              )}
              <Button
                className="flex-1 bg-accent hover:bg-accent/80 text-white"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : editingId ? "Modifier l'événement" : "Ajouter l'événement"}
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Liste des événements non vérifiés */}
        {unverifiedEvents.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-primary mb-4">
              Événements saisis ({unverifiedEvents.length})
            </h2>
            <div className="space-y-3">
              {unverifiedEvents.map((event) => (
                <Card key={event.id} className="border-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary truncate">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.commerce_name}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{event.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${event.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {event.is_active ? 'Actif' : 'Inactif'}
                        </span>
                        {event.end_date && (
                          <p className="text-xs text-muted-foreground">
                            Fin : {new Date(event.end_date).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-primary/60 hover:text-primary hover:bg-primary/5"
                            onClick={() => handleEdit(event)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {event.source && (
                      <a
                        href={event.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-primary underline mt-2 block truncate"
                      >
                        {event.source}
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
