"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Crown, 
  Zap, 
  Star, 
  Eye, 
  Calendar, 
  Tag, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  Sparkles,
  TrendingUp,
  User,
  Lock,
  CreditCard,
  Settings,
  LogOut,
  Building2,
  Trash2,
  Edit,
  Plus,
  MapPin,
  Phone,
  Globe
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import ProfileEditFlow from "@/components/profile-edit-flow"
import PasswordChangeFlow from "@/components/password-change-flow"
import SubscriptionManagementFlow from "@/components/subscription-management-flow"
import CommerceManagementFlow from "@/components/commerce-management-flow"
import CommerceCreationFlow from "@/components/commerce-creation-flow"

interface UserSubscription {
  id: string
  user_id: string
  plan_type: 'free' | 'pro'
  status: string
  starts_at: string
  ends_at: string | null
}

interface UserStats {
  totalContent: number
  offers: number
  events: number
  boostCredits: number
}

interface Profile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string | null
  updated_at: string | null
}

interface Commerce {
  id: string
  user_id: string
  name: string
  description: string
  address: string
  category: string
  email: string
  phone: string
  website: string
  image_url: string
  status: string
  created_at: string
  updated_at: string
}

export default function ProfilPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [commerces, setCommerces] = useState<Commerce[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modal states
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false)
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false)
  const [isSubscriptionManagementOpen, setIsSubscriptionManagementOpen] = useState(false)
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false)
  const [isDeleteCommerceOpen, setIsDeleteCommerceOpen] = useState(false)
  const [commerceToDelete, setCommerceToDelete] = useState<Commerce | null>(null)
  const [isManageCommerceOpen, setIsManageCommerceOpen] = useState(false)
  const [commerceToEdit, setCommerceToEdit] = useState<Commerce | null>(null)
  const [isCreateCommerceOpen, setIsCreateCommerceOpen] = useState(false)

  const loadUserData = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('Authentication error:', userError)
        return
      }
      setUser(user)

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      // Get user subscription
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      setSubscription(subscriptionData || { 
        id: 'default',
        user_id: user.id,
        plan_type: 'free', 
        status: 'active', 
        starts_at: new Date().toISOString(), 
        ends_at: null 
      })

      // Get user's commerces
      const { data: commercesData } = await supabase
        .from('commerces')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      // Transform data to match expected interface with default values
      const transformedCommerces = (commercesData || []).map(commerce => ({
        ...commerce,
        description: commerce.description || '',
        category: commerce.category || '',
        email: commerce.email || '',
        phone: commerce.phone || '',
        website: commerce.website || '',
        image_url: commerce.image_url || '',
        status: commerce.status || '',
        created_at: commerce.created_at || '',
        updated_at: commerce.updated_at || ''
      }))
      
      setCommerces(transformedCommerces)

      // Get boost credits
      const { data: boostCreditsData } = await supabase
        .from('boost_credits')
        .select('credits_available')
        .eq('user_id', user.id)
        .single()

      // Get content counts
      const { data: offersData } = await supabase
        .from('offers')
        .select('id')
        .eq('user_id', user.id)

      const { data: eventsData } = await supabase
        .from('events')
        .select('id')
        .eq('user_id', user.id)

      const offersCount = offersData?.length || 0
      const eventsCount = eventsData?.length || 0

      setStats({
        totalContent: offersCount + eventsCount,
        offers: offersCount,
        events: eventsCount,
        boostCredits: boostCreditsData?.credits_available || 0
      })

    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

  const planLimits = {
    free: { content: 1, boosts: 0 },
    pro: { content: 5, boosts: 1 }
  }

  const currentLimit = planLimits[subscription?.plan_type || 'free']
  const usagePercentage = stats ? (stats.totalContent / currentLimit.content) * 100 : 0

  const handleProfileUpdated = () => {
    setIsProfileEditOpen(false)
    loadUserData()
  }

  const handlePasswordChanged = () => {
    setIsPasswordChangeOpen(false)
    toast({
      title: "Succès",
      description: "Mot de passe mis à jour avec succès",
    })
  }

  const handleSubscriptionUpdated = () => {
    setIsSubscriptionManagementOpen(false)
    loadUserData()
  }

  const handleDeleteCommerce = async () => {
    if (!commerceToDelete) return

    try {
      // Delete all offers for this commerce
      const { error: offersError } = await supabase
        .from('offers')
        .delete()
        .eq('commerce_id', commerceToDelete.id)

      if (offersError) {
        console.error('Error deleting offers:', offersError)
      }

      // Delete all events for this commerce
      const { error: eventsError } = await supabase
        .from('events')
        .delete()
        .eq('commerce_id', commerceToDelete.id)

      if (eventsError) {
        console.error('Error deleting events:', eventsError)
      }

      // Delete the commerce
      const { error: commerceError } = await supabase
        .from('commerces')
        .delete()
        .eq('id', commerceToDelete.id)

      if (commerceError) {
        console.error('Error deleting commerce:', commerceError)
        toast({
          title: "Erreur",
          description: "Erreur lors de la suppression du commerce",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Succès",
        description: `Commerce "${commerceToDelete.name}" supprimé avec succès`,
      })

      // Refresh data
      loadUserData()
      setIsDeleteCommerceOpen(false)
      setCommerceToDelete(null)

    } catch (error) {
      console.error('Error deleting commerce:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du commerce",
        variant: "destructive"
      })
    }
  }

  const confirmDeleteCommerce = (commerce: Commerce) => {
    setCommerceToDelete(commerce)
    setIsDeleteCommerceOpen(true)
  }

  const handleEditCommerce = (commerce: Commerce) => {
    setCommerceToEdit(commerce)
    setIsManageCommerceOpen(true)
  }

  const handleCommerceUpdated = () => {
    setIsManageCommerceOpen(false)
    setCommerceToEdit(null)
    loadUserData()
  }

  const handleCreateCommerce = () => {
    setIsCreateCommerceOpen(true)
  }

  const handleCommerceCreated = () => {
    setIsCreateCommerceOpen(false)
    loadUserData()
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        toast({
          title: "Erreur",
          description: "Erreur lors de la déconnexion",
          variant: "destructive"
        })
        return
      }
      
      // Redirect to login page
      window.location.href = '/login'
    } catch (error) {
      console.error('Unexpected error signing out:', error)
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Mon Profil & Commerces</h1>
          <p className="text-primary/70">Gérez votre compte et vos commerces Gosholo Partner</p>
        </div>

        {/* Current Plan and Account Info - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Plan Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {subscription?.plan_type === 'pro' ? (
                    <Crown className="h-8 w-8 text-yellow-500" />
                  ) : (
                    <Star className="h-8 w-8 text-gray-400" />
                  )}
                  <div>
                    <CardTitle className="text-xl">
                      Plan {subscription?.plan_type === 'pro' ? 'Pro' : 'Gratuit'}
                    </CardTitle>
                    <CardDescription>
                      {subscription?.plan_type === 'pro' 
                        ? 'Accès complet avec boosts' 
                        : 'Accès de base limité'
                      }
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={subscription?.plan_type === 'pro' ? "default" : "secondary"}
                  className={subscription?.plan_type === 'pro' ? "bg-yellow-500" : ""}
                >
                  {subscription?.plan_type === 'pro' ? 'PRO' : 'GRATUIT'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Usage Stats */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Contenu utilisé</span>
                  <span className="text-sm text-primary/70">
                    {stats?.totalContent || 0} / {currentLimit.content}
                  </span>
                </div>
                <Progress value={Math.min(usagePercentage, 100)} className="h-2" />
                
                {usagePercentage >= 100 && (
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      Limite atteinte! {subscription?.plan_type === 'free' 
                        ? 'Passez au plan Pro pour créer plus de contenu.' 
                        : 'Supprimez du contenu ou contactez le support.'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Content Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Tag className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-semibold text-lg">{stats?.offers || 0}</span>
                  </div>
                  <p className="text-xs text-primary/70">Offres</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-semibold text-lg">{stats?.events || 0}</span>
                  </div>
                  <p className="text-xs text-primary/70">Événements</p>
                </div>
              </div>

              {/* Boost Credits */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">Crédits Boost</span>
                  </div>
                  <Badge variant="outline">
                    {stats?.boostCredits || 0} disponible{(stats?.boostCredits || 0) > 1 ? 's' : ''}
                  </Badge>
                </div>
                {subscription?.plan_type === 'free' && (
                  <p className="text-xs text-primary/70 mt-1">
                    Passez au plan Pro pour obtenir 1 crédit boost par mois
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-primary/70">Email</label>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary/70">Nom</label>
                  <p className="font-medium">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                </div>
                {profile?.phone && (
                  <div>
                    <label className="text-sm font-medium text-primary/70">Téléphone</label>
                    <p className="font-medium">{profile.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-primary/70">Membre depuis</label>
                  <p className="font-medium">
                    {subscription?.starts_at 
                      ? new Date(subscription.starts_at).toLocaleDateString('fr-FR')
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsProfileEditOpen(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Modifier le profil
                </Button>
                <Button variant="outline" onClick={() => setIsPasswordChangeOpen(true)}>
                  <Lock className="h-4 w-4 mr-2" />
                  Changer le mot de passe
                </Button>
                <Button variant="outline" onClick={() => setIsSubscriptionManagementOpen(true)}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Gérer l'abonnement
                </Button>
                
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commerces Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mes Commerces</CardTitle>
                <CardDescription>
                  Gérez vos commerces et leurs informations
                </CardDescription>
              </div>
                             <Button onClick={handleCreateCommerce}>
                 <Plus className="h-4 w-4 mr-2" />
                 Ajouter un commerce
               </Button>
            </div>
          </CardHeader>
          <CardContent>
            {commerces.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun commerce</h3>
                <p className="text-gray-600 mb-4">Créez votre premier commerce pour commencer</p>
                                 <Button onClick={handleCreateCommerce}>
                   <Plus className="h-4 w-4 mr-2" />
                   Créer un commerce
                 </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {commerces.map((commerce) => (
                  <div key={commerce.id} className="border rounded-lg p-4 h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Building2 className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold text-lg">{commerce.name}</h4>
                          {commerce.category && (
                            <Badge variant="secondary">{commerce.category}</Badge>
                          )}
                        </div>
                        
                        {commerce.description && (
                          <p className="text-gray-600 mb-3 text-sm">{commerce.description}</p>
                        )}
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="truncate">{commerce.address}</span>
                          </div>
                          {commerce.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{commerce.phone}</span>
                            </div>
                          )}
                          {commerce.email && (
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="truncate">{commerce.email}</span>
                            </div>
                          )}
                          {commerce.website && (
                            <div className="flex items-center space-x-2">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <span className="text-blue-600 hover:underline truncate">
                                <a href={commerce.website} target="_blank" rel="noopener noreferrer">
                                  {commerce.website}
                                </a>
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-500">
                          Créé le {commerce.created_at 
                            ? new Date(commerce.created_at).toLocaleDateString('fr-FR')
                            : 'N/A'
                          }
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-4 pt-4 border-t">
                                                 <Button
                           variant="outline"
                           size="sm"
                           className="flex-1"
                           onClick={() => handleEditCommerce(commerce)}
                         >
                           <Edit className="h-4 w-4 mr-1" />
                           Modifier
                         </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => confirmDeleteCommerce(commerce)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions du compte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileEditOpen} onOpenChange={setIsProfileEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
            <DialogDescription>
              Mettez à jour vos informations personnelles
            </DialogDescription>
          </DialogHeader>
          {profile && (
            <ProfileEditFlow 
              profile={profile}
              onCancel={() => setIsProfileEditOpen(false)}
              onProfileUpdated={handleProfileUpdated}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordChangeOpen} onOpenChange={setIsPasswordChangeOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>
              Mettez à jour votre mot de passe pour sécuriser votre compte
            </DialogDescription>
          </DialogHeader>
          <PasswordChangeFlow 
            onCancel={() => setIsPasswordChangeOpen(false)}
            onPasswordChanged={handlePasswordChanged}
          />
        </DialogContent>
      </Dialog>

      {/* Subscription Management Dialog */}
      <Dialog open={isSubscriptionManagementOpen} onOpenChange={setIsSubscriptionManagementOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gérer l'abonnement</DialogTitle>
            <DialogDescription>
              Comparez les plans et modifiez votre abonnement
            </DialogDescription>
          </DialogHeader>
          {subscription && (
            <SubscriptionManagementFlow 
              currentSubscription={subscription}
              onCancel={() => setIsSubscriptionManagementOpen(false)}
              onSubscriptionUpdated={handleSubscriptionUpdated}
            />
          )}
        </DialogContent>
      </Dialog>

    
             {/* Manage Commerce Dialog */}
       <Dialog open={isManageCommerceOpen} onOpenChange={setIsManageCommerceOpen}>
         <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>Gérer le commerce</DialogTitle>
             <DialogDescription>
               Modifiez les informations de {commerceToEdit?.name}.
             </DialogDescription>
           </DialogHeader>
           {commerceToEdit && (
             <CommerceManagementFlow 
               commerce={commerceToEdit}
               onCancel={handleCommerceUpdated}
               onCommerceUpdated={handleCommerceUpdated}
             />
           )}
         </DialogContent>
       </Dialog>

               {/* Create Commerce Dialog */}
        <Dialog open={isCreateCommerceOpen} onOpenChange={setIsCreateCommerceOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau commerce</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer un nouveau commerce.
              </DialogDescription>
            </DialogHeader>
            <CommerceCreationFlow 
              onCancel={handleCommerceCreated}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Commerce Confirmation Dialog */}
        <Dialog open={isDeleteCommerceOpen} onOpenChange={setIsDeleteCommerceOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Supprimer le commerce</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce commerce ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {commerceToDelete && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-2">
                    Commerce à supprimer : {commerceToDelete.name}
                  </h4>
                  <p className="text-sm text-red-700">
                    Cette action supprimera également toutes les offres et événements associés à ce commerce.
                  </p>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDeleteCommerceOpen(false)
                    setCommerceToDelete(null)
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteCommerce}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer définitivement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  )
}