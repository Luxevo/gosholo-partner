"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export default function SupportPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    // Here you would send the form data to your backend or support system
  }

  return (
    <div>
      <div className="p-4 lg:p-6 max-w-xl mx-auto space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-1">Assistance</h1>
          <p className="text-primary/70 text-sm lg:text-base mb-4">Retrouvez ici toutes les réponses à vos questions et contactez-nous au besoin.</p>
        </div>
        <Card className="bg-white border border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Formulaire de contact rapide</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-primary font-medium py-4">Merci pour votre message ! Nous vous répondrons rapidement.</div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Input
                    name="name"
                    placeholder="Votre nom"
                    value={form.name}
                    onChange={handleChange}
                    className="h-12 sm:h-10"
                    required
                  />
                </div>
                <div>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Votre email"
                    value={form.email}
                    onChange={handleChange}
                    className="h-12 sm:h-10"
                    required
                  />
                </div>
                <div>
                  <Textarea
                    name="message"
                    placeholder="Votre message..."
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    className="min-h-[120px] sm:min-h-[100px]"
                    required
                  />
                </div>
                <Button type="submit" className="bg-accent hover:bg-accent/80 text-white w-full h-12 sm:h-10">Envoyer</Button>
              </form>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white border border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Contact direct</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium text-primary text-sm sm:text-base">Email :</span> 
              <a href="mailto:support@gosholo.com" className="text-accent underline text-sm sm:text-base">support@gosholo.com</a>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium text-primary text-sm sm:text-base">FAQ :</span> 
              <span className="text-secondary text-sm sm:text-base">(Bientôt disponible)</span>
            </div>
            {/* Future: Chat or built-in messaging */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
