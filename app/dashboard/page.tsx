"use client"

import React, { useState } from "react"
import { useDashboard } from "@/contexts/dashboard-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
 } from "@/components/ui/dialog"
import { Store, Plus } from "lucide-react"
import CommerceCreationFlow from "@/components/commerce-creation-flow"
import CommerceCard from "@/components/commerce-card"

export default function Dashboard() {
  const { userProfile, commerces, isLoading, refreshCounts } = useDashboard()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Get user's display name
  const getUserDisplayName = () => {
    if (!userProfile) return "Partenaire"

    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`
    } else if (userProfile.first_name) {
      return userProfile.first_name
    } else if (userProfile.last_name) {
      return userProfile.last_name
    } else {
      // Fallback to email or generic name
      return userProfile.email.split('@')[0] || "Partenaire"
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#005266] mb-1">
          Bienvenue, {getUserDisplayName()} !
        </h1>
        <p className="text-gray-600">
          Voici un aperçu de l'activité de vos commerces
        </p>
      </div>

      {/* Commerce Cards Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">Vos commerces</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto h-12 sm:h-10">
                <Plus className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                Ajouter un commerce
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-none sm:max-w-[600px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>Créer un nouveau commerce</DialogTitle>
                <DialogDescription>
                  Remplissez les informations pour créer un nouveau commerce.
                </DialogDescription>
              </DialogHeader>
              <CommerceCreationFlow 
                onCancel={() => {
                  setIsDialogOpen(false)
                  refreshCounts()
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
        {isLoading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2 sm:mt-4">Chargement de vos commerces...</p>
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
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 sm:mb-3">Aucun commerce</h3>
              <p className="text-gray-600 mb-4 sm:mb-6">Commencez par ajouter votre premier commerce</p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="h-12 sm:h-10 w-full sm:w-auto"
              >
                <Plus className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                Ajouter un commerce
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
