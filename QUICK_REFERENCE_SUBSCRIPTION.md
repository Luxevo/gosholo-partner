# ⚡ Référence Rapide - Système d'Abonnement

## 🎯 Structure des Plans

```
┌─────────────────────────────────────────────────────────┐
│                    PLAN GRATUIT                         │
│                       Gratuit                           │
├─────────────────────────────────────────────────────────┤
│ • 1 publication total (offre OU événement)              │
│ • 0 crédit boost par mois                               │
│ • Profil commerce de base                               │
│ • Support communautaire                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  PLAN PLUS MENSUEL                      │
│                    $8 / mois                            │
├─────────────────────────────────────────────────────────┤
│ • 10 publications totaux (offres ET événements)         │
│ • 1 crédit boost par mois (auto-renouvelé)              │
│ • Profil commerce complet                               │
│ • Support prioritaire                                   │
│ • Statistiques avancées                                 │
│ • Fonctionnalités premium                               │
│                                                         │
│ Coût annuel : $96                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  PLAN PLUS ANNUEL                       │
│              $88 / an  💰 ÉCONOMISEZ $8                 │
├─────────────────────────────────────────────────────────┤
│ • 10 publications totaux (offres ET événements)         │
│ • 1 crédit boost par mois (auto-renouvelé)              │
│ • Profil commerce complet                               │
│ • Support prioritaire                                   │
│ • Statistiques avancées                                 │
│ • Fonctionnalités premium                               │
│                                                         │
│ Équivaut à : $7.33/mois                                 │
│ Économie : 17% par rapport au mensuel                   │
│ = 2 mois gratuits !                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Variables d'Environnement Stripe

### Tableau de Correspondance

| Variable | Environnement | Valeur Exemple | Description |
|----------|---------------|----------------|-------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Test | `pk_test_...` | Clé publique test |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Live | `pk_live_...` | Clé publique production |
| `STRIPE_SECRET_KEY` | Test | `sk_test_...` | Clé secrète test |
| `STRIPE_SECRET_KEY` | Live | `sk_live_...` | Clé secrète production |
| `STRIPE_SUBSCRIPTION_PRICE_ID` | Test | `price_1ABC...` | Prix mensuel test |
| `STRIPE_SUBSCRIPTION_PRICE_ID` | Live | `price_live_1ABC...` | Prix mensuel production |
| `STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID` | Test | `price_1DEF...` | Prix annuel test |
| `STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID` | Live | `price_live_1DEF...` | Prix annuel production |
| `STRIPE_BOOST_EN_VEDETTE_PRICE_ID` | Test/Live | `price_...` | Boost en vedette |
| `STRIPE_BOOST_VISIBILITE_PRICE_ID` | Test/Live | `price_...` | Boost visibilité |
| `STRIPE_WEBHOOK_SECRET` | Test | `whsec_...` | Secret webhook test |
| `STRIPE_WEBHOOK_SECRET` | Live | `whsec_...` | Secret webhook production |

---

## 📂 Structure des Fichiers Modifiés

```
gosholo-partner/
│
├── lib/
│   └── stripe.ts                    ✅ MODIFIÉ
│       ├── STRIPE_PRICES
│       │   ├── subscriptionMonthly  (nouveau nom)
│       │   ├── subscriptionAnnual   🆕 NOUVEAU
│       │   ├── boostEnVedette
│       │   └── boostVisibilite
│       └── SUBSCRIPTION_PLANS       🆕 NOUVEAU
│           ├── monthly (8$/mois)
│           └── annual (88$/an)
│
├── app/api/stripe/
│   ├── create-subscription/
│   │   └── route.ts                 ✅ MODIFIÉ
│   │       ├── Accepte "interval" dans body
│   │       ├── Sélectionne le bon Price ID
│   │       └── Sauvegarde interval en metadata
│   │
│   └── webhooks/
│       └── route.ts                 ⚪ INCHANGÉ
│           └── Traite checkout.session.completed
│
├── components/
│   └── subscription-management-flow.tsx  ✅ MODIFIÉ
│       ├── Toggle Mensuel/Annuel    🆕 NOUVEAU
│       ├── Prix dynamiques
│       ├── Badge -17%               🆕 NOUVEAU
│       └── Message économies        🆕 NOUVEAU
│
├── ANNUAL_SUBSCRIPTION_SETUP.md     🆕 NOUVEAU
├── QUICK_REFERENCE_SUBSCRIPTION.md  🆕 NOUVEAU (ce fichier)
└── STRIPE_PRODUCTION_MIGRATION.md   ✅ MIS À JOUR
```

---

## 🔄 Flux de Paiement Annuel

```
1. Utilisateur clique "Passer au Plus"
   │
   ├─ Sélectionne "Annuel" dans le toggle
   │  └─ Prix affiché : $88/an
   │     Badge : -17%
   │     Message : "Économisez $8 (2 mois gratuits)"
   │
2. Click sur le bouton
   │
   ├─ Frontend → POST /api/stripe/create-subscription
   │  Body: { interval: "annual" }
   │
3. API Backend
   │
   ├─ Vérifie interval = "annual"
   ├─ Sélectionne STRIPE_PRICES.subscriptionAnnual
   ├─ Crée session Stripe Checkout
   │  └─ metadata: { interval: "annual", userId, type: "subscription" }
   │
