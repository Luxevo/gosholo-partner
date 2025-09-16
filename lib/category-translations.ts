// Complete translation system for Gosholo Partner Dashboard
// Database values remain in French, but we can display them in different languages

export const TRANSLATIONS = {
  fr: {
    // Navigation
    navigation: {
      dashboard: "Tableau de bord",
      offers: "Offres", 
      events: "Événements",
      boosts: "Boosts & Abonnements",
      profile: "Profil & compte",
      support: "Support"
    },
    
    // Dashboard
    dashboard: {
      welcome: "Bienvenue",
      addCommerce: "Ajouter un commerce",
      manageCommerce: "Gérer ce commerce",
      createOffer: "Créer une offre",
      createEvent: "Créer un événement",
      edit: "Modifier",
      delete: "Supprimer",
      noCommerce: "Aucun commerce",
      noOffers: "Aucune offre",
      noEvents: "Aucun événement",
      startWithFirstCommerce: "Commencez par ajouter votre premier commerce",
      beVisibleToday: "Soyez visible dès aujourd'hui",
      makeCommerceShine: "Faites briller votre commerce",
      later: "Plus tard",
      seeBoosts: "Voir les boosts et abonnements"
    },
    
    // Commerce forms
    commerce: {
      title: "Informations du commerce",
      editTitle: "Modifier le commerce",
      name: "Nom du commerce",
      namePlaceholder: "Ex: Restaurant Le Bistrot",
      description: "Description",
      descriptionPlaceholder: "Décrivez votre commerce en quelques mots...",
      address: "Adresse complète",
      addressPlaceholder: "Ex: 123 Rue Saint-Paul Est",
      postalCode: "Code postal",
      postalCodePlaceholder: "Ex: H2Y 1G5",
      category: "Catégorie",
      categoryPlaceholder: "Sélectionner une catégorie",
      email: "Email",
      emailPlaceholder: "contact@votrecommerce.com",
      phone: "Téléphone",
      phonePlaceholder: "(514) 123-4567",
      website: "Site web",
      websitePlaceholder: "https://votrecommerce.com",
      facebook: "Facebook",
      instagram: "Instagram", 
      linkedin: "LinkedIn",
      image: "Image du commerce",
      required: "obligatoire"
    },
    
    // Offers
    offers: {
      title: "Créer une offre",
      editTitle: "Modifier l'offre",
      name: "Titre de l'offre",
      namePlaceholder: "Ex: 20% de réduction sur tous les plats",
      description: "Description",
      descriptionPlaceholder: "Détails de votre offre...",
      type: "Type d'offre",
      inStore: "En magasin",
      online: "En ligne", 
      both: "En magasin et en ligne",
      condition: "Conditions",
      conditionPlaceholder: "Ex: Sur présentation de ce coupon",
      location: "Lieu",
      useCommerceLocation: "Utiliser l'adresse du commerce",
      customLocation: "Lieu personnalisé",
      customLocationPlaceholder: "Ex: Salle de conférence, 2e étage",
      startDate: "Date de début",
      endDate: "Date de fin",
      image: "Image de l'offre"
    },
    
    // Events
    events: {
      title: "Créer un événement",
      editTitle: "Modifier l'événement", 
      name: "Titre de l'événement",
      namePlaceholder: "Ex: Atelier cuisine, Soirée networking",
      description: "Description",
      descriptionPlaceholder: "Détails de votre événement...",
      condition: "Conditions",
      conditionPlaceholder: "Ex: Inscription requise",
      location: "Lieu",
      useCommerceLocation: "Utiliser l'adresse du commerce",
      customLocation: "Lieu personnalisé",
      customLocationPlaceholder: "Ex: Salle de conférence, 2e étage",
      startDate: "Date de début",
      endDate: "Date de fin"
    },
    
    // Buttons and actions
    buttons: {
      save: "Enregistrer",
      cancel: "Annuler", 
      create: "Créer",
      edit: "Modifier",
      delete: "Supprimer",
      confirm: "Confirmer",
      next: "Suivant",
      previous: "Précédent",
      preview: "Aperçu",
      confirmCreation: "Confirmer la création",
      deletePermanently: "Supprimer définitivement",
      close: "Fermer",
      back: "Retour"
    },
    
    // Messages
    messages: {
      commerceCreated: "Commerce créé avec succès !",
      commerceUpdated: "Commerce mis à jour avec succès !",
      commerceDeleted: "Commerce supprimé avec succès !",
      offerCreated: "Offre créée avec succès !",
      offerUpdated: "Offre mise à jour avec succès !", 
      offerDeleted: "Offre supprimée avec succès !",
      eventCreated: "Événement créé avec succès !",
      eventUpdated: "Événement mis à jour avec succès !",
      eventDeleted: "Événement supprimé avec succès !",
      loading: "Chargement...",
      saving: "Enregistrement...",
      deleting: "Suppression..."
    },
    
    // Validation errors
    errors: {
      required: "Ce champ est obligatoire",
      invalidEmail: "Adresse email invalide",
      invalidPhone: "Numéro de téléphone invalide",
      invalidUrl: "URL invalide",
      invalidPostalCode: "Code postal invalide",
      nameTooLong: "Le nom est trop long",
      descriptionTooLong: "La description est trop longue"
    },
    
    // Status and badges
    status: {
      active: "Actif",
      inactive: "Inactif", 
      expiring: "Expire bientôt",
      expired: "Expiré",
      coming: "À venir",
      ongoing: "En cours",
      finished: "Terminé"
    },
    
    // Boost system
    boosts: {
      vedette: "Vedette",
      visibility: "Visibilité",
      credits: "Crédits",
      free: "Gratuit",
      pro: "Plus"
    },
    
    // Profile page
    profile: {
      title: "Mon Profil",
      subtitle: "Gérez votre compte et vos commerces",
      plan: "Plan",
      free: "Gratuit",
      pro: "Plus",
      boostCredits: "Crédits Boost",
      offers: "Offres",
      events: "Événements",
      editProfile: "Modifier le profil",
      manageSubscription: "Gérer l'abonnement",
      myCommerces: "Mes Commerces",
      addCommerce: "Ajouter un commerce",
      createCommerce: "Créer un commerce",
      edit: "Modifier",
      delete: "Supprimer",
      deletePermanently: "Supprimer définitivement"
    }
  },
  
  en: {
    // Navigation
    navigation: {
      dashboard: "Dashboard",
      offers: "Offers",
      events: "Events", 
      boosts: "Boosts & Subscriptions",
      profile: "Profile & Account",
      support: "Support"
    },
    
    // Dashboard
    dashboard: {
      welcome: "Welcome",
      addCommerce: "Add business",
      manageCommerce: "Manage this business",
      createOffer: "Create offer",
      createEvent: "Create event",
      edit: "Edit",
      delete: "Delete",
      noCommerce: "No business",
      noOffers: "No offers",
      noEvents: "No events",
      startWithFirstCommerce: "Start by adding your first business",
      beVisibleToday: "Be visible today",
      makeCommerceShine: "Make your business shine",
      later: "Later",
      seeBoosts: "See boosts and subscriptions"
    },
    
    // Commerce forms
    commerce: {
      title: "Business information",
      editTitle: "Edit business",
      name: "Business name",
      namePlaceholder: "Ex: The Bistrot Restaurant",
      description: "Description",
      descriptionPlaceholder: "Describe your business in a few words...",
      address: "Full address",
      addressPlaceholder: "Ex: 123 Saint-Paul Street East",
      postalCode: "Postal code",
      postalCodePlaceholder: "Ex: H2Y 1G5",
      category: "Category",
      categoryPlaceholder: "Select a category",
      email: "Email",
      emailPlaceholder: "contact@yourbusiness.com",
      phone: "Phone",
      phonePlaceholder: "(514) 123-4567",
      website: "Website",
      websitePlaceholder: "https://yourbusiness.com",
      facebook: "Facebook",
      instagram: "Instagram",
      linkedin: "LinkedIn", 
      image: "Business image",
      required: "required"
    },
    
    // Offers
    offers: {
      title: "Create offer",
      editTitle: "Edit offer",
      name: "Offer title",
      namePlaceholder: "Ex: 20% off all dishes",
      description: "Description",
      descriptionPlaceholder: "Details of your offer...",
      type: "Offer type",
      inStore: "In store",
      online: "Online",
      both: "In store and online", 
      condition: "Conditions",
      conditionPlaceholder: "Ex: Upon presentation of this coupon",
      location: "Location",
      useCommerceLocation: "Use business address",
      customLocation: "Custom location",
      customLocationPlaceholder: "Ex: Conference room, 2nd floor",
      startDate: "Start date",
      endDate: "End date",
      image: "Offer image"
    },
    
    // Events
    events: {
      title: "Create event",
      editTitle: "Edit event",
      name: "Event title", 
      namePlaceholder: "Ex: Cooking workshop, Networking evening",
      description: "Description",
      descriptionPlaceholder: "Details of your event...",
      condition: "Conditions",
      conditionPlaceholder: "Ex: Registration required",
      location: "Location",
      useCommerceLocation: "Use business address",
      customLocation: "Custom location",
      customLocationPlaceholder: "Ex: Conference room, 2nd floor",
      startDate: "Start date",
      endDate: "End date"
    },
    
    // Buttons and actions
    buttons: {
      save: "Save",
      cancel: "Cancel",
      create: "Create", 
      edit: "Edit",
      delete: "Delete",
      confirm: "Confirm",
      next: "Next",
      previous: "Previous",
      preview: "Preview",
      confirmCreation: "Confirm creation",
      deletePermanently: "Delete permanently",
      close: "Close",
      back: "Back"
    },
    
    // Messages
    messages: {
      commerceCreated: "Business created successfully!",
      commerceUpdated: "Business updated successfully!",
      commerceDeleted: "Business deleted successfully!",
      offerCreated: "Offer created successfully!",
      offerUpdated: "Offer updated successfully!",
      offerDeleted: "Offer deleted successfully!",
      eventCreated: "Event created successfully!",
      eventUpdated: "Event updated successfully!",
      eventDeleted: "Event deleted successfully!",
      loading: "Loading...",
      saving: "Saving...",
      deleting: "Deleting..."
    },
    
    // Validation errors
    errors: {
      required: "This field is required",
      invalidEmail: "Invalid email address",
      invalidPhone: "Invalid phone number",
      invalidUrl: "Invalid URL",
      invalidPostalCode: "Invalid postal code",
      nameTooLong: "Name is too long",
      descriptionTooLong: "Description is too long"
    },
    
    // Status and badges
    status: {
      active: "Active",
      inactive: "Inactive",
      expiring: "Expiring soon",
      expired: "Expired",
      coming: "Coming up",
      ongoing: "Ongoing", 
      finished: "Finished"
    },
    
    // Boost system
    boosts: {
      vedette: "Featured",
      visibility: "Visibility",
      credits: "Credits",
      free: "Free",
      pro: "Plus"
    },
    
    // Profile page
    profile: {
      title: "My Profile",
      subtitle: "Manage your account and businesses",
      plan: "Plan",
      free: "Free",
      pro: "Plus",
      boostCredits: "Boost Credits",
      offers: "Offers",
      events: "Events",
      editProfile: "Edit profile",
      manageSubscription: "Manage subscription",
      myCommerces: "My Businesses",
      addCommerce: "Add business",
      createCommerce: "Create business",
      edit: "Edit",
      delete: "Delete",
      deletePermanently: "Delete permanently"
    }
  }
} as const

