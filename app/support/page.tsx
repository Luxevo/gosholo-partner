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
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-1">Support</h1>
          <p className="text-primary/70 text-sm lg:text-base mb-4">Contactez-nous rapidement ou consultez la FAQ</p>
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
                    required
                  />
                </div>
                <Button type="submit" className="bg-accent hover:bg-accent/80 text-white w-full">Envoyer</Button>
              </form>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white border border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Contact direct</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <span className="font-medium text-primary">Email :</span> <a href="mailto:support@gosholo.com" className="text-accent underline">support@gosholo.com</a>
            </div>
            <div className="mb-2">
              <span className="font-medium text-primary">FAQ :</span> <span className="text-secondary">(Bientôt disponible)</span>
            </div>
            {/* Future: Chat or built-in messaging */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
