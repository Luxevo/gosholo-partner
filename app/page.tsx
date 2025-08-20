export default function HomePage() {
  // This page should never be seen - middleware redirects:
  // - Not authenticated: / → /login  
  // - Authenticated: / → /dashboard
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/5 via-white to-brand-secondary/5 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-brand-primary rounded-xl flex items-center justify-center animate-pulse">
          <span className="text-2xl font-bold text-white">G</span>
        </div>
        <p className="text-brand-primary/70">Redirection...</p>
      </div>
    </div>
  )
}