"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { format } from "date-fns"

const steps = [
  "Créer votre événement",
  "Disponibilité",
  "Aperçu",
  "Confirmation & Boost"
]

export default function EventCreationFlow() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    locationType: "business",
    manualLocation: "",
    conditions: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "18:00",
    endDate: format(new Date(), "yyyy-MM-dd"),
    endTime: "22:00",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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

  // Step 1: Event Details
  const Step1 = () => (
    <>
      <CardTitle className="text-lg text-primary mb-2">Créer votre événement</CardTitle>
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
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          required
        />
        <div>
          <label className="block text-sm text-primary mb-1">Image de l'événement (optionnel)</label>
          <Input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) {
                setForm(f => ({ ...f, image: file.name }))
                setImagePreview(URL.createObjectURL(file))
              }
            }}
          />
          <div className="text-xs text-secondary mt-1">Ajouter une image attire 2x plus l'attention des utilisateurs.</div>
          {imagePreview && <img src={imagePreview} alt="Aperçu" className="mt-2 rounded w-32 h-32 object-cover" />}
        </div>
        <div>
          <label className="block text-sm text-primary mb-1">Lieu de l'événement</label>
          <RadioGroup
            value={form.locationType}
            onValueChange={val => setForm(f => ({ ...f, locationType: val }))}
            className="flex gap-4"
          >
            <RadioGroupItem value="business" id="business" />
            <label htmlFor="business" className="mr-4">À l'adresse de mon commerce</label>
            <RadioGroupItem value="manual" id="manual" />
            <label htmlFor="manual">Autre lieu</label>
          </RadioGroup>
          {form.locationType === "manual" && (
            <Input
              className="mt-2"
              placeholder="Saisir un autre lieu (kiosque, festival, parc, etc.)"
              value={form.manualLocation}
              onChange={e => setForm(f => ({ ...f, manualLocation: e.target.value }))}
            />
          )}
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
        <Button className="bg-accent hover:bg-accent/80 text-white mt-4 w-full" onClick={() => setStep(1)}>
          Suivant : Disponibilité
        </Button>
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
              value={form.startDate}
              onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-primary mb-1">Heure de début</label>
            <Input
              type="time"
              value={form.startTime}
              onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-primary mb-1">Date de fin</label>
            <Input
              type="date"
              value={form.endDate}
              onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-primary mb-1">Heure de fin</label>
            <Input
              type="time"
              value={form.endTime}
              onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="text-xs text-secondary mt-2">
          Vous pourrez désactiver votre événement manuellement à tout moment.
        </div>
        <div className="flex justify-between gap-2 mt-4">
          <Button variant="outline" className="w-1/2" onClick={() => setStep(0)}>
            ← Retour
          </Button>
          <Button className="bg-accent hover:bg-accent/80 text-white w-1/2" onClick={() => setStep(2)}>
            Aperçu de mon événement
          </Button>
        </div>
      </div>
    </>
  )

  // Step 3: Preview
  const Step3 = () => (
    <>
      <CardTitle className="text-lg text-primary mb-2">Aperçu de votre événement</CardTitle>
      <div className="space-y-4">
        <div className="font-bold text-primary text-lg">{form.title}</div>
        <div className="text-secondary text-sm">{form.description}</div>
        {imagePreview && <img src={imagePreview} alt="Aperçu" className="rounded w-32 h-32 object-cover" />}
        <div className="text-sm text-primary">Lieu : <span className="text-secondary">{form.locationType === "business" ? "Adresse du commerce" : form.manualLocation || "Autre lieu"}</span></div>
        <div className="text-sm text-primary">Du <span className="text-secondary">{form.startDate} {form.startTime}</span> au <span className="text-secondary">{form.endDate} {form.endTime}</span></div>
        {form.conditions && <div className="text-sm text-primary">Conditions : <span className="text-secondary">{form.conditions}</span></div>}
        <div className="flex justify-between gap-2 mt-4">
          <Button variant="outline" className="w-1/2" onClick={() => setStep(1)}>
            ← Retour
          </Button>
          <Button className="bg-accent hover:bg-accent/80 text-white w-1/2" onClick={() => setStep(3)}>
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
        <Button className="bg-accent hover:bg-accent/80 text-white w-full mt-2">
          Booster cet événement
        </Button>
        <Button variant="outline" className="w-full mt-2">
          Créer un nouvel événement
        </Button>
        <Button variant="ghost" className="w-full mt-2" onClick={() => setStep(0)}>
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
        {step === 0 && <Step1 />}
        {step === 1 && <Step2 />}
        {step === 2 && <Step3 />}
        {step === 3 && <Step4 />}
      </CardContent>
    </Card>
  )
} 