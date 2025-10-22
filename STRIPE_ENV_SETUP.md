# Configuration des variables d'environnement Stripe

## Variables requises pour le paiement annuel

Pour activer les paiements mensuels ET annuels, vous devez configurer les variables d'environnement suivantes dans votre fichier `.env.local` :

### Stripe Keys
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx  # ou pk_test_xxxxx pour le mode test
STRIPE_SECRET_KEY=sk_live_xxxxx  # ou sk_test_xxxxx pour le mode test
```

### Stripe Price IDs (Abonnements)
```env
# Prix mensuel (8$/mois)
STRIPE_SUBSCRIPTION_PRICE_ID=price_xxxxx_monthly

# Prix annuel (88$/an)
STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID=price_xxxxx_annual
```

### Stripe Price IDs (Boosts)
```env
STRIPE_BOOST_EN_VEDETTE_PRICE_ID=price_xxxxx_boost_vedette
STRIPE_BOOST_VISIBILITE_PRICE_ID=price_xxxxx_boost_visibilite
```

### Stripe Webhook
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## Comment obtenir les Price IDs de Stripe ?

### 1. Connectez-vous à votre Dashboard Stripe
https://dashboard.stripe.com/

### 2. Créer le produit "Abonnement Gosholo Plus"
1. Allez dans **Produits** → **Ajouter un produit**
2. Nom : `Gosholo Plus`
3. Description : `Abonnement mensuel ou annuel`

### 3. Créer les deux prix
**Prix Mensuel :**
- Montant : `8.00 CAD` (ou USD)
- Intervalle : `Mensuel (tous les mois)`
- Copiez le **Price ID** (commence par `price_`)
- Utilisez-le pour `STRIPE_SUBSCRIPTION_PRICE_ID`

**Prix Annuel :**
- Montant : `88.00 CAD` (ou USD)
- Intervalle : `Annuel (tous les ans)`
- Copiez le **Price ID** (commence par `price_`)
- Utilisez-le pour `STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID`

### 4. Créer les produits Boost (si pas déjà fait)
**Boost En Vedette :**
- Nom : `Boost En Vedette`
- Prix : selon votre tarification
- Type : `Paiement unique`
- Copiez le Price ID pour `STRIPE_BOOST_EN_VEDETTE_PRICE_ID`

**Boost Visibilité :**
- Nom : `Boost Visibilité`
- Prix : selon votre tarification
- Type : `Paiement unique`
- Copiez le Price ID pour `STRIPE_BOOST_VISIBILITE_PRICE_ID`

### 5. Configurer les Webhooks
1. Allez dans **Développeurs** → **Webhooks**
2. Créez un endpoint : `https://votre-domaine.com/api/stripe/webhooks`
3. Sélectionnez ces événements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copiez le **Webhook Secret** pour `STRIPE_WEBHOOK_SECRET`

## Vérification de la configuration

Une fois les variables configurées, redémarrez votre serveur Next.js :
```bash
npm run dev
# ou
pnpm dev
```

## Test de l'intégration

1. Allez sur `/dashboard/boosts`
2. Vous devriez voir le toggle **Mensuel / Annuel** dans la carte Gosholo PLUS
3. Cliquez sur **Annuel** → le prix devrait changer à `88$/an`
4. Cliquez sur "Passer au PLUS" → vous serez redirigé vers Stripe Checkout avec le bon prix

## Notes importantes

- 💰 L'abonnement annuel offre **2 mois gratuits** (88$ au lieu de 96$)
- 🔄 Le toggle n'apparaît que pour les utilisateurs **non abonnés**
- ✅ Les utilisateurs déjà abonnés voient leur plan actuel
- 🌍 L'interface est multilingue (FR/EN)

