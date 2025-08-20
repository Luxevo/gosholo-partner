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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">Vos commerces</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un commerce
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 
mx-auto"></div>
            <p className="text-gray-600 mt-2">Chargement de vos commerces...</p>
          </div>
        ) : commerces.length > 0 ? (
          commerces.map((commerce) => (
            <CommerceCard key={commerce.id} commerce={commerce} onRefresh={refreshCounts} 
/>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun commerce</h3>
              <p className="text-gray-600 mb-4">Commencez par ajouter votre premier
commerce</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un commerce
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
