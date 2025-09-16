"use client"

import React, { useState, useEffect } from "react"
import { useDashboard } from "@/contexts/dashboard-context"
import { useLanguage } from "@/contexts/language-context"
import { t } from "@/lib/category-translations"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
 } from "@/components/ui/dialog"
import { Store, Plus, Zap, X } from "lucide-react"
import CommerceCreationFlow from "@/components/commerce-creation-flow"
import CommerceCard from "@/components/commerce-card"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const { userProfile, commerces, isLoading, refreshCounts } = useDashboard()
  const { locale } = useLanguage()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showBoostPopup, setShowBoostPopup] = useState(false)
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const router = useRouter()

  // Afficher le popup de bienvenue si l'utilisateur n'a pas de commerce
  useEffect(() => {
    if (!isLoading && commerces.length === 0) {
      // Toujours afficher le popup s'il n'y a pas de commerce
      setShowWelcomePopup(true)
      // S'assurer que le popup de boost est fermé
      setShowBoostPopup(false)
    }
  }, [commerces.length, isLoading])

  // Afficher le popup de boost après la création du premier commerce
  useEffect(() => {
    if (!isLoading && commerces.length === 1) {
      // Vérifier si l'utilisateur vient de créer un commerce
      const justCreatedCommerce = localStorage.getItem('justCreatedCommerce')
      const hasSeenBoostPopup = localStorage.getItem('hasSeenBoostPopup')
      
      if (justCreatedCommerce && !hasSeenBoostPopup) {
        // Fermer le popup de bienvenue et afficher le popup de boost
        setShowWelcomePopup(false)
        setShowBoostPopup(true)
        // Nettoyer le flag
        localStorage.removeItem('justCreatedCommerce')
      }
    }
  }, [commerces.length, isLoading])

  const handleWelcomePopupClose = () => {
    setShowWelcomePopup(false)
    // Ne pas sauvegarder dans localStorage - le popup réapparaîtra au prochain rafraîchissement
  }

  const handleCreateCommerce = () => {
    setShowWelcomePopup(false)
    setIsDialogOpen(true)
  }

  const handleCommerceCreated = () => {
    // Fermer le dialog de création
    setIsDialogOpen(false)
    // Rafraîchir les données
    refreshCounts()
    // Marquer qu'on vient de créer un commerce pour déclencher le popup de boost
    localStorage.setItem('justCreatedCommerce', 'true')
  }

  const handleBoostPopupClose = () => {
    setShowBoostPopup(false)
    localStorage.setItem('hasSeenBoostPopup', 'true')
  }

  const handleGoToBoosts = () => {
    setShowBoostPopup(false)
    localStorage.setItem('hasSeenBoostPopup', 'true')
    router.push('/dashboard/boosts')
  }


  // Get user's display name
  const getUserDisplayName = () => {
    if (!userProfile) return t('header.partner', locale)

    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`
    } else if (userProfile.first_name) {
      return userProfile.first_name
    } else if (userProfile.last_name) {
      return userProfile.last_name
    } else {
      // Fallback to email or generic name
      return userProfile.email.split('@')[0] || t('header.partner', locale)
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#005266] mb-1">
          {t('dashboard.title', locale)}
        </h1>
        <p className="text-gray-600">
          {t('dashboard.subtitle', locale)}
        </p>
      </div>

      {/* Commerce Cards Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">{t('dashboard.yourCommerces', locale)}</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto h-12 sm:h-10">
                <Plus className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                {t('dashboard.addCommerce', locale)}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-none sm:max-w-[600px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>{t('dashboard.createBusinessProfile', locale)}</DialogTitle>
                <DialogDescription>
                {t('dashboard.enterBusinessInfo', locale)}
                </DialogDescription>
              </DialogHeader>
              <CommerceCreationFlow 
                onCancel={() => {
                  setIsDialogOpen(false)
                  refreshCounts()
                }}
                onSuccess={handleCommerceCreated}
              />
            </DialogContent>
          </Dialog>
        </div>
        {isLoading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2 sm:mt-4">{t('dashboard.loadingCommerces', locale)}</p>
          </div>
        ) : commerces.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {commerces.map((commerce) => (
              <CommerceCard key={commerce.id} commerce={commerce} onRefresh={refreshCounts} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8 sm:py-12">
              <Store className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 sm:mb-3">{t('dashboard.noCommerce', locale)}</h3>
              <p className="text-gray-600 mb-4 sm:mb-6">{t('dashboard.startWithFirstCommerce', locale)}</p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="h-12 sm:h-10 w-full sm:w-auto"
              >
                <Plus className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                {t('dashboard.addCommerce', locale)}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Popup de bienvenue si l'utilisateur n'a pas de commerce */}
      <Dialog open={showWelcomePopup} onOpenChange={setShowWelcomePopup}>
        <DialogContent className="w-[95vw] max-w-none sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-brand-primary">
              {t('dashboard.beVisibleToday', locale)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/10 rounded-full mb-4">
                <Store className="h-8 w-8 text-brand-primary" />
              </div>
              <p className="text-gray-600 text-base leading-relaxed">
                {t('dashboard.welcomeMessage', locale)}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={handleCreateCommerce}
                className="flex-1 bg-brand-primary hover:bg-brand-primary/90 h-12 sm:h-10"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('dashboard.addBusiness', locale)}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleWelcomePopupClose}
                className="h-12 sm:h-10"
              >
                {t('dashboard.later', locale)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Popup de boost après création du premier commerce */}
      <Dialog open={showBoostPopup} onOpenChange={setShowBoostPopup}>
        <DialogContent className="w-[95vw] max-w-none sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-brand-primary">
              {t('dashboard.makeCommerceShine', locale)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-accent/10 rounded-full mb-4">
                <Zap className="h-8 w-8 text-brand-accent" />
              </div>
              <p className="text-gray-600 text-base leading-relaxed">
                {locale === 'fr' ? (
                  <>
                    Vous êtes présentement sur le plan gratuit.<br />
                    Passez au niveau supérieur et découvrez nos boosts et abonnements pour gagner en visibilité et attirer encore plus de clients.
                  </>
                ) : (
                  <>
                    You are currently on the free plan.<br />
                    Level up and discover our boosts and subscriptions to gain visibility and attract even more customers.
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={handleGoToBoosts}
                className="flex-1 bg-brand-accent hover:bg-brand-accent/90 h-12 sm:h-10"
              >
                <Zap className="h-4 w-4 mr-2" />
                {t('dashboard.seeBoosts', locale)}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleBoostPopupClose}
                className="h-12 sm:h-10"
              >
                {t('dashboard.later', locale)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
