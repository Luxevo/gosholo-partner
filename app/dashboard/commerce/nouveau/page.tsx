"use client"

import { useRouter } from "next/navigation"
import { useDashboard } from "@/contexts/dashboard-context"
import { useLanguage } from "@/contexts/language-context"
import { t } from "@/lib/category-translations"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import CommerceCreationFlow from "@/components/commerce-creation-flow"

export default function NouveauCommercePage() {
  const router = useRouter()
  const { refreshCounts } = useDashboard()
  const { locale } = useLanguage()

  const handleSuccess = () => {
    refreshCounts()
    localStorage.setItem('justCreatedCommerce', 'true')
    router.push('/dashboard')
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mb-4 -ml-2 h-10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('offers.backToDashboard', locale)}
        </Button>
        <h1 className="text-2xl font-bold text-primary">
          {t('dashboard.createBusinessProfile', locale)}
        </h1>
        <p className="text-primary/70 mt-1">
          {t('dashboard.enterBusinessInfo', locale)}
        </p>
      </div>

      <CommerceCreationFlow
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
