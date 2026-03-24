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
      support: "Support / FAQ"
    },
    
    // Authentication
    auth: {
      registrationSuccess: "Inscription réussie !",
      accountCreated: "Votre compte a été créé avec succès.",
      checkEmail: "📧 Vérifiez votre boîte email",
      confirmationSent: "Nous avons envoyé un lien de confirmation à",
      loginAfterConfirmation: "Vous pourrez vous connecter une fois votre email confirmé.",
      signIn: "Se connecter",
      checkEmailError: "Vérifiez votre boîte email pour confirmer votre compte avant de vous connecter.",
      welcomeTitle: "Bienvenue chez gosholo",
      welcomeSubtitle: "Connectez-vous à votre espace commerçant",
      loginTitle: "Connexion",
      loginDescription: "Entrez vos identifiants pour accéder à votre espace commerçant",
      emailLabel: "Adresse email",
      emailPlaceholder: "votre@email.com",
      passwordLabel: "Mot de passe",
      passwordPlaceholder: "Votre mot de passe",
      forgotPassword: "Mot de passe oublié ?",
      loggingIn: "Connexion en cours...",
      loginButton: "Se connecter",
      noAccount: "Pas encore de compte ?",
      createAccount: "Créer un compte",
      loginAcceptTerms: "En vous connectant, vous acceptez nos",
      termsOfUse: "conditions d'utilisation",
      andOur: "et notre",
      privacyPolicy: "politique de confidentialité",
      registerTitle: "Crée ton compte pour accéder à ta plateforme entreprise Gosholo",
      registerSubtitle: "Ces informations servent uniquement à créer votre accès personnel au tableau de bord. Elles ne seront pas visibles sur votre profil ni dans l'application",
      createAccountTitle: "Créer votre compte",
      createAccountDescription: "Remplissez les informations ci-dessous pour créer votre compte commerçant",
      personalInfo: "Informations personnelles",
      firstName: "Prénom",
      firstNamePlaceholder: "Jean",
      lastName: "Nom",
      lastNamePlaceholder: "Dupont",
      email: "Email",
      emailPlaceholderRegister: "jean@exemple.com",
      phone: "Téléphone",
      phonePlaceholder: "012 234-6789",
      security: "Sécurité",
      passwordPlaceholderRegister: "Minimum 6 caractères",
      acceptTerms: "J'accepte les",
      acceptTermsButton: "conditions d'utilisation",
      loading: "Chargement...",
      creatingAccount: "Chargement...",
      createMyAccount: "Créer mon compte",
      alreadyHaveAccount: "Vous avez déjà un compte ?",
      connect: "Connectez-vous",
      registerAcceptTerms: "En créant un compte, vous acceptez nos",
      contentDisclaimer: "En publiant du contenu sur gosholo, vous acceptez que vos offres, événements et visuels puissent être utilisés par gosholo à des fins promotionnelles, afin de mettre en valeur votre commerce et la plateforme.",
      incorrectCredentials: "Email ou mot de passe incorrect.",
      accountCreationError: "Erreur lors de la création du compte"
    },
    
    // Dashboard
    dashboard: {
      welcome: "Bienvenue",
      title: "Tableau de bord",
      subtitle: "Voici un aperçu de l'activité de vos commerces",
      yourCommerces: "Vos commerces",
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
      seeBoosts: "Voir les boosts et abonnements",
      createBusinessProfile: "Créez le profil de votre entreprise",
      enterBusinessInfo: "Entrez les informations de votre entreprise pour la rendre visible sur la carte gosholo et commencez à publier vos offres et événements.",
      loadingCommerces: "Chargement de vos commerces...",
      welcomeMessage: "C'est gratuit ! Ajoutez une entreprise à votre compte pour apparaître sur la carte gosholo et commencer à attirer des clients avec vos offres et événements.",
      addBusiness: "Ajouter une entreprise",
      boostMessage: "Vous êtes présentement sur le plan gratuit.<br />Passez au niveau supérieur et découvrez nos boosts et abonnements pour gagner en visibilité et attirer encore plus de clients."
    },

    // Commerce card
    commerceCard: {
      visibilityBoost: "Visibilité Boost",
      boostThisBusiness: "Boost ce commerce",
      manageBusiness: "Gérer ce commerce",
      activeOffers: "Offres actives",
      upcomingEvents: "Événements à venir",
      noActiveOffers: "Aucune offre en cours",
      noUpcomingEvents: "Aucun événement à venir",
      createOffer: "Créer une offre",
      createEvent: "Créer un événement",
      limitReached: "Limite atteinte",
      boost: "Boost",
      active: "Active",
      finished: "Terminée",
      upcoming: "À venir",
      expiresOn: "Expire le",
      alreadyBoosted: "Déjà boosté",
      alreadyBoostedDesc: "Cette publication est déjà boostée.",
      boostApplied: "Boost appliqué !",
      boostAppliedDesc: "est maintenant boosté pour 72 heures.",
      error: "Erreur",
      cannotApplyBoost: "Impossible d'appliquer le boost.",
      success: "Succès",
      businessDeleted: "Commerce supprimé avec succès",
      unexpectedError: "Erreur inattendue lors de la suppression",
      offerDeletedSuccess: "Offre supprimée avec succès",
      eventDeletedSuccess: "Événement supprimé avec succès",
      offer: "offre",
      event: "événement",
      business: "commerce",
      your: "Votre",
      errorDeletingOffers: "Erreur lors de la suppression des offres associées",
      errorDeletingEvents: "Erreur lors de la suppression des événements associés",
      errorDeletingBusiness: "Erreur lors de la suppression du commerce"
    },

    // Modal dialogs
    modals: {
      editOffer: "Modifier l'offre",
      editOfferDesc: "Modifiez les informations de votre offre.",
      editEvent: "Modifier l'événement", 
      editEventDesc: "Modifiez les informations de votre événement.",
      manageBusiness: "Gérer le commerce",
      manageBusinessDesc: "Modifiez les informations de",
      confirmDelete: "Confirmer la suppression",
      confirmDeleteDesc: "Êtes-vous sûr de vouloir supprimer",
      thisOffer: "cette offre",
      thisEvent: "cet événement",
      actionIrreversible: "Cette action est irréversible.",
      cancel: "Annuler",
      delete: "Supprimer",
      confirmDeleteBusiness: "Confirmer la suppression du commerce",
      confirmDeleteBusinessDesc: "Êtes-vous sûr de vouloir supprimer ce commerce ? Cette action supprimera également toutes les offres et événements associés. Cette action est irréversible.",
      deleteBusiness: "Supprimer le commerce",
      businessContains: "Ce commerce contient",
      offersAnd: "offre(s) et",
      eventsWillBeDeleted: "événement(s) qui seront également supprimé(s).",
      boostYour: "Booster votre",
      boostBusinessDesc: "Boostez la visibilité de",
      onMapFor72h: "sur la carte pendant 72 heures.",
      chooseBoostType: "Choisissez le type de boost pour augmenter la visibilité de",
      for72h: "pendant 72 heures.",
      visibility: "Visibilité",
      extendedReach72h: "72h de portée élargie",
      moreVisibleOnMap: "Plus visible sur la carte",
      increasesTraffic: "Augmente le trafic",
      extendedGeoReach: "Portée géographique élargie",
      useCredit: "Utiliser crédit",
      available: "dispo",
      buy5dollars: "Acheter 5$",
      featured: "En Vedette",
      premiumVisibility72h: "72h de visibilité premium",
      featuredBadgeVisible: "Badge Vedette pour vous démarquer",
      priorityInSearch: "Placement prioritaire dans la liste des offres/événements",
      highlightedOnMap: "Apparition en haut des résultats de recherche",
      featuredOnWebsite: "votre offre sera mise de l'avant sur le site web gosholo.com"
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
      subCategory: "Sous-catégorie",
      subCategoryPlaceholder: "Sélectionner une sous-catégorie",
      email: "Email",
      emailPlaceholder: "contact@votrecommerce.com",
      phone: "Téléphone",
      phonePlaceholder: "(514) 123-4567",
      website: "Site web",
      websitePlaceholder: "https://votrecommerce.com",
      facebook: "Facebook",
      facebookPlaceholder: "facebook.com/moncommerce ou https://facebook.com/moncommerce",
      instagram: "Instagram", 
      instagramPlaceholder: "instagram.com/moncommerce", 
      image: "Image du commerce",
      required: "obligatoire",
      contactInfo: "Informations de contact",
      socialNetworks: "Réseaux sociaux",
      exactAddress: "Adresse exacte de votre commerce (numéro, rue, etc.)",
      noDescription: "Aucune description",
      addressLabel: "Adresse:",
      previewTitle: "Prévisualisation de votre commerce",
      previewDesc: "Vérifiez que toutes les informations sont correctes avant de créer",
      preview: "Prévisualisation",
      readyToCreate: "Prêt à créer",
      confirmCreateDesc: "Êtes-vous sûr de vouloir créer ce commerce ?",
      businessWillBeCreated: "Votre commerce sera maintenant créé !",
      canCreateOffersEvents: "Vous pourrez ensuite créer des offres et des événements pour ce commerce.",
      canModifyDelete: "Vous pourrez le modifier ou le supprimer à tout moment depuis votre tableau de bord.",
      categoryLabel: "Catégorie:"
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
      image: "Image de l'offre",
      
      // Offer creation flow specific
      titleRequired: "Titre requis",
      descriptionRequired: "Description requise",
      commerceRequired: "Commerce requis",
      startDateRequired: "Date de début requise",
      endDateRequired: "Date de fin requise",
      startDatePast: "La date de début ne peut pas être dans le passé",
      endDatePast: "La date de fin ne peut pas être dans le passé",
      endDateAfterStart: "La date de fin doit être après la date de début",
      maxDuration30Days: "La durée de l'offre ne peut pas dépasser 30 jours",
      correctErrors: "Veuillez corriger les erreurs suivantes :",
      
      // Confirmation dialog
      confirmPublication: "Confirmer la publication",
      confirmPublishDesc: "Êtes-vous sûr de vouloir publier cette offre ?",
      readyToPublish: "Prêt à publier",
      period: "Période:",
      from: "Du",
      to: "au",
      offerWillBeOnline: "Votre offre sera maintenant en ligne !",
      visibleOnProfile: "Elle sera visible sur votre fiche commerce, sur la carte, et dans les sections de l'application.",
      canModifyAnytime: "Vous pourrez la modifier ou la désactiver à tout moment. (Lors d'un changement ou de la désactivation, les utilisateurs ayant ajouté votre offre en favori seront avertis.)",
      backToPreview: "Retour à la prévisualisation",
      
      // Preview section
      offerPreview: "Aperçu de votre offre",
      howOfferAppears: "Voici comment votre offre apparaîtra aux utilisateurs de gosholo",
      userExperiencePreview: "✨ Aperçu de l'expérience utilisateur",
      exactlyHowAppears: "C'est exactement ainsi que votre offre apparaîtra aux utilisateurs dans l'application Gosholo.",
      backToEdit: "Retour modifier",
      continueToPublication: "Continuer vers la publication",
      
      // Success screen
      offerCreatedSuccess: "🎉 Offre créée avec succès !",
      offerNowOnline: "Votre offre est maintenant en ligne et visible par les utilisateurs.",
      boostOfferNow: "Boostez votre offre maintenant ?",
      increaseVisibility72h: "Augmentez la visibilité pendant 72 heures",
      skipForNow: "Passer pour le moment",
      featuredBoost: "En Vedette",
      premiumVisibility72h: "72h de visibilité premium",
      featuredBadgeVisible: "Badge Vedette pour vous démarquer",
      priorityInSearch: "Placement prioritaire dans la liste des offres/événements",
      highlightedOnMap: "Apparition en haut des résultats de recherche",
      featuredOnWebsite: "votre offre sera mise de l'avant sur le site web gosholo.com",
      useCredit: "Utiliser crédit",
      available: "dispo",
      buy5dollars: "Acheter 5$",
      
      // Form labels
      commerceLabel: "Commerce",
      noCommerceAvailable: "Aucun commerce disponible",
      mustCreateCommerceFirst: "Vous devez d'abord créer un commerce avant de pouvoir créer une offre.",
      backToDashboard: "Retour au tableau de bord",
      commercePreselected: "Commerce pré-sélectionné",
      selectCommerce: "Sélectionner un commerce (obligatoire)",
      postalCodeOptional: "Code postal (optionnel)",
      searchingSector: "📍 Recherche du secteur...",
      sectorFound: "✅ Secteur trouvé:",
      specificAddress: "Adresse spécifique (optionnel)",
      ifDifferentFromMain: "Si différente du commerce principal",
      conditionOptional: "(optionnel)",
      
      // Placeholders
      offerTitlePlaceholder: "Ex: 2 cafés pour $5, 10% sur tout",
      shortDescriptionPlaceholder: "Description courte (max 250 caractères)",
      postalCodePlaceholder: "Ex: H2X 1Y4, M5V 3A8, V6B 1A1",
      specificAddressPlaceholder: "Ex: 123 Rue Saint-Paul Est",
      imageUploadError: "Erreur:",
      preview: "Aperçu",
      willAppearLikeThis: "C'est ainsi qu'elle apparaîtra dans votre carte",
      livePreview: "Aperçu client"
    },

    // Offers page
    offersPage: {
      title: "Offres",
      subtitle: "Gérez vos offres et promotions",
      addOffer: "Ajouter une offre",
      createNewOffer: "Créer une nouvelle offre",
      createNewOfferDesc: "Remplissez les informations pour créer une nouvelle offre.",
      editOffer: "Modifier l'offre",
      editOfferDesc: "Modifiez les informations de votre offre.",
      deleteOffer: "Supprimer l'offre",
      deleteOfferDesc: "Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.",
      offerToDelete: "Offre à supprimer :",
      deleteOfferWarning: "Cette action supprimera définitivement cette offre de votre compte.",
      deletePermanently: "Supprimer définitivement",
      
      // Filters and views
      allOffers: "Toutes",
      activeOffers: "Actives",
      finishedOffers: "Terminés",
      management: "Gestion",
      customerPreview: "Aperçu client",
      commerce: "Commerce",
      allCommerces: "Tous les commerces",
      
      // Status and labels
      type: "Type",
      condition: "Condition",
      location: "Localisation",
      createdOn: "Créée le",
      daysRemaining: "Jours restants",
      modifiedOn: "Modifiée le",
      startDate: "Début",
      endDate: "Fin",
      days: "jours",
      
      // Offer types
      inStore: "En magasin",
      online: "En ligne", 
      both: "Les deux",
      
      // Customer preview
      claimOffer: "Réclamer l'offre",
      offerImage: "Image de l'offre",
      conditionsAvailable: "Conditions disponibles",
      commerceLocation: "Emplacement du commerce",
      notSpecified: "Non spécifié",
      
      // Empty states and loading
      loadingOffers: "Chargement des offres...",
      noOffersFound: "Aucune offre trouvée",
      createFirstOffer: "Commencez par créer votre première offre pour attirer plus de clients.",
      
      // Content limits
      freePlan: "Plan Gratuit:",
      proPlan: "Plan Plus:",
      contentUsed: "publication utilisée",
      limitReached: "Limite atteinte!",
      contentLimitReached: "Limite de publication atteinte. Passez au plan Plus pour créer plus de publication.",
      upgradeToPro: "Passer au Plus",
      
      // Customer preview explanation
      userExperiencePreview: "👀 Aperçu de l'expérience utilisateur",
      userExperienceDesc: "Voici exactement comment vos offres apparaissent aux utilisateurs dans l'application Gosholo. Les petites icônes d'édition en haut à droite vous permettent de modifier vos offres directement depuis cette vue.",
      
      // Time labels
      notDefined: "Non défini",
      expired: "Expiré",
      endsIn: "Se termine dans",
      endsHours: "h",
      endsDays: "j",
      
      // Image upload recommendations
      imageRecommendedFormat: "Recommandé : Format carré (1:1)",
      imageFormats: "Formats : JPG, PNG, WebP, GIF",
      imageMaxSize: "Max : 5 MB",
      clickToUpload: "Cliquez pour télécharger une image",
      dragAndDrop: "ou glissez-déposez votre fichier ici",
      chooseImage: "Choisir une image"
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
      endDate: "Date de fin",
      
      // Event creation flow specific
      titleRequired: "Titre requis",
      descriptionRequired: "Description requise", 
      commerceRequired: "Commerce requis",
      startDateRequired: "Date de début requise",
      endDateRequired: "Date de fin requise",
      endDateAfterStart: "La date de fin doit être après la date de début",
      correctErrors: "Veuillez corriger les erreurs suivantes :",
      
      // Confirmation dialog
      confirmPublication: "Confirmer la publication",
      confirmPublishDesc: "Êtes-vous sûr de vouloir publier cet événement ?",
      readyToPublish: "Prêt à publier",
      period: "Période:",
      from: "Du",
      to: "au",
      eventWillBeOnline: "Votre événement sera maintenant en ligne !",
      visibleOnProfile: "Il sera visible sur votre fiche commerce, sur la carte, et dans les sections de l'application.",
      canModifyAnytime: "Vous pourrez le modifier ou le désactiver à tout moment. (Lors d'un changement ou de la désactivation, les utilisateurs ayant ajouté votre événement en favori seront avertis.)",
      backToPreview: "Retour à la prévisualisation",
      
      // Preview section
      eventPreview: "Aperçu de votre événement",
      howEventAppears: "Voici comment votre événement apparaîtra aux utilisateurs de Gosholo",
      userExperiencePreview: "✨ Aperçu de l'expérience utilisateur",
      exactlyHowAppears: "C'est exactement ainsi que votre événement apparaîtra aux utilisateurs dans l'application Gosholo.",
      backToEdit: "Retour modifier",
      continueToPublication: "Continuer vers la publication",
      eventImage: "Image de l'événement",
      dateNotDefined: "Date non définie",
      scheduleToDefine: "Horaire à définir",
      freeEntry: "Entrée libre",
      venueToConfirm: "Lieu à confirmer",
      interested: "intéressés",
      participate: "Participer",
      details: "Details",
      
      // Success screen
      eventCreatedSuccess: "🎉 Événement créé avec succès !",
      eventNowOnline: "Votre événement est maintenant en ligne et visible par les utilisateurs.",
      boostEventNow: "Boostez votre événement maintenant ?",
      increaseVisibility72h: "Augmentez la visibilité pendant 72 heures",
      skipForNow: "Passer pour le moment",
      featuredBoost: "En Vedette",
      premiumVisibility72h: "72h de visibilité premium",
      featuredBadgeVisible: "Badge Vedette pour vous démarquer",
      priorityInSearch: "Placement prioritaire dans la liste des offres/événements",
      highlightedOnMap: "Apparition en haut des résultats de recherche",
      featuredOnWebsite: "votre événement sera mis de l'avant sur le site web gosholo.com",
      useCredit: "Utiliser crédit",
      available: "dispo",
      buy5dollars: "Acheter 5$",
      
      // Form labels
      commerceLabel: "Commerce",
      noCommerceAvailable: "Aucun commerce disponible",
      mustCreateCommerceFirst: "Vous devez d'abord créer un commerce avant de pouvoir créer un événement.",
      backToDashboard: "Retour au tableau de bord",
      commercePreselected: "Commerce pré-sélectionné",
      selectCommerce: "Sélectionner un commerce (obligatoire)",
      eventImageLabel: "Image de l'événement",
      postalCodeOptional: "Code postal (optionnel)",
      searchingSector: "📍 Recherche du secteur...",
      sectorFound: "✅ Secteur trouvé:",
      specificAddress: "Adresse spécifique (optionnel)",
      ifDifferentFromMain: "Si différente du commerce principal",
      conditionOptional: "(optionnel)",
      
      // Placeholders
      eventTitlePlaceholder: "Ex: Atelier cuisine, Soirée networking, Lancement produit",
      shortDescriptionPlaceholder: "Description courte (max 250 caractères)",
      postalCodePlaceholder: "Ex: H2X 1Y4, M5V 3A8, V6B 1A1",
      specificAddressPlaceholder: "Ex: 123 Rue Saint-Paul Est",
      imageUploadError: "Erreur:",
      preview: "Aperçu",
      willAppearLikeThis: "C'est ainsi qu'elle apparaîtra dans votre carte",
      livePreview: "Aperçu client"
    },

    // Events page
    eventsPage: {
      title: "Événements",
      subtitle: "Gérez vos événements et ateliers",
      addEvent: "Ajouter un événement",
      createNewEvent: "Créer un nouvel événement",
      createNewEventDesc: "Remplissez les informations pour créer un nouvel événement.",
      editEvent: "Modifier l'événement",
      editEventDesc: "Modifiez les informations de votre événement.",
      deleteEvent: "Supprimer l'événement",
      deleteEventDesc: "Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.",
      eventToDelete: "Événement à supprimer :",
      deleteEventWarning: "Cette action supprimera définitivement cet événement de votre compte.",
      deletePermanently: "Supprimer définitivement",
      
      // Filters and views
      allEvents: "Tous",
      activeEvents: "Actifs",
      finishedEvents: "Terminés",
      management: "Gestion",
      customerPreview: "Aperçu client",
      commerce: "Commerce",
      allCommerces: "Tous les commerces",
      
      // Status and labels
      condition: "Condition",
      location: "Lieu",
      createdOn: "Créé le",
      modifiedOn: "Modifié le",
      startDate: "Début",
      endDate: "Fin",
      schedule: "Horaire",
      
      // Event status
      upcoming: "À venir",
      ongoing: "En cours",
      finished: "Terminé",
      dateNotDefined: "Date non définie",
      scheduleToDefine: "Horaire à définir",
      freeEntry: "Entrée libre",
      venueToConfirm: "Lieu à confirmer",
      commerceLocation: "Emplacement du commerce",
      notSpecified: "Non spécifié",
      
      // Empty states and loading
      loadingEvents: "Chargement des événements...",
      noEventsFound: "Aucun événement trouvé",
      createFirstEvent: "Commencez par créer votre premier événement pour engager votre communauté.",
      
      // Content limits
      freePlan: "Plan Gratuit:",
      proPlan: "Plan Plus:",
      contentUsed: "publication utilisée",
      limitReached: "Limite atteinte!",
      contentLimitReached: "Limite de publication atteinte. Passez au plan Plus pour créer plus de publication.",
      upgradeToPro: "Passer au Plus",
      
      // Customer preview explanation
      userExperiencePreview: "👀 Aperçu de l'expérience utilisateur",
      userExperienceDesc: "Voici exactement comment vos événements apparaissent aux utilisateurs dans l'application Gosholo. Les petites icônes d'édition en haut à droite vous permettent de modifier vos événements directement depuis cette vue."
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
      deleting: "Suppression...",
      contentLimitReached: "Limite de publication atteinte",
      upgradeToCreateMore: "Passez au plan Pro pour créer plus de publication.",
      success: "Succès",
      error: "Erreur",
      passwordUpdated: "Mot de passe mis à jour avec succès",
      commerceDeleteError: "Erreur lors de la suppression du commerce",
      unexpectedError: "Erreur inattendue lors du chargement"
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

    // Boosts page
    boostsPage: {
      title: "Boosts & Abonnements",
      subtitle: "Faites rayonner votre entreprise et gagnez en visibilité.",
      
      // Subscription section
      yourSubscription: "Votre Abonnement",
      upgradeWithPlus: "Passez au niveau supérieur avec gosholo Plus",
      gosholoBase: "gosholo Base",
      gosholoPLUS: "gosholo PLUS",
      current: "Actuel",
      freePlan: "Plan gratuit",
      upgradeSpeed: "Passez à la vitesse supérieure",
      perMonth: "/mois",
      upgradeToPLUS: "Passer au PLUS",
      
      // Base plan features
      maxOneContent: "Maximum de 2 publications actives en même temps (1 offre et/ou 1 événement).",
      realtimeStats: "Accès à vos statistiques en temps réel", 
      businessOnMap: "Votre entreprise affichée sur la carte interactive gosholo",
      
      // Plus plan features
      upTo5Content: "Jusqu'à 10 publications actives en même temps (5 offres et/ou 5 événements actifs en même temps)",
      everythingInBase: "Tout ce que l'offre gosholo Base inclut",
      monthlyVedette: "1 Boost Vedette par mois (mettez en avant une offre ou un événement pendant 72h)",
      monthlyVisibility: "1 Boost Visibilité par mois (mettez votre commerce en avant sur la carte interactive)",
      boostRenewal: "Les Boost inclus avec l'abonnement se renouvellent chaque mois mais ne s'accumulent pas. Utilisez-les avant la fin du mois.",
      
      // Boost credits stats
      vedetteCredits: "Vedette Crédits",
      visibilityCredits: "Visibilité Crédits",
      boostedContent: "Publication Boostée",
      
      // A la carte section
      boostsALaCarte: "Boosts à la Carte",
      gainVisibilityAttractClients: "Gagnez en visibilité et attirez plus de clients.",
      duration72h: "72h",
      
      // Vedette boost
      attractAllEyes: "Attirez tous les regards sur votre offre ou événement",
      vedetteBadge: "Badge Vedette pour vous démarquer",
      priorityPlacement: "Placement prioritaire dans la liste des offres/événements",
      topSearchResults: "Apparition en haut des résultats de recherche",
      featuredOnWebsite: "votre offre/événement sera mis de l'avant sur le site web gosholo.com",
      buy5dollars: "Acheter 5$",
      
      // Visibility boost
      shineOnMap: "Faites briller votre commerce sur la carte interactive",
      priorityOnMap: "Placement prioritaire dans la carte gosholo",
      attractNearbyMembers: "Attirez l'attention des membres qui recherchent autour d'eux",
      highlightWhereCounts: "Mettez votre commerce en avant là où ça compte vraiment",
      
      // Content section
      yourActiveContent: "Votre publication en cours",
      contentReadyToBoost: "Retrouvez ici vos offres, événements et commerces actifs, prêts à être boostés en un clic",
      noContent: "Aucune publication",
      createContentToBoost: "Créez des offres, événements ou commerces pour utiliser les boosts",
      goToBusinesses: "Aller aux commerces",
      offer: "Offre",
      event: "Événement",
      business: "Commerce",
      removeBoost: "Retirer le boost",
      boostActive: "Boost actif - Expire automatiquement",
      unknownBusiness: "Commerce inconnu",
      
      // Promo code section
      promoCode: "Code Promo",
      havePromoCode: "Vous avez un code promo ?",
      validPromoCode: "Code promo valide ! Vous obtenez 1 mois gratuit.",
      invalidPromoCode: "Code promo invalide. Veuillez vérifier et réessayer.",
      validationError: "Erreur lors de la validation. Veuillez réessayer.",
      
      // Stripe payment
      securePayment: "Paiement Sécurisé",
      freeMonthThanks: "1 mois gratuit grâce à votre code promo !",
      cardNumber: "Numéro de carte",
      expirationDate: "Date d'expiration",
      freeMonth: "1 mois gratuit",
      thenNormalRate: "Puis tarif normal",
      paySecurely: "Payer en toute sécurité",
      cancel: "Annuler",
      
      // Error messages
      boostApplyError: "Erreur lors de l'application du boost",
      boostRemoveError: "Erreur lors de la suppression du boost",
      subscriptionError: "Erreur lors de la création de l'abonnement",
      remainingTime: "restantes",
      duration: "Durée",
      remaining: "Reste",
      
      // Boost purchase form
      purchaseBoostTitle: "Achat Boost",
      paymentSuccessful: "🎉 Paiement réussi !",
      boostAddedToAccount: "a été ajouté à votre compte.",
      yourBoost: "Votre boost",
      creditAvailable: "crédit",
      available: "disponible",
      canUseOnContent: "Vous pouvez maintenant l'utiliser sur vos offres et événements",
      windowWillClose: "Cette fenêtre se fermera automatiquement dans quelques secondes...",
      processing: "Traitement...",
      pay5dollars: "Payer $5"
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
      deletePermanently: "Supprimer définitivement",
      
      // Plan descriptions
      basicLimitedAccess: "Accès de base limité",
      
      // Usage stats
      contentUsed: "Publication utilisée",
      limitReached: "Limite atteinte!",
      upgradeToPro: "Passez au plan Pro pour créer plus de publication.",
      deleteContentOrSupport: "Supprimez du publication ou contactez le support.",
      available: "disponible",
      availablePlural: "disponibles",
      upgradeToProBoosts: "Passez au plan Pro pour obtenir 1 crédit boost par mois",
      
      // Account info
      accountInfo: "Informations du compte",
      email: "Email",
      name: "Nom",
      phone: "Téléphone",
      memberSince: "Membre depuis",
      changePassword: "Changer le mot de passe",
      
      // Commerce management
      manageCommerces: "Gérez vos commerces et leurs informations",
      noCommerce: "Aucun commerce",
      createFirstCommerce: "Créez votre premier commerce pour commencer",
      createdOn: "Créé le",
      
      // Account actions
      accountActions: "Actions du compte",
      signOut: "Se déconnecter",
      deleteAccount: "Supprimer le compte",
      deleteAccountTitle: "Supprimer définitivement le compte",
      deleteAccountDesc: "Cette action supprimera définitivement votre compte et toutes vos données associées.",
      deleteAccountWarning: "⚠️ Cette action est irréversible. Toutes vos données seront définitivement supprimées :",
      deleteAccountDataList: "• Votre profil et informations personnelles\n• Tous vos commerces, offres et événements\n• Vos abonnements et crédits boost\n• Votre historique de transactions\n• Vos favoris et préférences",
      deleteAccountConfirm: "Pour confirmer la suppression, tapez \"SUPPRIMER\" ci-dessous :",
      deleteAccountButton: "Supprimer définitivement le compte",
      deleteAccountSuccess: "Compte supprimé avec succès",
      deleteAccountError: "Erreur lors de la suppression du compte",
      deleteAccountProcessing: "Suppression en cours...",
      deleteAccountCancel: "Annuler",
      typeDelete: "SUPPRIMER",
      confirmationMismatch: "Le texte de confirmation ne correspond pas",
      
      // Modal dialogs
      editProfileTitle: "Modifier le profil",
      editProfileDesc: "Mettez à jour vos informations personnelles",
      changePasswordTitle: "Changer le mot de passe",
      changePasswordDesc: "Mettez à jour votre mot de passe pour sécuriser votre compte",
      manageSubscriptionTitle: "Gérer l'abonnement",
      manageSubscriptionDesc: "Comparez les plans et modifiez votre abonnement",
      manageCommerceTitle: "Gérer le commerce",
      manageCommerceDesc: "Modifiez les informations de",
      createCommerceTitle: "Créer un nouveau commerce",
      createCommerceDesc: "Remplissez les informations pour créer un nouveau commerce.",
      deleteCommerceTitle: "Supprimer le commerce",
      deleteCommerceDesc: "Êtes-vous sûr de vouloir supprimer ce commerce ? Cette action est irréversible.",
      commerceToDelete: "Commerce à supprimer :",
      deleteWarning: "Cette action supprimera également toutes les offres et événements associés à ce commerce.",
      cancel: "Annuler",
      
      // Success messages
      commerceDeletedSuccess: "supprimé avec succès",
      
      // Error messages
      logoutError: "Erreur lors de la déconnexion",
      deleteCommerceError: "Erreur lors de la suppression du commerce"
    },

    // Support page
    support: {
      title: "Support / FAQ",
      subtitle: "Retrouvez ici toutes les réponses à vos questions et contactez-nous au besoin.",
      contactForm: "Formulaire de contact rapide",
      thankYouMessage: "Merci pour votre message ! Nous vous répondrons rapidement.",
      yourName: "Votre nom",
      yourEmail: "Votre email",
      yourMessage: "Votre message...",
      send: "Envoyer",
      directContact: "Contact direct",
      email: "Email",
      faq: "FAQ",
      comingSoon: "(Bientôt disponible)"
    },

    // Header and user interface
    header: {
      partner: "Partenaire",
      profile: "Profil",
      logout: "Se déconnecter"
    },

    // Payment history
    paymentHistory: {
      title: "Historique de paiement",
      subtitle: "Consultez vos achats de boosts et abonnements",
      noTransactions: "Aucune transaction trouvée",
      loading: "Chargement...",
      loadingTransactions: "Chargement des transactions...",
      error: "Erreur inattendue lors du chargement",
      succeeded: "Réussi",
      pending: "En cours",
      failed: "Échoué",
      cancelled: "Annulé",
      openPortal: "Ouvrir le portail client",
      subscriptionPro: "Abonnement Pro",
      boostCredits: "Crédits Boost",
      manageCards: "Gérer mes cartes",
      transactions: "transactions",
      transaction: "transaction",
      noTransactionsTitle: "Aucune transaction",
      noTransactionsDesc: "Vos achats de boosts et abonnements apparaîtront ici",
      buyBoosts: "Acheter des boosts",
      viewReceipt: "Voir le reçu",
      receipt: "Reçu",
      receiptNotAvailable: "Reçu non disponible pour cette transaction",
      receiptError: "Erreur lors de la récupération du reçu",
      boostPurchased: "Boost acheté",
      subscriptionPurchased: "Abonnement acheté",
      summary: "Résumé",
      paymentStats: "Statistiques de vos paiements",
      boostsPurchased: "Boosts achetés",
      subscriptions: "Abonnements",
      totalSpent: "Total dépensé",
      transactionId: "ID de transaction",
      userNotAuthenticated: "Utilisateur non authentifié",
      errorLoadingBoosts: "Erreur lors du chargement des transactions boost",
      card: "Carte",
      currency: "Monnaie",
      generatedOn: "Généré le",
      transactionDetails: "Détails de Transaction",
      date: "Date",
      status: "Statut",
      amount: "Montant"
    },

    // Form validation
    validation: {
      required: "Ce champ est obligatoire",
      invalidEmail: "Adresse email invalide",
      invalidPhone: "Numéro de téléphone invalide",
      invalidUrl: "URL invalide",
      invalidPostalCode: "Code postal invalide (format: H2X 1Y4)",
      nameTooLong: "Le nom est trop long",
      descriptionTooLong: "La description est trop longue",
      commerceNameRequired: "Nom du commerce requis",
      postalCodeRequired: "Code postal requis",
      addressRequired: "Adresse complète requise",
      categoryRequired: "Catégorie requise",
      firstNameRequired: "Le prénom est requis",
      lastNameRequired: "Le nom est requis",
      emailRequired: "L'email est requis",
      passwordRequired: "Le mot de passe est requis",
      passwordMinLength: "Le mot de passe doit contenir au moins 6 caractères",
      termsRequired: "Vous devez accepter les conditions d'utilisation"
    },

    // Placeholders and defaults
    placeholders: {
      notSelected: "Non sélectionné",
      notDefined: "Non défini",
      expired: "Expiré",
      restaurant: "Restaurant",
      commerce: "Commerce",
      commerceLocation: "Emplacement du commerce",
      selectType: "Sélectionner un type",
      enterPromoCode: "Entrez votre code promo",
      applying: "Application...",
      validating: "Validation...",
      apply: "Appliquer",
      endsIn: "Se termine dans",
      endsDays: "j",
      endsHours: "h"
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
      support: "Support / FAQ"
    },
    
    // Authentication
    auth: {
      registrationSuccess: "Registration successful!",
      accountCreated: "Your account has been created successfully.",
      checkEmail: "📧 Check your email",
      confirmationSent: "We have sent a confirmation link to",
      loginAfterConfirmation: "You will be able to log in once your email is confirmed.",
      signIn: "Sign in",
      checkEmailError: "Check your email to confirm your account before signing in.",
      welcomeTitle: "Welcome to gosholo",
      welcomeSubtitle: "Sign in to your merchant space",
      loginTitle: "Login",
      loginDescription: "Enter your credentials to access your merchant space",
      emailLabel: "Email address",
      emailPlaceholder: "your@email.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Your password",
      forgotPassword: "Forgot password?",
      loggingIn: "Signing in...",
      loginButton: "Sign in",
      noAccount: "Don't have an account yet?",
      createAccount: "Create an account",
      loginAcceptTerms: "By signing in, you agree to our",
      termsOfUse: "terms of use",
      andOur: "and our",
      privacyPolicy: "privacy policy",
      registerTitle: "Create your account to access your Gosholo business platform",
      registerSubtitle: "This information is only used to create your personal dashboard access. It will not be visible on your profile or in the application",
      createAccountTitle: "Create your account",
      createAccountDescription: "Fill in the information below to create your merchant account",
      personalInfo: "Personal information",
      firstName: "First name",
      firstNamePlaceholder: "John",
      lastName: "Last name",
      lastNamePlaceholder: "Doe",
      email: "Email",
      emailPlaceholderRegister: "john@example.com",
      phone: "Phone",
      phonePlaceholder: "012 234-6789",
      security: "Security",
      passwordPlaceholderRegister: "Minimum 6 characters",
      acceptTerms: "I accept the",
      acceptTermsButton: "terms of use",
      loading: "Loading...",
      creatingAccount: "Loading...",
      createMyAccount: "Create my account",
      alreadyHaveAccount: "Already have an account?",
      connect: "Sign in",
      registerAcceptTerms: "By creating an account, you agree to our",
      contentDisclaimer: "By publishing content on gosholo, you agree that your offers, events and visuals may be used by gosholo for promotional purposes, to showcase your business and the platform.",
      incorrectCredentials: "Incorrect email or password.",
      accountCreationError: "Error creating account"
    },
    
    // Dashboard
    dashboard: {
      welcome: "Welcome",
      title: "Dashboard",
      subtitle: "Here's an overview of your business activity",
      yourCommerces: "Your Businesses",
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
      seeBoosts: "See boosts and subscriptions",
      createBusinessProfile: "Create your business profile",
      enterBusinessInfo: "Enter your business information to make it visible on the gosholo map and start publishing your offers and events.",
      loadingCommerces: "Loading your businesses...",
      welcomeMessage: "It's free! Add a business to your account to appear on the gosholo map and start attracting customers with your offers and events.",
      addBusiness: "Add a business",
      boostMessage: "You are currently on the free plan.<br />Level up and discover our boosts and subscriptions to gain visibility and attract even more customers."
    },

    // Commerce card
    commerceCard: {
      visibilityBoost: "Visibility Boost",
      boostThisBusiness: "Boost this business",
      manageBusiness: "Manage this business",
      activeOffers: "Active Offers",
      upcomingEvents: "Upcoming Events",
      noActiveOffers: "No active offers",
      noUpcomingEvents: "No upcoming events",
      createOffer: "Create offer",
      createEvent: "Create event",
      limitReached: "Limit reached",
      boost: "Boost",
      active: "Active",
      finished: "Finished",
      upcoming: "Upcoming",
      expiresOn: "Expires on",
      alreadyBoosted: "Already boosted",
      alreadyBoostedDesc: "This content is already boosted.",
      boostApplied: "Boost applied!",
      boostAppliedDesc: "is now boosted for 72 hours.",
      error: "Error",
      cannotApplyBoost: "Cannot apply boost.",
      success: "Success",
      businessDeleted: "Business deleted successfully",
      unexpectedError: "Unexpected error during deletion",
      offerDeletedSuccess: "Offer deleted successfully",
      eventDeletedSuccess: "Event deleted successfully",
      offer: "offer",
      event: "event",
      business: "business",
      your: "Your",
      errorDeletingOffers: "Error deleting associated offers",
      errorDeletingEvents: "Error deleting associated events",
      errorDeletingBusiness: "Error deleting business"
    },

    // Modal dialogs
    modals: {
      editOffer: "Edit offer",
      editOfferDesc: "Modify your offer information.",
      editEvent: "Edit event", 
      editEventDesc: "Modify your event information.",
      manageBusiness: "Manage business",
      manageBusinessDesc: "Modify information for",
      confirmDelete: "Confirm deletion",
      confirmDeleteDesc: "Are you sure you want to delete",
      thisOffer: "this offer",
      thisEvent: "this event",
      actionIrreversible: "This action is irreversible.",
      cancel: "Cancel",
      delete: "Delete",
      confirmDeleteBusiness: "Confirm business deletion",
      confirmDeleteBusinessDesc: "Are you sure you want to delete this business? This action will also delete all associated offers and events. This action is irreversible.",
      deleteBusiness: "Delete business",
      businessContains: "This business contains",
      offersAnd: "offer(s) and",
      eventsWillBeDeleted: "event(s) that will also be deleted.",
      boostYour: "Boost your",
      boostBusinessDesc: "Boost the visibility of",
      onMapFor72h: "on the map for 72 hours.",
      chooseBoostType: "Choose the boost type to increase the visibility of",
      for72h: "for 72 hours.",
      visibility: "Visibility",
      extendedReach72h: "72h extended reach",
      moreVisibleOnMap: "More visible on map",
      increasesTraffic: "Increases traffic",
      extendedGeoReach: "Extended geographic reach",
      useCredit: "Use credit",
      available: "available",
      buy5dollars: "Buy $5",
      featured: "Featured",
      premiumVisibility72h: "72h premium visibility",
      featuredBadgeVisible: "Featured badge to stand out",
      priorityInSearch: "Priority placement in offers/events list",
      highlightedOnMap: "Appears at the top of search results",
      featuredOnWebsite: "your offer will be featured on the gosholo.com website"
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
      subCategory: "Sub-category",
      subCategoryPlaceholder: "Select a sub-category",
      email: "Email",
      emailPlaceholder: "contact@yourbusiness.com",
      phone: "Phone",
      phonePlaceholder: "(514) 123-4567",
      website: "Website",
      websitePlaceholder: "https://yourbusiness.com",
      facebook: "Facebook",
      facebookPlaceholder: "facebook.com/mybusiness or https://facebook.com/mybusiness",
      instagram: "Instagram",
      instagramPlaceholder: "instagram.com/mybusiness",
      image: "Business image",
      required: "required",
      contactInfo: "Contact Information",
      socialNetworks: "Social Networks",
      exactAddress: "Exact address of your business (number, street, etc.)",
      noDescription: "No description",
      addressLabel: "Address:",
      previewTitle: "Preview your business",
      previewDesc: "Check that all information is correct before creating",
      preview: "Preview",
      readyToCreate: "Ready to create",
      confirmCreateDesc: "Are you sure you want to create this business?",
      businessWillBeCreated: "Your business will now be created!",
      canCreateOffersEvents: "You will then be able to create offers and events for this business.",
      canModifyDelete: "You can modify or delete it at any time from your dashboard.",
      categoryLabel: "Category:"
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
      image: "Offer image",
      
      // Offer creation flow specific
      titleRequired: "Title required",
      descriptionRequired: "Description required",
      commerceRequired: "Business required",
      startDateRequired: "Start date required",
      endDateRequired: "End date required",
      startDatePast: "Start date cannot be in the past",
      endDatePast: "End date cannot be in the past", 
      endDateAfterStart: "End date must be after start date",
      maxDuration30Days: "Offer duration cannot exceed 30 days",
      correctErrors: "Please correct the following errors:",
      
      // Confirmation dialog
      confirmPublication: "Confirm publication",
      confirmPublishDesc: "Are you sure you want to publish this offer?",
      readyToPublish: "Ready to publish",
      period: "Period:",
      from: "From",
      to: "to",
      offerWillBeOnline: "Your offer will now be online!",
      visibleOnProfile: "It will be visible on your business profile, on the map, and in the app sections.",
      canModifyAnytime: "You can modify or deactivate it at any time. (When changed or deactivated, users who have favorited your offer will be notified.)",
      backToPreview: "Back to preview",
      
      // Preview section
      offerPreview: "Preview your offer",
      howOfferAppears: "Here's how your offer will appear to gosholo users",
      userExperiencePreview: "✨ User experience preview",
      exactlyHowAppears: "This is exactly how your offer will appear to users in the Gosholo app.",
      backToEdit: "Back to edit",
      continueToPublication: "Continue to publication",
      
      // Success screen
      offerCreatedSuccess: "🎉 Offer created successfully!",
      offerNowOnline: "Your offer is now online and visible to users.",
      boostOfferNow: "Boost your offer now?",
      increaseVisibility72h: "Increase visibility for 72 hours",
      skipForNow: "Skip for now",
      featuredBoost: "Featured",
      premiumVisibility72h: "72h premium visibility",
      featuredBadgeVisible: "Featured badge to stand out",
      priorityInSearch: "Priority placement in offers/events list",
      highlightedOnMap: "Appears at the top of search results",
      featuredOnWebsite: "your offer will be featured on the gosholo.com website",
      useCredit: "Use credit",
      available: "available",
      buy5dollars: "Buy $5",
      
      // Form labels
      commerceLabel: "Business",
      noCommerceAvailable: "No business available",
      mustCreateCommerceFirst: "You must first create a business before you can create an offer.",
      backToDashboard: "Back to dashboard",
      commercePreselected: "Business pre-selected",
      selectCommerce: "Select a business (required)",
      postalCodeOptional: "Postal code (optional)",
      searchingSector: "📍 Searching sector...",
      sectorFound: "✅ Sector found:",
      specificAddress: "Specific address (optional)",
      ifDifferentFromMain: "If different from main business",
      conditionOptional: "(optional)",
      
      // Placeholders
      offerTitlePlaceholder: "Ex: 2 coffees for $5, 10% off everything",
      shortDescriptionPlaceholder: "Short description (max 250 characters)",
      postalCodePlaceholder: "Ex: H2X 1Y4, M5V 3A8, V6B 1A1",
      specificAddressPlaceholder: "Ex: 123 Saint-Paul Street East",
      imageUploadError: "Error:",
      preview: "Preview",
      willAppearLikeThis: "This is how it will appear in your card",
      livePreview: "Client Preview"
    },

    // Offers page
    offersPage: {
      title: "Offers",
      subtitle: "Manage your offers and promotions",
      addOffer: "Add offer",
      createNewOffer: "Create new offer",
      createNewOfferDesc: "Fill in the information to create a new offer.",
      editOffer: "Edit offer",
      editOfferDesc: "Modify your offer information.",
      deleteOffer: "Delete offer",
      deleteOfferDesc: "Are you sure you want to delete this offer? This action is irreversible.",
      offerToDelete: "Offer to delete:",
      deleteOfferWarning: "This action will permanently delete this offer from your account.",
      deletePermanently: "Delete permanently",
      
      // Filters and views
      allOffers: "All",
      activeOffers: "Active",
      finishedOffers: "Finished",
      management: "Management",
      customerPreview: "Customer preview",
      commerce: "Business",
      allCommerces: "All businesses",
      
      // Status and labels
      type: "Type",
      condition: "Condition",
      location: "Location",
      createdOn: "Created on",
      daysRemaining: "Days remaining",
      modifiedOn: "Modified on",
      startDate: "Start",
      endDate: "End",
      days: "days",
      
      // Offer types
      inStore: "In store",
      online: "Online",
      both: "Both",
      
      // Customer preview
      claimOffer: "Claim offer",
      offerImage: "Offer image",
      conditionsAvailable: "Conditions available",
      commerceLocation: "Business location",
      notSpecified: "Not specified",
      
      // Empty states and loading
      loadingOffers: "Loading offers...",
      noOffersFound: "No offers found",
      createFirstOffer: "Start by creating your first offer to attract more customers.",
      
      // Content limits
      freePlan: "Free Plan:",
      proPlan: "Plus Plan:",
      contentUsed: "publication used",
      limitReached: "Limit reached!",
      contentLimitReached: "Publication limit reached. Upgrade to Pro plan to create more publications.",
      upgradeToPro: "Upgrade to Pro",
      
      // Customer preview explanation
      userExperiencePreview: "👀 User experience preview",
      userExperienceDesc: "This is exactly how your offers appear to users in the Gosholo app. The small edit icons in the top right allow you to modify your offers directly from this view.",
      
      // Time labels
      notDefined: "Not defined",
      expired: "Expired", 
      endsIn: "Ends in",
      endsHours: "h",
      endsDays: "d",
      
      // Image upload recommendations
      imageRecommendedFormat: "Recommended: Square format (1:1)",
      imageFormats: "Formats: JPG, PNG, WebP, GIF",
      imageMaxSize: "Max: 5 MB",
      clickToUpload: "Click to upload an image",
      dragAndDrop: "or drag and drop your file here",
      chooseImage: "Choose image"
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
      endDate: "End date",
      
      // Event creation flow specific
      titleRequired: "Title required",
      descriptionRequired: "Description required", 
      commerceRequired: "Business required",
      startDateRequired: "Start date required",
      endDateRequired: "End date required",
      endDateAfterStart: "End date must be after start date",
      correctErrors: "Please correct the following errors:",
      
      // Confirmation dialog
      confirmPublication: "Confirm publication",
      confirmPublishDesc: "Are you sure you want to publish this event?",
      readyToPublish: "Ready to publish",
      period: "Period:",
      from: "From",
      to: "to",
      eventWillBeOnline: "Your event will now be online!",
      visibleOnProfile: "It will be visible on your business profile, on the map, and in the app sections.",
      canModifyAnytime: "You can modify or deactivate it at any time. (When changed or deactivated, users who have favorited your event will be notified.)",
      backToPreview: "Back to preview",
      
      // Preview section
      eventPreview: "Preview your event",
      howEventAppears: "Here's how your event will appear to Gosholo users",
      userExperiencePreview: "✨ User experience preview",
      exactlyHowAppears: "This is exactly how your event will appear to users in the Gosholo app.",
      backToEdit: "Back to edit",
      continueToPublication: "Continue to publication",
      eventImage: "Event image",
      dateNotDefined: "Date not defined",
      scheduleToDefine: "Schedule to define",
      freeEntry: "Free entry",
      venueToConfirm: "Venue to confirm",
      interested: "interested",
      participate: "Participate",
      details: "Details",
      
      // Success screen
      eventCreatedSuccess: "🎉 Event created successfully!",
      eventNowOnline: "Your event is now online and visible to users.",
      boostEventNow: "Boost your event now?",
      increaseVisibility72h: "Increase visibility for 72 hours",
      skipForNow: "Skip for now",
      featuredBoost: "Featured",
      premiumVisibility72h: "72h premium visibility",
      featuredBadgeVisible: "Featured badge to stand out",
      priorityInSearch: "Priority placement in offers/events list",
      highlightedOnMap: "Appears at the top of search results",
      featuredOnWebsite: "your event will be featured on the gosholo.com website",
      useCredit: "Use credit",
      available: "available",
      buy5dollars: "Buy $5",
      
      // Form labels
      commerceLabel: "Business",
      noCommerceAvailable: "No business available",
      mustCreateCommerceFirst: "You must first create a business before you can create an event.",
      backToDashboard: "Back to dashboard",
      commercePreselected: "Business pre-selected",
      selectCommerce: "Select a business (required)",
      eventImageLabel: "Event image",
      postalCodeOptional: "Postal code (optional)",
      searchingSector: "📍 Searching sector...",
      sectorFound: "✅ Sector found:",
      specificAddress: "Specific address (optional)",
      ifDifferentFromMain: "If different from main business",
      conditionOptional: "(optional)",
      
      // Placeholders
      eventTitlePlaceholder: "Ex: Cooking workshop, Networking evening, Product launch",
      shortDescriptionPlaceholder: "Short description (max 250 characters)",
      postalCodePlaceholder: "Ex: H2X 1Y4, M5V 3A8, V6B 1A1",
      specificAddressPlaceholder: "Ex: 123 Saint-Paul Street East",
      imageUploadError: "Error:",
      preview: "Preview",
      willAppearLikeThis: "This is how it will appear in your card",
      livePreview: "Client Preview"
    },

    // Events page
    eventsPage: {
      title: "Events",
      subtitle: "Manage your events and workshops",
      addEvent: "Add event",
      createNewEvent: "Create new event",
      createNewEventDesc: "Fill in the information to create a new event.",
      editEvent: "Edit event",
      editEventDesc: "Modify your event information.",
      deleteEvent: "Delete event",
      deleteEventDesc: "Are you sure you want to delete this event? This action is irreversible.",
      eventToDelete: "Event to delete:",
      deleteEventWarning: "This action will permanently delete this event from your account.",
      deletePermanently: "Delete permanently",
      
      // Filters and views
      allEvents: "All",
      activeEvents: "Active",
      finishedEvents: "Finished",
      management: "Management",
      customerPreview: "Customer preview",
      commerce: "Business",
      allCommerces: "All businesses",
      
      // Status and labels
      condition: "Condition",
      location: "Location",
      createdOn: "Created on",
      modifiedOn: "Modified on",
      startDate: "Start",
      endDate: "End",
      schedule: "Schedule",
      
      // Event status
      upcoming: "Upcoming",
      ongoing: "Ongoing",
      finished: "Finished",
      dateNotDefined: "Date not defined",
      scheduleToDefine: "Schedule to define",
      freeEntry: "Free entry",
      venueToConfirm: "Venue to confirm",
      commerceLocation: "Business location",
      notSpecified: "Not specified",
      
      // Empty states and loading
      loadingEvents: "Loading events...",
      noEventsFound: "No events found",
      createFirstEvent: "Start by creating your first event to engage your community.",
      
      // Content limits
      freePlan: "Free Plan:",
      proPlan: "Plus Plan:",
      contentUsed: "publication used",
      limitReached: "Limit reached!",
      contentLimitReached: "Publication limit reached. Upgrade to Pro plan to create more publications.",
      upgradeToPro: "Upgrade to Pro",
      
      // Customer preview explanation
      userExperiencePreview: "👀 User experience preview",
      userExperienceDesc: "This is exactly how your events appear to users in the Gosholo app. The small edit icons in the top right allow you to modify your events directly from this view."
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
      deleting: "Deleting...",
      contentLimitReached: "Publication limit reached",
      upgradeToCreateMore: "Upgrade to Pro plan to create more publications.",
      success: "Success",
      error: "Error",
      passwordUpdated: "Password updated successfully",
      commerceDeleteError: "Error deleting business",
      unexpectedError: "Unexpected error while loading"
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

    // Boosts page
    boostsPage: {
      title: "Boosts & Subscriptions",
      subtitle: "Make your business shine and gain visibility.",
      
      // Subscription section
      yourSubscription: "Your Subscription",
      upgradeWithPlus: "Level up with gosholo Plus",
      gosholoBase: "gosholo Base",
      gosholoPLUS: "gosholo PLUS",
      current: "Current",
      freePlan: "Free plan",
      upgradeSpeed: "Level up",
      perMonth: "/month",
      upgradeToPLUS: "Upgrade to PLUS",
      
      // Base plan features
      maxOneContent: "Maximum 2 active publications at the same time (1 offer and/or 1 event).",
      realtimeStats: "Access to your real-time statistics", 
      businessOnMap: "Your business displayed on the gosholo interactive map",
      
      // Plus plan features
      upTo5Content: "Up to 10 active publications at the same time (5 offers and/or 5 events active at the same time)",
      everythingInBase: "Everything the gosholo Base offer includes",
      monthlyVedette: "1 Featured Boost per month (highlight an offer or event for 72h)",
      monthlyVisibility: "1 Visibility Boost per month (highlight your business on the interactive map)",
      boostRenewal: "Boosts included with the subscription renew each month but do not accumulate. Use them before the end of the month.",
      
      // Boost credits stats
      vedetteCredits: "Featured Credits",
      visibilityCredits: "Visibility Credits",
      boostedContent: "Boosted Content",
      
      // A la carte section
      boostsALaCarte: "A la Carte Boosts",
      gainVisibilityAttractClients: "Gain visibility and attract more clients.",
      duration72h: "72h",
      
      // Vedette boost
      attractAllEyes: "Attract all eyes to your offer or event",
      vedetteBadge: "Featured badge to stand out",
      priorityPlacement: "Priority placement in the offers/events list",
      topSearchResults: "Appear at the top of search results",
      featuredOnWebsite: "your offer/event will be featured on the gosholo.com website",
      buy5dollars: "Buy $5",
      
      // Visibility boost
      shineOnMap: "Make your business shine on the interactive map",
      priorityOnMap: "Priority placement on the gosholo map",
      attractNearbyMembers: "Attract attention from members searching around them",
      highlightWhereCounts: "Highlight your business where it really counts",
      
      // Content section
      yourActiveContent: "Your active publications",
      contentReadyToBoost: "Find here your offers, events and active businesses, ready to be boosted with one click",
      noContent: "No publications",
      createContentToBoost: "Create offers, events or businesses to use boosts",
      goToBusinesses: "Go to businesses",
      offer: "Offer",
      event: "Event",
      business: "Business",
      removeBoost: "Remove boost",
      boostActive: "Boost active - Expires automatically",
      unknownBusiness: "Unknown business",
      
      // Promo code section
      promoCode: "Promo Code",
      havePromoCode: "Do you have a promo code?",
      validPromoCode: "Valid promo code! You get 1 free month.",
      invalidPromoCode: "Invalid promo code. Please check and try again.",
      validationError: "Validation error. Please try again.",
      
      // Stripe payment
      securePayment: "Secure Payment",
      freeMonthThanks: "1 free month thanks to your promo code!",
      cardNumber: "Card number",
      expirationDate: "Expiration date",
      freeMonth: "1 free month",
      thenNormalRate: "Then normal rate",
      paySecurely: "Pay securely",
      cancel: "Cancel",
      
      // Error messages
      boostApplyError: "Error applying boost",
      boostRemoveError: "Error removing boost",
      subscriptionError: "Error creating subscription",
      remainingTime: "remaining",
      duration: "Duration",
      remaining: "Remaining",
      
      // Boost purchase form
      purchaseBoostTitle: "Purchase Boost",
      paymentSuccessful: "🎉 Payment successful!",
      boostAddedToAccount: "has been added to your account.",
      yourBoost: "Your boost",
      creditAvailable: "credit",
      available: "available",
      canUseOnContent: "You can now use it on your offers and events",
      windowWillClose: "This window will close automatically in a few seconds...",
      processing: "Processing...",
      pay5dollars: "Pay $5"
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
      deletePermanently: "Delete permanently",
      
      // Plan descriptions
      basicLimitedAccess: "Basic limited access",
      
      // Usage stats
      contentUsed: "Publication used",
      limitReached: "Limit reached!",
      upgradeToPro: "Upgrade to Pro plan to create more publications.",
      deleteContentOrSupport: "Delete publications or contact support.",
      available: "available",
      availablePlural: "available",
      upgradeToProBoosts: "Upgrade to Pro plan to get 1 boost credit per month",
      
      // Account info
      accountInfo: "Account Information",
      email: "Email",
      name: "Name",
      phone: "Phone",
      memberSince: "Member since",
      changePassword: "Change password",
      
      // Commerce management
      manageCommerces: "Manage your businesses and their information",
      noCommerce: "No businesses",
      createFirstCommerce: "Create your first business to get started",
      createdOn: "Created on",
      
      // Account actions
      accountActions: "Account Actions",
      signOut: "Sign out",
      deleteAccount: "Delete Account",
      deleteAccountTitle: "Permanently Delete Account",
      deleteAccountDesc: "This action will permanently delete your account and all associated data.",
      deleteAccountWarning: "⚠️ This action is irreversible. All your data will be permanently deleted:",
      deleteAccountDataList: "• Your profile and personal information\n• All your businesses, offers and events\n• Your subscriptions and boost credits\n• Your transaction history\n• Your favorites and preferences",
      deleteAccountConfirm: "To confirm deletion, type \"DELETE\" below:",
      deleteAccountButton: "Permanently Delete Account",
      deleteAccountSuccess: "Account successfully deleted",
      deleteAccountError: "Error deleting account",
      deleteAccountProcessing: "Deleting...",
      deleteAccountCancel: "Cancel",
      typeDelete: "DELETE",
      confirmationMismatch: "Confirmation text does not match",
      
      // Modal dialogs
      editProfileTitle: "Edit profile",
      editProfileDesc: "Update your personal information",
      changePasswordTitle: "Change password",
      changePasswordDesc: "Update your password to secure your account",
      manageSubscriptionTitle: "Manage subscription",
      manageSubscriptionDesc: "Compare plans and modify your subscription",
      manageCommerceTitle: "Manage business",
      manageCommerceDesc: "Edit information for",
      createCommerceTitle: "Create new business",
      createCommerceDesc: "Fill in the information to create a new business.",
      deleteCommerceTitle: "Delete business",
      deleteCommerceDesc: "Are you sure you want to delete this business? This action is irreversible.",
      commerceToDelete: "Business to delete:",
      deleteWarning: "This action will also delete all offers and events associated with this business.",
      cancel: "Cancel",
      
      // Success messages
      commerceDeletedSuccess: "deleted successfully",
      
      // Error messages
      logoutError: "Error signing out",
      deleteCommerceError: "Error deleting business"
    },

    // Support page
    support: {
      title: "Support / FAQ",
      subtitle: "Find answers to your questions and contact us if needed.",
      contactForm: "Quick contact form",
      thankYouMessage: "Thank you for your message! We will respond quickly.",
      yourName: "Your name",
      yourEmail: "Your email",
      yourMessage: "Your message...",
      send: "Send",
      directContact: "Direct contact",
      email: "Email",
      faq: "FAQ",
      comingSoon: "(Coming soon)"
    },

    // Header and user interface
    header: {
      partner: "Partner",
      profile: "Profile",
      logout: "Sign out"
    },

    // Payment history
    paymentHistory: {
      title: "Payment History",
      subtitle: "View your boost and subscription purchases",
      noTransactions: "No transactions found",
      loading: "Loading...",
      loadingTransactions: "Loading transactions...",
      error: "Unexpected error while loading",
      succeeded: "Succeeded",
      pending: "Pending",
      failed: "Failed",
      cancelled: "Cancelled",
      openPortal: "Open customer portal",
      subscriptionPro: "Pro Subscription",
      boostCredits: "Boost Credits",
      manageCards: "Manage my cards",
      transactions: "transactions",
      transaction: "transaction",
      noTransactionsTitle: "No transactions",
      noTransactionsDesc: "Your boost and subscription purchases will appear here",
      buyBoosts: "Buy boosts",
      viewReceipt: "View receipt",
      receipt: "Receipt",
      receiptNotAvailable: "Receipt not available for this transaction",
      receiptError: "Error retrieving receipt",
      boostPurchased: "Boost purchased",
      subscriptionPurchased: "Subscription purchased",
      summary: "Summary",
      paymentStats: "Your payment statistics",
      boostsPurchased: "Boosts purchased",
      subscriptions: "Subscriptions",
      totalSpent: "Total spent",
      transactionId: "Transaction ID",
      userNotAuthenticated: "User not authenticated",
      errorLoadingBoosts: "Error loading boost transactions",
      card: "Card",
      currency: "Currency",
      generatedOn: "Generated on",
      transactionDetails: "Transaction Details",
      date: "Date",
      status: "Status",
      amount: "Amount"
    },

    // Form validation
    validation: {
      required: "This field is required",
      invalidEmail: "Invalid email address",
      invalidPhone: "Invalid phone number",
      invalidUrl: "Invalid URL",
      invalidPostalCode: "Invalid postal code (format: H2X 1Y4)",
      nameTooLong: "Name is too long",
      descriptionTooLong: "Description is too long",
      commerceNameRequired: "Business name required",
      postalCodeRequired: "Postal code required",
      addressRequired: "Full address required",
      categoryRequired: "Category required",
      firstNameRequired: "First name is required",
      lastNameRequired: "Last name is required",
      emailRequired: "Email is required",
      passwordRequired: "Password is required",
      passwordMinLength: "Password must contain at least 6 characters",
      termsRequired: "You must accept the terms of use"
    },

    // Placeholders and defaults
    placeholders: {
      notSelected: "Not selected",
      notDefined: "Not defined",
      expired: "Expired",
      restaurant: "Restaurant",
      commerce: "Business",
      commerceLocation: "Business location",
      selectType: "Select a type",
      enterPromoCode: "Enter your promo code",
      applying: "Applying...",
      validating: "Validating...",
      apply: "Apply",
      endsIn: "Ends in",
      endsDays: "d",
      endsHours: "h"
    }
  }
} as const

