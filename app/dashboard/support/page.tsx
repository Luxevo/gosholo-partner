"use client"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { t } from "@/lib/category-translations"
import { FaqSection } from "@/components/faq-section"

export default function SupportPage() {
  const { locale } = useLanguage()
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("") // Clear error when user types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/support/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setSubmitted(true)
      setForm({ name: "", email: "", message: "" })
    } catch (err) {
      console.error('Error submitting form:', err)
      setError(locale === 'fr'
        ? 'Erreur lors de l\'envoi du message. Veuillez réessayer.'
        : 'Error sending message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-1">{t('support.title', locale)}</h1>
          <p className="text-primary/70 text-sm lg:text-base mb-4">{t('support.subtitle', locale)}</p>
        </div>
        <Card className="bg-white border border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-primary">{t('support.contactForm', locale)}</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div>
                <div className="text-green-600 font-medium py-4 mb-4">
                  {t('support.thankYouMessage', locale)}
                </div>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="w-full"
                >
                  {locale === 'fr' ? 'Envoyer un autre message' : 'Send another message'}
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                <div>
                  <Input
                    name="name"
                    placeholder={t('support.yourName', locale)}
                    value={form.name}
                    onChange={handleChange}
                    className="h-12 sm:h-10"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div>
                  <Input
                    name="email"
                    type="email"
                    placeholder={t('support.yourEmail', locale)}
                    value={form.email}
                    onChange={handleChange}
                    className="h-12 sm:h-10"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div>
                  <Textarea
                    name="message"
                    placeholder={t('support.yourMessage', locale)}
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    className="min-h-[120px] sm:min-h-[100px]"
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-accent hover:bg-accent/80 text-white w-full h-12 sm:h-10"
                  disabled={isLoading}
                >
                  {isLoading
                    ? (locale === 'fr' ? 'Envoi en cours...' : 'Sending...')
                    : t('support.send', locale)
                  }
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        {/* FAQ Section */}
        <FaqSection />
      </div>
    </div>
  )
}
