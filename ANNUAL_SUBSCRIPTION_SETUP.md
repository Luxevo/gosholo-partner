# 🎯 Guide d'Ajout de l'Abonnement Annuel à 88$/an

## 📋 Résumé des Modifications

Ce guide explique comment ajouter un plan d'abonnement annuel à 88$/an en plus du plan mensuel actuel de 8$/mois.

---

## ✅ Modifications de Code Effectuées

### 1. **Fichier `lib/stripe.ts`**
✅ Ajout de la configuration pour l'abonnement annuel :

```typescript
export const STRIPE_PRICES = {
  subscriptionMonthly: process.env.STRIPE_SUBSCRIPTION_PRICE_ID!,
  subscriptionAnnual: process.env.STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID!,  // NOUVEAU
  boostEnVedette: process.env.STRIPE_BOOST_EN_VEDETTE_PRICE_ID!,
  boostVisibilite: process.env.STRIPE_BOOST_VISIBILITE_PRICE_ID!,
}

// Nouvelle configuration des plans
export const SUBSCRIPTION_PLANS = {
  monthly: {
    priceId: STRIPE_PRICES.subscriptionMonthly,
    price: 8,
    interval: 'month',
    displayPrice: '$8/mois',
  },
  annual: {
    priceId: STRIPE_PRICES.subscriptionAnnual,
    price: 88,
    interval: 'year',
    displayPrice: '$88/an',
    savings: 'Économisez $8 (2 mois gratuits)',
  },
}
```

### 2. **Fichier `app/api/stripe/create-subscription/route.ts`**
✅ Modification de l'API pour accepter le choix mensuel/annuel :

```typescript
// Parse le body pour obtenir l'intervalle
const body = await request.json()
const interval = body.interval || 'monthly'  // 'monthly' ou 'annual'

// Détermine le bon price ID
const priceId = interval === 'annual' 
  ? STRIPE_PRICES.subscriptionAnnual 
  : STRIPE_PRICES.subscriptionMonthly

// Crée la session Stripe avec le bon prix
const session = await stripe.checkout.sessions.create({
  // ...
  line_items: [{ price: priceId, quantity: 1 }],
  metadata: {
    userId: user.id,
    type: 'subscription',
    interval: interval,  // Sauvegarde l'intervalle dans les métadonnées
  },
})
```

### 3. **Fichier `components/subscription-management-flow.tsx`**
✅ Ajout de l'interface utilisateur pour choisir entre mensuel et annuel :

- Toggle mensuel/annuel avec badge de réduction (-17%)
- Affichage dynamique du prix selon l'intervalle sélectionné
- Message d'économies pour le plan annuel
- Redirection vers Stripe Checkout avec l'intervalle sélectionné

---

## 🚀 Étapes de Déploiement

### **Étape 1 : Créer le Produit Annuel dans Stripe**