// Restaurant sub-categories
export const RESTAURANT_SUBCATEGORIES = {
  fr: [
    { value: "africain", label: "Africain" },
    { value: "americain_diner", label: "Américain / Diner" },
    { value: "argentin", label: "Argentin" },
    { value: "asiatique_fusion", label: "Asiatique (fusion)" },
    { value: "bagels", label: "Bagels" },
    { value: "bbq_rotisserie", label: "BBQ / Rôtisserie" },
    { value: "bistro", label: "Bistro" },
    { value: "buffet", label: "Buffet" },
    { value: "burger", label: "Burger" },
    { value: "cafe_bistro", label: "Café / Bistro" },
    { value: "cantine_casse_croute", label: "Cantine / Casse-croûte" },
    { value: "chinois", label: "Chinois" },
    { value: "coreen", label: "Coréen" },
    { value: "creperie", label: "Crêperie" },
    { value: "cremerie_gelato", label: "Crèmerie / Gelato" },
    { value: "dejeuner_brunch", label: "Déjeuner / Brunch" },
    { value: "espagnol_tapas", label: "Espagnol / Tapas" },
    { value: "fast_food", label: "Fast-food / Restauration rapide" },
    { value: "fine_cuisine", label: "Fine cuisine / Gastronomique" },
    { value: "food_truck", label: "Food truck" },
    { value: "francais", label: "Français" },
    { value: "fruits_mer", label: "Fruits de mer / Poissonnerie-restaurant" },
    { value: "grec", label: "Grec" },
    { value: "haitien_caraibes", label: "Haïtien / Caraïbes" },
    { value: "halal", label: "Halal" },
    { value: "indien", label: "Indien" },
    { value: "italien", label: "Italien" },
    { value: "jamaicain", label: "Jamaïcain" },
    { value: "japonais_sushi", label: "Japonais / Sushi" },
    { value: "kebab_doner", label: "Kebab / Döner" },
    { value: "libanais", label: "Libanais" },
    { value: "marocain", label: "Marocain" },
    { value: "mediterraneen", label: "Méditerranéen" },
    { value: "mexicain", label: "Mexicain" },
    { value: "patisserie_boulangerie", label: "Pâtisserie / Boulangerie" },
    { value: "peruvien", label: "Péruvien" },
    { value: "pizzeria", label: "Pizzeria" },
    { value: "poke_comptoir_sante", label: "Poké / Comptoir santé" },
    { value: "poutinerie", label: "Poutinerie" },
    { value: "portugais", label: "Portugais" },
    { value: "ramen_nouilles", label: "Ramen / Nouilles" },
    { value: "sandwicherie", label: "Sandwicherie" },
    { value: "shawarma", label: "Shawarma" },
    { value: "steakhouse_grillades", label: "Steakhouse / Grillades" },
    { value: "tex_mex", label: "Tex-Mex" },
    { value: "thai", label: "Thaï" },
    { value: "traiteur", label: "Traiteur" },
    { value: "vegane", label: "Végane" },
    { value: "vegetarien", label: "Végétarien" },
    { value: "vietnamien", label: "Vietnamien" },
    { value: "autres", label: "Autres" }
  ],
  en: [
    { value: "africain", label: "African" },
    { value: "americain_diner", label: "American / Diner" },
    { value: "argentin", label: "Argentinian" },
    { value: "asiatique_fusion", label: "Asian (fusion)" },
    { value: "bagels", label: "Bagels" },
    { value: "bbq_rotisserie", label: "BBQ / Rotisserie" },
    { value: "bistro", label: "Bistro" },
    { value: "buffet", label: "Buffet" },
    { value: "burger", label: "Burger" },
    { value: "cafe_bistro", label: "Café / Bistro" },
    { value: "cantine_casse_croute", label: "Canteen / Snack Bar" },
    { value: "chinois", label: "Chinese" },
    { value: "coreen", label: "Korean" },
    { value: "creperie", label: "Crêperie" },
    { value: "cremerie_gelato", label: "Ice Cream / Gelato" },
    { value: "dejeuner_brunch", label: "Breakfast / Brunch" },
    { value: "espagnol_tapas", label: "Spanish / Tapas" },
    { value: "fast_food", label: "Fast-food / Quick Service" },
    { value: "fine_cuisine", label: "Fine Dining / Gourmet" },
    { value: "food_truck", label: "Food Truck" },
    { value: "francais", label: "French" },
    { value: "fruits_mer", label: "Seafood / Fish Restaurant" },
    { value: "grec", label: "Greek" },
    { value: "haitien_caraibes", label: "Haitian / Caribbean" },
    { value: "halal", label: "Halal" },
    { value: "indien", label: "Indian" },
    { value: "italien", label: "Italian" },
    { value: "jamaicain", label: "Jamaican" },
    { value: "japonais_sushi", label: "Japanese / Sushi" },
    { value: "kebab_doner", label: "Kebab / Döner" },
    { value: "libanais", label: "Lebanese" },
    { value: "marocain", label: "Moroccan" },
    { value: "mediterraneen", label: "Mediterranean" },
    { value: "mexicain", label: "Mexican" },
    { value: "patisserie_boulangerie", label: "Pastry / Bakery" },
    { value: "peruvien", label: "Peruvian" },
    { value: "pizzeria", label: "Pizzeria" },
    { value: "poke_comptoir_sante", label: "Poké / Health Counter" },
    { value: "poutinerie", label: "Poutinerie" },
    { value: "portugais", label: "Portuguese" },
    { value: "ramen_nouilles", label: "Ramen / Noodles" },
    { value: "sandwicherie", label: "Sandwich Shop" },
    { value: "shawarma", label: "Shawarma" },
    { value: "steakhouse_grillades", label: "Steakhouse / Grill" },
    { value: "tex_mex", label: "Tex-Mex" },
    { value: "thai", label: "Thai" },
    { value: "traiteur", label: "Catering" },
    { value: "vegane", label: "Vegan" },
    { value: "vegetarien", label: "Vegetarian" },
    { value: "vietnamien", label: "Vietnamese" },
    { value: "autres", label: "Other" }
  ]
} as const

// Helper function to get restaurant sub-categories with labels
export function getRestaurantSubcategories(locale: 'fr' | 'en') {
  return RESTAURANT_SUBCATEGORIES[locale] || RESTAURANT_SUBCATEGORIES.fr
}

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
