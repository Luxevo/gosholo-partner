"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { t } from "@/lib/category-translations"

export default function SupportPage() {
  const { locale } = useLanguage()
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
          <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-1">{t('support.title', locale)}</h1>
          <p className="text-primary/70 text-sm lg:text-base mb-4">{t('support.subtitle', locale)}</p>
        </div>
        <Card className="bg-white border border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-primary">{t('support.contactForm', locale)}</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-primary font-medium py-4">{t('support.thankYouMessage', locale)}</div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Input
                    name="name"
                    placeholder={t('support.yourName', locale)}
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
                    placeholder={t('support.yourEmail', locale)}
                    value={form.email}
                    onChange={handleChange}
                    className="h-12 sm:h-10"
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
                    required
                  />
                </div>
                <Button type="submit" className="bg-accent hover:bg-accent/80 text-white w-full h-12 sm:h-10">{t('support.send', locale)}</Button>
              </form>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white border border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-primary">{t('support.directContact', locale)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium text-primary text-sm sm:text-base">{t('support.email', locale)} :</span> 
              <a href="mailto:support@gosholo.com" className="text-accent underline text-sm sm:text-base">support@gosholo.com</a>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium text-primary text-sm sm:text-base">{t('support.faq', locale)} :</span> 
              <span className="text-secondary text-sm sm:text-base">{t('support.comingSoon', locale)}</span>
            </div>
            {/* Future: Chat or built-in messaging */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