// Legacy category translations (kept for backward compatibility)
export const CATEGORY_TRANSLATIONS = {
  "Restaurant": { fr: "Restaurant", en: "Restaurant" },
  "Café": { fr: "Café", en: "Coffee Shop" },
  "Boulangerie": { fr: "Boulangerie", en: "Bakery" },
  "Épicerie": { fr: "Épicerie", en: "Grocery Store" },
  "Commerce": { fr: "Commerce", en: "Retail" },
  "Service": { fr: "Service", en: "Service" },
  "Santé": { fr: "Santé", en: "Health" },
  "Beauté": { fr: "Beauté", en: "Beauty" },
  "Sport": { fr: "Sport", en: "Sports" },
  "Culture": { fr: "Culture", en: "Culture" },
  "Éducation": { fr: "Éducation", en: "Education" },
  "Bars & Vie nocturne": { fr: "Bars & Vie nocturne", en: "Bars & Nightlife" },
  "Mode, Bijoux & Accessoires": { fr: "Mode, Bijoux & Accessoires", en: "Fashion, Jewelry & Accessories" },
  "Beauté & Bien-être": { fr: "Beauté & Bien-être", en: "Beauty & Wellness" },
  "Santé & Services médicaux": { fr: "Santé & Services médicaux", en: "Health & Medical Services" },
  "Sports & Loisirs": { fr: "Sports & Loisirs", en: "Sports & Recreation" },
  "Culture & Divertissement": { fr: "Culture & Divertissement", en: "Culture & Entertainment" },
  "Automobile & Transport": { fr: "Automobile & Transport", en: "Automotive & Transportation" },
  "Maison & Rénovation": { fr: "Maison & Rénovation", en: "Home & Renovation" },
  "Immobilier & Logement": { fr: "Immobilier & Logement", en: "Real Estate & Housing" },
  "Épiceries & Alimentation": { fr: "Épiceries & Alimentation", en: "Grocery & Food" },
  "Voyages & Hébergement": { fr: "Voyages & Hébergement", en: "Travel & Accommodation" },
  "Événementiel": { fr: "Événementiel", en: "Events" },
  "Technologie & Électronique": { fr: "Technologie & Électronique", en: "Technology & Electronics" },
  "Services professionnels": { fr: "Services professionnels", en: "Professional Services" },
  "Banques, Finances & Assurances": { fr: "Banques, Finances & Assurances", en: "Banking, Finance & Insurance" },
  "Organismes & Associations": { fr: "Organismes & Associations", en: "Organizations & Associations" },
  "Produits du terroir & Marchés locaux": { fr: "Produits du terroir & Marchés locaux", en: "Local Products & Markets" },
  "Animaux & Services pour animaux": { fr: "Animaux & Services pour animaux", en: "Pets & Pet Services" },
  "Enfants & Famille": { fr: "Enfants & Famille", en: "Children & Family" },
  "Pharmacies & Produits de santé": { fr: "Pharmacies & Produits de santé", en: "Pharmacies & Health Products" },
  "Arts & Loisirs créatifs": { fr: "Arts & Loisirs créatifs", en: "Arts & Creative Hobbies" },
  "Autres / Divers": { fr: "Autres / Divers", en: "Other / Miscellaneous" }
} as const

