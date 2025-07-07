# Gosholo Partner Dashboard

Un tableau de bord moderne et responsive pour les commerçants Gosholo, optimisé pour les appareils mobiles et desktop.

## 🚀 Fonctionnalités

### Responsive Design
- **Mobile-First**: Optimisé pour les smartphones et tablettes
- **Desktop-Friendly**: Interface adaptée aux écrans larges
- **PWA Ready**: Installation possible sur mobile comme une application native
- **Touch-Friendly**: Interactions optimisées pour le tactile

### Navigation
- **Sidebar responsive**: Menu latéral qui se transforme en drawer sur mobile
- **Header adaptatif**: Barre de navigation qui s'adapte à la taille d'écran
- **Navigation fluide**: Transitions et animations optimisées

### Interface Utilisateur
- **Grilles adaptatives**: Layouts qui s'ajustent automatiquement
- **Typographie responsive**: Tailles de texte qui s'adaptent
- **Espacement intelligent**: Marges et paddings optimisés
- **Composants flexibles**: Cards, boutons, et formulaires adaptatifs

## 📱 PWA Features

### Installation
- Manifest JSON configuré pour l'installation
- Icônes adaptatives (192x192, 512x512)
- Splash screen personnalisé
- Thème de couleur cohérent (#016167)

### Performance Mobile
- Touch targets optimisés (44px minimum)
- Prévention du zoom sur focus
- Tap highlight désactivé
- Smooth scrolling

### Offline Ready
- Service Worker ready (à implémenter)
- Cache stratégique
- Fallback offline

## 🎨 Design System

### Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm-lg)
- **Desktop**: > 1024px (lg+)

### Couleurs
- **Primary**: #016167 (vert Gosholo)
- **Secondary**: #5BC4DB (bleu clair)
- **Accent**: #FF6233 (orange)
- **Success**: #B2FD9D (vert clair)

### Typographie
- **Responsive text utilities**: `.text-responsive-*`
- **Line clamping**: `.line-clamp-*`
- **Text balance**: Optimisation automatique

## 🛠️ Technologies

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **TypeScript**: Type safety
- **PWA**: Web App Manifest

## 📁 Structure du Projet

\`\`\`
gosholo-partner/
├── app/                    # Pages Next.js
│   ├── layout.tsx         # Layout principal avec PWA config
│   ├── page.tsx           # Dashboard principal
│   ├── offres/            # Gestion des offres
│   ├── evenements/        # Gestion des événements
│   └── globals.css        # Styles globaux + responsive utilities
├── components/            # Composants réutilisables
│   ├── dashboard-layout.tsx  # Layout responsive avec sidebar
│   ├── sidebar.tsx        # Navigation latérale
│   ├── header.tsx         # Header adaptatif
│   └── ui/               # Composants UI shadcn
├── public/               # Assets statiques
│   └── manifest.json     # PWA manifest
└── tailwind.config.ts    # Configuration Tailwind
\`\`\`

## 🚀 Installation

\`\`\`bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build pour production
npm run build

# Lancer en production
npm start
\`\`\`

## 📱 Test Responsive

### Outils recommandés
- **Chrome DevTools**: Device toolbar
- **Firefox Responsive Design Mode**
- **Safari Web Inspector**

### Tests à effectuer
1. **Mobile (320px-768px)**
   - Navigation drawer
   - Touch interactions
   - Form layouts
   - Card layouts

2. **Tablet (768px-1024px)**
   - Sidebar behavior
   - Grid layouts
   - Button sizes

3. **Desktop (1024px+)**
   - Full sidebar
   - Multi-column layouts
   - Hover states

## 🎯 Améliorations Responsive

### Implémentées
- ✅ Sidebar mobile avec Sheet component
- ✅ Header adaptatif avec menu hamburger
- ✅ Grilles responsive (1-2-3 colonnes)
- ✅ Typographie responsive
- ✅ Espacement adaptatif
- ✅ Touch targets optimisés
- ✅ PWA manifest
- ✅ Meta tags mobile

### À venir
- [ ] Service Worker pour offline
- [ ] Push notifications
- [ ] Background sync
- [ ] App shortcuts
- [ ] Splash screen personnalisé

## 🔧 Configuration PWA

### Manifest
- `display: standalone` - Mode application
- `orientation: portrait-primary` - Orientation fixe
- `theme_color: #016167` - Couleur de thème
- `background_color: #ffffff` - Couleur de fond

### Meta Tags
- `viewport-fit: cover` - Plein écran
- `user-scalable: no` - Pas de zoom
- `apple-mobile-web-app-capable: yes` - iOS PWA

## 📊 Performance

### Optimisations
- **Lazy loading** des composants
- **Image optimization** avec Next.js
- **CSS purging** avec Tailwind
- **Bundle splitting** automatique

### Métriques
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Tester sur mobile et desktop
4. Soumettre une pull request

## 📄 Licence

MIT License - voir LICENSE pour plus de détails.
