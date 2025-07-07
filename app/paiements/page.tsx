import { DashboardLayout } from "@/components/dashboard-layout"

export default function PaiementsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">Paiements</h1>
        <p className="text-gray-600">Gérez vos paiements et transactions ici.</p>
      </div>
    </DashboardLayout>
  )
}