export type CategoryValue = keyof typeof CATEGORY_TRANSLATIONS
export type Locale = 'fr' | 'en'

/**
 * Get the translated label for a category value
 * @param value - The category value from database (in French)
 * @param locale - The target locale ('fr' or 'en')
 * @returns The translated label or the original value if no translation exists
 */
export const getCategoryLabel = (value: string, locale: Locale = 'fr'): string => {
  const translation = CATEGORY_TRANSLATIONS[value as CategoryValue]
  return translation?.[locale] || value
}

/**
 * Get all categories with their translated labels
 * @param locale - The target locale ('fr' or 'en')
 * @returns Array of category objects with value and translated label
 */
export const getCategoriesWithLabels = (locale: Locale = 'fr') => {
  return Object.keys(CATEGORY_TRANSLATIONS).map(value => ({
    value,
    label: getCategoryLabel(value, locale)
  }))
}

/**
 * Get all category values (for database operations)
 * @returns Array of all category values
 */
export const getAllCategoryValues = (): string[] => {
  return Object.keys(CATEGORY_TRANSLATIONS)
}

// New comprehensive translation functions
export type Locale = 'fr' | 'en'
export type TranslationKey = keyof typeof TRANSLATIONS.fr

/**
 * Get a translated string from the comprehensive translation system
 * @param key - The translation key (e.g., 'navigation.dashboard')
 * @param locale - The target locale ('fr' or 'en')
 * @returns The translated string or the key if not found
 */
export const t = (key: string, locale: Locale = 'fr'): string => {
  const keys = key.split('.')
  let value: any = TRANSLATIONS[locale]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // Fallback to French if key not found in target locale
      value = TRANSLATIONS.fr
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey]
        } else {
          return key // Return the key if not found anywhere
        }
      }
      break
    }
  }
  
  return typeof value === 'string' ? value : key
}

/**
 * Get a translated string with fallback
 * @param key - The translation key
 * @param locale - The target locale
 * @param fallback - Fallback string if translation not found
 * @returns The translated string or fallback
 */
export const tWithFallback = (key: string, locale: Locale = 'fr', fallback: string): string => {
  const translation = t(key, locale)
  return translation === key ? fallback : translation
}