4. Redirect vers Stripe Checkout
   │
   ├─ Affiche "Abonnement Pro Annuel - $88.00/year"
   ├─ Utilisateur entre carte bancaire
   │
5. Paiement accepté
   │
   ├─ Stripe envoie webhook: checkout.session.completed
   │
6. Webhook Handler
   │
   ├─ Met à jour profiles.is_subscribed = true
   ├─ Ajoute 1 crédit boost en vedette
   ├─ Ajoute 1 crédit boost visibilité
   ├─ Crée record dans subscriptions
   │  └─ plan_type: "pro", status: "active"
   │
7. Redirection vers l'app
   │
   └─ Utilisateur voit son statut "Abonné Pro"
      └─ Prochaine facturation : dans 1 an
```

---

## 🧪 Tests Cartes Stripe

### Carte de Test Standard
```
Numéro : 4242 4242 4242 4242
Date   : 12/34 (ou toute date future)
CVC    : 123
ZIP    : 12345
```

### Autres Cartes Utiles
```
Visa (débit)           : 4000 0566 5566 5556
Mastercard            : 5555 5555 5555 4444
Amex                  : 3782 822463 10005
Carte déclinée        : 4000 0000 0000 0002
Authentification 3D   : 4000 0025 0000 3155
```

---

## 📊 Comparaison des Plans

| Critère | Gratuit | Mensuel | Annuel |
|---------|---------|---------|--------|
| **Prix** | Gratuit | $8/mois | $88/an |
| **Prix équivalent mensuel** | - | $8.00 | $7.33 |
| **Économie vs Mensuel** | - | - | -$8/an (-17%) |
| **Publications** | 1 | 10 | 10 |
| **Boosts/mois** | 0 | 1 | 1 |
| **Support** | Communautaire | Prioritaire | Prioritaire |
| **Facturation** | - | Tous les mois | Tous les ans |

---

## 🚀 Checklist de Déploiement Rapide

### Mode Test
```bash
1. ✅ Créer produit annuel dans Stripe (Test)
2. ✅ Copier Price ID test
3. ✅ Ajouter STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID sur Vercel
4. ✅ Deployer le code
5. ✅ Tester le toggle mensuel/annuel
6. ✅ Tester paiement avec carte test (4242...)
7. ✅ Vérifier webhook réussi
8. ✅ Vérifier crédits boost ajoutés
```

### Mode Production
```bash
1. ✅ Créer produit annuel dans Stripe (Live)
2. ✅ Copier Price ID live
3. ✅ Mettre à jour STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID (live)
4. ✅ Redéployer
5. ✅ Tester avec vraie carte (petits montants)
6. ✅ Monitorer webhooks en production
```

---

## 🔍 Débogage Rapide

### Problème : Toggle ne s'affiche pas
```bash
# Solution 1 : Vider cache
Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)

# Solution 2 : Vérifier le build
# Dans Vercel Dashboard → Deployments
# S'assurer que le dernier build est ✅
```

### Problème : Erreur "STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID is not set"
```bash
# Solution : Ajouter la variable d'environnement
1. Vercel Dashboard → Settings → Environment Variables
2. Ajouter : STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID
3. Valeur : price_... (le Price ID de Stripe)
4. Redéployer
```

### Problème : Paiement ne fonctionne pas
```bash
# Vérifications :
1. Stripe Dashboard → Developers → API keys
   → Vérifier que les clés correspondent (test avec test, live avec live)

2. Stripe Dashboard → Products
   → Vérifier que le produit annuel existe
   → Copier le bon Price ID

3. Vercel → Environment Variables
   → Vérifier STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID
   → Doit correspondre au Price ID du produit

4. Stripe Dashboard → Webhooks
   → Vérifier que le webhook est actif
   → URL : https://votre-site.vercel.app/api/stripe/webhooks
   → Événements : checkout.session.completed, payment_intent.succeeded
```

---

## 📞 Liens Utiles

| Ressource | URL |
|-----------|-----|
| **Stripe Dashboard Test** | https://dashboard.stripe.com/test |
| **Stripe Dashboard Live** | https://dashboard.stripe.com |
| **Stripe Products** | https://dashboard.stripe.com/products |
| **Stripe Webhooks** | https://dashboard.stripe.com/webhooks |
| **Stripe Test Cards** | https://stripe.com/docs/testing |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Stripe Documentation** | https://stripe.com/docs |
| **Stripe Support** | https://support.stripe.com |

---

## 💡 Points Clés à Retenir

1. **Deux Plans Pro** : Mensuel ($8/mois) et Annuel ($88/an)
2. **Économie de 17%** : Le plan annuel économise 2 mois ($8)
3. **Même fonctionnalités** : Les deux plans Pro ont les mêmes avantages
4. **Toggle UI** : Interface simple pour choisir mensuel ou annuel
5. **Variables distinctes** : `STRIPE_SUBSCRIPTION_PRICE_ID` (mensuel) et `STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID` (annuel)
6. **Metadata Stripe** : L'intervalle est sauvegardé dans `metadata.interval`
7. **Test d'abord** : Toujours tester en mode Test avant la production
8. **Même webhook** : Un seul webhook gère les deux types d'abonnement

---

**Dernière mise à jour** : Octobre 2024  
**Version** : 1.0

