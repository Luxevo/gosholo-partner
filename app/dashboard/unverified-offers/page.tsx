"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Loader2, Trash2, Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import CategorySelector from "@/components/category-selector"
import SubCategorySelector from "@/components/sub-category-selector"
import AddressAutocomplete from "@/components/address-autocomplete"
import { AddressSuggestion } from "@/lib/mapbox-geocoding"

interface GeoData {
  latitude: number
  longitude: number
  address: string
}

export default function UnverifiedOffersPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [isCheckingRole, setIsCheckingRole] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [geoData, setGeoData] = useState<GeoData | null>(null)
  const [categories, setCategories] = useState<Array<{ id: number; name_fr: string | null; name_en: string | null }>>([])
  const [unverifiedOffers, setUnverifiedOffers] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    commerce_name: "",
    title: "",
    description: "",
    offer_type: "in_store" as "in_store" | "online" | "both",
    category_id: null as number | null,
    sub_category_id: null as number | null,
    custom_location: "",
    postal_code: "",
    condition: "",
    source_url: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
  })

  // Vérifier que l'utilisateur est admin
  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.replace('/dashboard')
        return
      }

      setIsCheckingRole(false)

      // Charger les catégories pour la validation Restaurant
      const { data: cats } = await supabase.from('category').select('id, name_fr, name_en')
      setCategories(cats || [])

      // Charger les offres non vérifiées
      await fetchOffers()
    }
    checkRole()
  }, [])

  const handleEdit = (offer: any) => {
    setEditingId(offer.id)
    setForm({
      commerce_name: offer.commerce_name || "",
      title: offer.title || "",
      description: offer.description || "",
      offer_type: offer.offer_type || "in_store",
      category_id: offer.category_id || null,
      sub_category_id: offer.sub_category_id || null,
      custom_location: offer.custom_location || "",
      postal_code: offer.postal_code || "",
      condition: offer.condition || "",
      source_url: offer.source_url || "",
      start_date: offer.start_date || format(new Date(), "yyyy-MM-dd"),
      end_date: offer.end_date || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette offre ?')) return
    const res = await fetch('/api/unverified-offers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) await fetchOffers()
    else toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer l\'offre' })
  }

  const fetchOffers = async () => {
    const res = await fetch('/api/unverified-offers')
    if (res.ok) {
      const data = await res.json()
      setUnverifiedOffers(data.offers || [])
    }
  }

  const isRestaurantCategory = (categoryId: number | null): boolean => {
    if (!categoryId) return false
    const category = categories.find(c => c.id === categoryId)
    return category?.name_fr === 'Restaurant' || category?.name_en === 'Restaurant'
  }

  const handleSubmit = async () => {
    // Validation
    const errors = []
    if (!form.commerce_name) errors.push("Nom du commerce requis")
    if (!form.title) errors.push("Titre requis")
    if (!form.description) errors.push("Description requise")
    if (!form.source_url) errors.push("URL source requise")
    if (!form.start_date) errors.push("Date de début requise")
    if (!form.end_date) errors.push("Date de fin requise")
    if (!form.category_id) errors.push("Catégorie requise")
    if (form.end_date < form.start_date) errors.push("La date de fin doit être après la date de début")

    if (errors.length > 0) {
      toast({ variant: "destructive", title: "Erreurs", description: errors.join(', ') })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/unverified-offers', {
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

      setEditingId(null)
      await fetchOffers()
      handleReset()
      toast({ title: editingId ? "Offre modifiée" : "Offre ajoutée" })
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Une erreur inattendue s'est produite" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setGeoData(null)
    setForm({
      commerce_name: "",
      title: "",
      description: "",
      offer_type: "in_store",
      category_id: null,
      sub_category_id: null,
      custom_location: "",
      postal_code: "",
      condition: "",
      source_url: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    })
  }

  if (isCheckingRole) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl text-primary">
            {editingId ? "Modifier l'offre" : "Ajouter une offre non vérifiée"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Nom du commerce */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Nom du commerce <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ex: Boulangerie Martin"
              value={form.commerce_name}
              onChange={e => setForm(f => ({ ...f, commerce_name: e.target.value }))}
            />
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Titre de l'offre <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ex: 2 croissants achetés, 1 offert"
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
              placeholder="Décrivez l'offre en détail..."
              maxLength={250}
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Type d'offre <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.offer_type}
              onValueChange={(value: "in_store" | "online" | "both") =>
                setForm(f => ({ ...f, offer_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_store">En magasin</SelectItem>
                <SelectItem value="online">En ligne</SelectItem>
                <SelectItem value="both">Les deux</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <CategorySelector
              value={form.category_id}
              onValueChange={(value) => setForm(f => ({ ...f, category_id: value, sub_category_id: null }))}
              placeholder="Sélectionner une catégorie"
            />
          </div>

          {/* Sous-catégorie */}
          {form.category_id && (
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Sous-catégorie
                {isRestaurantCategory(form.category_id) && <span className="text-red-500"> *</span>}
              </label>
              <SubCategorySelector
                categoryId={form.category_id}
                value={form.sub_category_id}
                onValueChange={(value) => setForm(f => ({ ...f, sub_category_id: value }))}
                placeholder="Sélectionner une sous-catégorie"
              />
            </div>
          )}

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
              placeholder="Ex: Valable le week-end seulement, sur présentation de ce message..."
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

          {/* URL Source */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              URL source <span className="text-red-500">*</span>
            </label>
            <Input
              type="url"
              placeholder="https://..."
              value={form.source_url}
              onChange={e => setForm(f => ({ ...f, source_url: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground mt-1">Le lien où vous avez trouvé cette offre</p>
          </div>

          {/* Bouton */}
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
              ) : editingId ? "Modifier l'offre" : "Ajouter l'offre"}
            </Button>
          </div>

        </CardContent>
      </Card>
      {/* Liste des offres non vérifiées */}
      {unverifiedOffers.length > 0 && (
        <div className="mt-8 max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-primary mb-4">
            Offres saisies ({unverifiedOffers.length})
          </h2>
          <div className="space-y-3">
            {unverifiedOffers.map((offer) => (
              <Card key={offer.id} className="border-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-primary truncate">{offer.title}</p>
                      <p className="text-sm text-muted-foreground">{offer.commerce_name}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{offer.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${offer.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {offer.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {offer.end_date && (
                        <p className="text-xs text-muted-foreground">
                          Fin : {new Date(offer.end_date).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-primary/60 hover:text-primary hover:bg-primary/5"
                          onClick={() => handleEdit(offer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(offer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {offer.source_url && (
                    <a
                      href={offer.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-primary underline mt-2 block truncate"
                    >
                      {offer.source_url}
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
