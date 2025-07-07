import { DashboardLayout } from "@/components/dashboard-layout"

export default function ProfilPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">Profil & compte</h1>
        <p className="text-gray-600">Gérez les informations de votre profil et de votre compte ici.</p>
      </div>
    </DashboardLayout>
  )
}
