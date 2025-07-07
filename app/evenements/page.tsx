"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Plus, Edit, BarChart3 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import EventCreationFlow from "@/components/event-creation-flow"

interface Event {
  id: string
  title: string
  description: string
  location: string
  startDate: string
  endDate: string
  status: "active" | "inactive" | "draft"
  attendees: number
}

export default function EvenementsPage() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Atelier de cuisine",
      description: "Participez à notre atelier de cuisine italienne.",
      location: "Paris",
      startDate: "2024-02-10",
      endDate: "2024-02-10",
      status: "active",
      attendees: 25
    },
    {
      id: "2",
      title: "Soirée Networking",
      description: "Rencontrez des professionnels du secteur.",
      location: "Lyon",
      startDate: "2024-03-05",
      endDate: "2024-03-05",
      status: "draft",
      attendees: 10
    }
  ])

  const [newEvent, setNewEvent] = useState<Omit<Event, "id" | "attendees">>({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    status: "draft"
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)

  const handleCreateEvent = () => {
    const event: Event = {
      id: Date.now().toString(),
      ...newEvent,
      attendees: 0
    }
    setEvents([...events, event])
    setNewEvent({
      title: "",
      description: "",
      location: "",
      startDate: "",
      endDate: "",
      status: "draft"
    })
    setIsDialogOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-red-100 text-red-800"
      case "draft": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 bg-white">
        {!showEventForm && (
          <Button className="flex items-center gap-2 bg-accent text-white hover:bg-accent/80 w-full sm:w-auto mb-4" onClick={() => setShowEventForm(true)}>
            <Plus className="h-4 w-4" />
            Créer un événement
          </Button>
        )}
        {showEventForm && (
          <div className="mb-6">
            <EventCreationFlow />
            <Button variant="ghost" className="mt-2" onClick={() => setShowEventForm(false)}>
              Annuler
            </Button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-primary">Événements</h1>
            <p className="text-brand-primary/70 text-sm lg:text-base">Gérez vos événements et ateliers</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-primary/80 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Nouvel événement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouvel événement</DialogTitle>
                <DialogDescription>
                  Remplissez les informations pour créer un nouvel événement.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre de l'événement</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      placeholder="Ex: Atelier de cuisine"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Lieu</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      placeholder="Ex: Paris"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Décrivez votre événement..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select value={newEvent.status} onValueChange={(value) => setNewEvent({...newEvent, status: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Annuler
                </Button>
                <Button onClick={handleCreateEvent} className="w-full sm:w-auto">
                  Créer l'événement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 lg:gap-6">
          {events.map((event) => (
            <Card key={event.id} className="bg-white border border-brand-primary/20">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                      <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-brand-secondary flex-shrink-0" />
                      <span className="truncate">{event.title}</span>
                    </CardTitle>
                    <CardDescription className="mt-2 text-brand-primary/70 text-sm lg:text-base line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status === "active" ? "Actif" : event.status === "inactive" ? "Inactif" : "Brouillon"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-primary flex-shrink-0" />
                    <span className="text-sm text-brand-primary/70 truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-brand-secondary flex-shrink-0" />
                    <span className="text-sm text-brand-primary/70 truncate">
                      {formatDate(event.startDate)} - {formatDate(event.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
                    <Users className="h-4 w-4 text-brand-accent flex-shrink-0" />
                    <span className="text-sm text-brand-primary/70 truncate">
                      {event.attendees} participants
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-brand-primary/10">
                  <Button variant="outline" size="sm" className="border-brand-primary/20 text-brand-primary hover:bg-brand-primary/10 flex-1 sm:flex-none">
                    <Edit className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="border-brand-primary/20 text-brand-primary hover:bg-brand-primary/10 flex-1 sm:flex-none">
                    <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    Voir les statistiques
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