#### Mode Test (pour tester d'abord)
1. Aller sur [Stripe Dashboard](https://dashboard.stripe.com)
2. S'assurer d'être en mode **"Test data"** (toggle en haut à gauche)
3. Aller à **Products** → **Add product**
4. Remplir :
   - **Name** : `Abonnement Pro Annuel Gosholo`
   - **Description** : `1 boost En Vedette + 1 boost Visibilité par mois + fonctionnalités Pro (facturation annuelle)`
   - **Pricing model** : `Recurring`
   - **Price** : `$88.00` USD
   - **Billing period** : `Yearly`
5. Cliquer **Save product**
6. **📝 COPIER LE PRICE ID** (commence par `price_...`)
   - Exemple : `price_1A2B3C4D5E6F7G8H9I0J1K2L`

#### Mode Live (production)
Répéter les mêmes étapes en mode **"Live data"**
- Le price ID commencera par `price_live_...`

---

### **Étape 2 : Ajouter la Variable d'Environnement**

#### Sur Vercel (Recommandé)
1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet **gosholo-partner**
3. Aller à **Settings** → **Environment Variables**
4. Cliquer **Add New**
5. Ajouter :
   - **Key** : `STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID`
   - **Value** : `price_...` (le Price ID copié à l'étape 1)
   - **Environments** : Cocher `Production`, `Preview`, `Development`
6. Cliquer **Save**

#### En Local (fichier `.env.local`)
Créer ou éditer `.env.local` à la racine du projet :

```bash
# Abonnement annuel
STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID=price_1A2B3C4D5E6F7G8H9I0J1K2L

# Autres variables existantes (ne pas modifier)
STRIPE_SUBSCRIPTION_PRICE_ID=price_existing_monthly
STRIPE_BOOST_EN_VEDETTE_PRICE_ID=price_existing_boost1
STRIPE_BOOST_VISIBILITE_PRICE_ID=price_existing_boost2
STRIPE_WEBHOOK_SECRET=whsec_existing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_existing
STRIPE_SECRET_KEY=sk_test_existing
```

⚠️ **Important** : Ne JAMAIS commiter le fichier `.env.local` dans git !

---

### **Étape 3 : Déployer sur Vercel**

#### Option A : Déploiement Automatique (via Git)
1. Commit et push les modifications de code :
```bash
git add .
git commit -m "feat: Add annual subscription plan at $88/year"
git push origin main
```
2. Vercel détectera automatiquement le push et déploiera
3. Attendre que le build soit ✅ (environ 1-2 minutes)

#### Option B : Déploiement Manuel
1. Dans Vercel Dashboard → **Deployments**
2. Cliquer sur **Redeploy** sur le dernier déploiement
3. Attendre la fin du build

---

### **Étape 4 : Test en Mode Test**

⚠️ **Utilisez d'abord le mode test de Stripe !**

#### Test du Plan Annuel
1. Aller sur `https://votre-site.vercel.app/dashboard` (ou localhost)
2. Aller à la section "Gérer l'abonnement"
3. Sur le plan Pro, vous devriez voir :
   - Toggle "Mensuel" / "Annuel"
   - Badge "-17%" sur le bouton Annuel
   - Prix qui change : $8/mois → $88/an
   - Message "Économisez $8 (2 mois gratuits)"
4. Sélectionner **Annuel**
5. Cliquer **Passer au Plus**
6. Vous serez redirigé vers Stripe Checkout
7. Utiliser une carte de test : `4242 4242 4242 4242`, `12/34`, `123`
8. Compléter le paiement

#### Vérifications Post-Test
1. **Stripe Dashboard** → **Payments**
   - Vérifier qu'un paiement de $88.00 apparaît
   - Vérifier que c'est un abonnement annuel
2. **Stripe Dashboard** → **Subscriptions**
   - Vérifier que l'abonnement est actif
   - Vérifier que l'intervalle est "Yearly"
3. **Base de données Supabase** → Table `subscriptions`
   - Vérifier que `plan_type = 'pro'` et `status = 'active'`
4. **Base de données Supabase** → Table `profiles`
   - Vérifier que `is_subscribed = true`
5. **Application web**
   - Vérifier que les crédits boost apparaissent
   - Vérifier que le statut d'abonnement s'affiche correctement

---

### **Étape 5 : Migration en Production**

Une fois les tests validés, répéter avec les Price IDs de production :

1. Créer le produit annuel en mode **Live** sur Stripe
2. Copier le Price ID Live (`price_live_...`)
3. Mettre à jour `STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID` sur Vercel avec le Live Price ID
4. Redéployer
5. Tester avec une VRAIE carte (montants réels seront facturés !)

---

## 📊 Tableau Récapitulatif des Plans

| Plan | Prix | Intervalle | Price ID Variable | Économies |
|------|------|-----------|-------------------|-----------|
| **Plan Gratuit** | Gratuit | - | - | - |
| **Plan Plus Mensuel** | $8 | Mensuel | `STRIPE_SUBSCRIPTION_PRICE_ID` | - |
| **Plan Plus Annuel** | $88 | Annuel | `STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID` | $8 (17%) |

### Calcul des Économies
- Mensuel : $8/mois × 12 mois = **$96/an**
- Annuel : **$88/an**
- **Économie : $8/an (équivalent à 2 mois gratuits)**

---

## 🔧 Architecture Technique

### Flux de Paiement

```
┌─────────────────┐
│ Utilisateur     │
│ sélectionne     │
│ plan annuel     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ Frontend (subscription-management-flow.tsx) │
│ - Toggle mensuel/annuel                     │
│ - Affichage dynamique des prix              │
└────────┬────────────────────────────────────┘
         │
         │ POST /api/stripe/create-subscription
         │ { interval: "annual" }
         ▼
┌─────────────────────────────────────────────┐
│ API Route (create-subscription/route.ts)    │
│ - Lit interval du body                      │
│ - Sélectionne le bon Price ID               │
│ - Crée session Stripe Checkout              │
└────────┬────────────────────────────────────┘
         │
         │ Redirect
         ▼
┌─────────────────────────────────────────────┐
│ Stripe Checkout                             │
│ - Collecte paiement                         │
│ - Crée abonnement annuel                    │
└────────┬────────────────────────────────────┘
         │
         │ Webhook: checkout.session.completed
         ▼
┌─────────────────────────────────────────────┐
│ Webhook Handler (webhooks/route.ts)        │
│ - Met à jour profiles.is_subscribed         │
│ - Ajoute crédits boost                      │
│ - Crée record dans subscriptions            │
└─────────────────────────────────────────────┘
```

---

## 🔍 Dépannage

### ❌ Erreur : "STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID is not set"
**Solution** : La variable d'environnement n'est pas configurée
1. Vérifier dans Vercel Settings → Environment Variables
2. S'assurer que la variable existe et contient le bon Price ID
3. Redéployer après l'ajout

### ❌ Toggle annuel ne s'affiche pas
**Solution** : Vider le cache du navigateur ou forcer le reload
1. Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
2. Ou ouvrir en navigation privée

### ❌ Paiement échoue
**Solution** : Vérifier les Price IDs
1. Aller sur Stripe Dashboard → Products
2. Copier le Price ID exact
3. Vérifier qu'il correspond à la variable d'environnement
4. En test, utiliser `price_...`
5. En live, utiliser `price_live_...`

### ❌ Abonnement créé mais pas de crédits boost
**Solution** : Vérifier le webhook
1. Stripe Dashboard → Developers → Webhooks
2. Vérifier les événements récents
3. Chercher des erreurs dans les logs
4. S'assurer que `checkout.session.completed` est bien écouté

---

## 📝 Checklist de Déploiement

### Phase 1 : Préparation
- [ ] Lire ce guide en entier
- [ ] Accès au Stripe Dashboard (test & live)
- [ ] Accès au Vercel Dashboard

### Phase 2 : Configuration Stripe Test
- [ ] Créer produit annuel en mode Test
- [ ] Copier le Price ID test
- [ ] Sauvegarder le Price ID quelque part

### Phase 3 : Configuration Vercel
- [ ] Ajouter `STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID` (test)
- [ ] Appliquer à tous les environnements
- [ ] Vérifier que la variable est bien sauvegardée

### Phase 4 : Déploiement Test
- [ ] Push du code sur git (si pas déjà fait)
- [ ] Attendre déploiement Vercel
- [ ] Vérifier build réussi ✅

### Phase 5 : Tests
- [ ] Interface annuel visible
- [ ] Toggle fonctionne
- [ ] Prix s'affiche correctement
- [ ] Checkout Stripe fonctionne
- [ ] Paiement test réussit
- [ ] Webhook traite l'événement
- [ ] Crédits boost ajoutés
- [ ] Abonnement actif dans DB

### Phase 6 : Production (après validation tests)
- [ ] Créer produit annuel en mode Live
- [ ] Copier Price ID live
- [ ] Mettre à jour variable Vercel avec Price ID live
- [ ] Redéployer
- [ ] Tester avec vraie carte (petits montants)

---

## 🎉 Conclusion

Après avoir suivi ce guide :
- ✅ Les utilisateurs peuvent choisir entre mensuel ($8/mois) et annuel ($88/an)
- ✅ Un badge "-17%" encourage l'abonnement annuel
- ✅ L'économie de $8/an est clairement affichée
- ✅ Le système Stripe gère automatiquement la facturation récurrente
- ✅ Les webhooks mettent à jour la base de données

---

## 📞 Support

- **Stripe** : https://support.stripe.com
- **Vercel** : https://vercel.com/help
- **Documentation Stripe Checkout** : https://stripe.com/docs/payments/checkout

---

**Date de création** : Octobre 2024
**Version** : 1.0
**Auteur** : Assistant IA Claude

