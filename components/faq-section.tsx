"use client"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useLanguage } from "@/contexts/language-context"

export function FaqSection() {
  const { locale } = useLanguage()

  const faqSections = [
    {
      title: locale === 'fr' ? "Créer et gérer mes offres et événements" : "Create and manage my offers and events",
      items: [
        // Offres
        {
          question: locale === 'fr' ? "Comment créer une offre étape par étape ?" : "How to create an offer step by step?",
          answer: locale === 'fr' 
            ? "Vous pouvez créer une offre depuis votre tableau de bord après avoir ajouté votre commerce, ou dans le menu de gauche sous « Offres ». Remplissez les informations et publiez."
            : "You can create an offer from your dashboard after adding your business, or in the left menu under 'Offers'. Fill in the information and publish."
        },
        {
          question: locale === 'fr' ? "Est-ce que je peux ajouter une image ou une vidéo à mon offre ?" : "Can I add an image or video to my offer?",
          answer: locale === 'fr' 
            ? "Oui, vous pouvez ajouter une image. Les vidéos ne sont pas encore disponibles."
            : "Yes, you can add an image. Videos are not yet available."
        },
        {
          question: locale === 'fr' ? "Puis-je programmer une offre pour une date future ?" : "Can I schedule an offer for a future date?",
          answer: locale === 'fr' 
            ? "Oui, vous pouvez définir une date de début et de fin."
            : "Yes, you can set a start and end date."
        },
        {
          question: locale === 'fr' ? "Combien d'offres puis-je avoir actives en même temps ?" : "How many offers can I have active at the same time?",
          answer: locale === 'fr' 
            ? "Une offre est incluse gratuitement. Avec un abonnement, vous pouvez en avoir plusieurs actives selon votre forfait."
            : "One offer is included for free. With a subscription, you can have several active according to your plan."
        },
        {
          question: locale === 'fr' ? "Est-ce que je peux modifier une offre déjà publiée ?" : "Can I modify an already published offer?",
          answer: locale === 'fr' 
            ? "Oui, vous pouvez modifier une offre depuis le tableau de bord ou via le menu de gauche, dans la section « Offres ». Les utilisateurs ayant mis l'offre en favoris recevront une notification en cas de changement."
            : "Yes, you can modify an offer from the dashboard or via the left menu, in the 'Offers' section. Users who have favorited the offer will receive a notification in case of changes."
        },
        {
          question: locale === 'fr' ? "Comment supprimer une offre ?" : "How to delete an offer?",
          answer: locale === 'fr' 
            ? "Vous pouvez supprimer une offre depuis votre tableau de bord ou la section « Offres ». Les utilisateurs qui avaient mis l'offre en favoris recevront une notification lorsqu'elle est retirée."
            : "You can delete an offer from your dashboard or the 'Offers' section. Users who had favorited the offer will receive a notification when it is removed."
        },
        {
          question: locale === 'fr' ? "Y a-t-il une durée limite pour mes offres ?" : "Is there a time limit for my offers?",
          answer: locale === 'fr' 
            ? "Vous choisissez vos dates, mais une offre ne peut pas dépasser 30 jours. Vous pourrez la renouveler après."
            : "You choose your dates, but an offer cannot exceed 30 days. You can renew it afterwards."
        },
        {
          question: locale === 'fr' ? "Comment savoir si une offre performe bien (clics, vues, favoris, etc.) ?" : "How to know if an offer is performing well (clicks, views, favorites, etc.)?",
          answer: locale === 'fr' 
            ? "Les statistiques sont visibles dans la section Offres et sur votre tableau de bord (vues, clics, favoris, abonnés)."
            : "Statistics are visible in the Offers section and on your dashboard (views, clicks, favorites, subscribers)."
        },
        // Événements
        {
          question: locale === 'fr' ? "Comment créer un événement étape par étape ?" : "How to create an event step by step?",
          answer: locale === 'fr' 
            ? "Vous pouvez créer un événement depuis votre tableau de bord après avoir ajouté votre commerce, ou dans le menu de gauche sous « Événements ». Remplissez les informations et publiez."
            : "You can create an event from your dashboard after adding your business, or in the left menu under 'Events'. Fill in the information and publish."
        },
        {
          question: locale === 'fr' ? "Est-ce que je peux ajouter une image ou une vidéo à mon événement ?" : "Can I add an image or video to my event?",
          answer: locale === 'fr' 
            ? "Oui, vous pouvez ajouter une image. Les vidéos ne sont pas encore disponibles."
            : "Yes, you can add an image. Videos are not yet available."
        },
        {
          question: locale === 'fr' ? "Puis-je programmer un événement pour une date future ?" : "Can I schedule an event for a future date?",
          answer: locale === 'fr' 
            ? "Oui, vous pouvez définir une date de début et de fin."
            : "Yes, you can set a start and end date."
        },
        {
          question: locale === 'fr' ? "Combien d'événements puis-je avoir actifs en même temps ?" : "How many events can I have active at the same time?",
          answer: locale === 'fr' 
            ? "Un événement est inclus gratuitement. Avec un abonnement, vous pouvez en avoir plusieurs actifs selon votre forfait."
            : "One event is included for free. With a subscription, you can have several active according to your plan."
        },
        {
          question: locale === 'fr' ? "Est-ce que je peux modifier un événement déjà publié ?" : "Can I modify an already published event?",
          answer: locale === 'fr' 
            ? "Oui, vous pouvez modifier un événement depuis le tableau de bord ou via le menu de gauche, dans la section « Événements ». Les utilisateurs ayant mis l'événement en favoris recevront une notification en cas de changement."
            : "Yes, you can modify an event from the dashboard or via the left menu, in the 'Events' section. Users who have favorited the event will receive a notification in case of changes."
        },
        {
          question: locale === 'fr' ? "Comment supprimer un événement ?" : "How to delete an event?",
          answer: locale === 'fr' 
            ? "Vous pouvez supprimer un événement depuis votre tableau de bord ou la section « Événements ». Les utilisateurs qui avaient mis l'événement en favoris recevront une notification lorsqu'il est retiré."
            : "You can delete an event from your dashboard or the 'Events' section. Users who had favorited the event will receive a notification when it is removed."
        },
        {
          question: locale === 'fr' ? "Y a-t-il une durée limite pour mes événements ?" : "Is there a time limit for my events?",
          answer: locale === 'fr' 
            ? "Vous choisissez vos dates, mais un événement ne peut pas dépasser 30 jours. Vous pourrez le renouveler après."
            : "You choose your dates, but an event cannot exceed 30 days. You can renew it afterwards."
        },
        {
          question: locale === 'fr' ? "Comment savoir si un événement performe bien (clics, vues, favoris, etc.) ?" : "How to know if an event is performing well (clicks, views, favorites, etc.)?",
          answer: locale === 'fr' 
            ? "Les statistiques sont visibles dans la section Événements et sur votre tableau de bord (vues, clics, favoris, abonnés)."
            : "Statistics are visible in the Events section and on your dashboard (views, clicks, favorites, subscribers)."
        }
      ]
    },
    {
      title: locale === 'fr' ? "Améliorer ma visibilité (Boost et abonnements)" : "Improve my visibility (Boost and subscriptions)",
      items: [
        {
          question: locale === 'fr' ? "Qu'est-ce qu'un boost et à quoi ça sert ?" : "What is a boost and what is it for?",
          answer: locale === 'fr' 
            ? "Un boost permet de donner plus de visibilité à vos offres, événements ou à votre commerce pour attirer davantage de clients."
            : "A boost allows you to give more visibility to your offers, events or your business to attract more customers."
        },
        {
          question: locale === 'fr' ? "Quelles sont les différentes options de boost disponibles ?" : "What are the different boost options available?",
          answer: locale === 'fr' 
            ? "Boost Vedette : votre offre ou événement obtient un badge « Vedette », apparaît en priorité dans la liste et en haut des recherches pendant 72h.\n\nBoost Visibilité : votre commerce est mis en avant sur la carte interactive avec un placement prioritaire pour attirer l'attention des membres autour de vous valide 30 jours."
            : "Featured Boost: your offer or event gets a 'Featured' badge, appears as a priority in the list and at the top of searches for 72h.\n\nVisibility Boost: your business is highlighted on the interactive map with priority placement to attract the attention of members around you valid for 30 days."
        },
        {
          question: locale === 'fr' ? "Est-ce que je peux activer un boost à tout moment ?" : "Can I activate a boost at any time?",
          answer: locale === 'fr' 
            ? "Oui, vous pouvez activer un boost quand vous le souhaitez depuis votre tableau de bord."
            : "Yes, you can activate a boost whenever you want from your dashboard."
        },
        {
          question: locale === 'fr' ? "Comment savoir si mon boost a bien été activé ?" : "How do I know if my boost has been activated?",
          answer: locale === 'fr' 
            ? "Dans votre tableau de bord, vos offres affichent un badge « Vedette » lorsqu'elles sont boostées, et votre commerce est marqué par l'icône spéciale de visibilité lorsqu'il est en avant sur la carte."
            : "In your dashboard, your offers display a 'Featured' badge when they are boosted, and your business is marked with the special visibility icon when it is highlighted on the map."
        },
        {
          question: locale === 'fr' ? "Est-ce que je peux acheter des boosts à l'unité sans abonnement ?" : "Can I buy boosts individually without a subscription?",
          answer: locale === 'fr' 
            ? "Oui, vous pouvez acheter des boosts Vedette ou Visibilité à la carte, même sans abonnement."
            : "Yes, you can buy Featured or Visibility boosts individually, even without a subscription."
        },
        {
          question: locale === 'fr' ? "Quelle est la différence entre les statuts gosholo Base et gosholo Plus ?" : "What is the difference between gosholo Base and gosholo Plus status?",
          answer: locale === 'fr' 
            ? "gosholo Base (gratuit) : 1 offre ou 1 événement actif à la fois, statistiques en temps réel, et votre commerce affiché sur la carte interactive.\n\ngosholo Plus : jusqu'à 5 offres ou événements actifs en même temps, accès aux statistiques, votre commerce affiché sur la carte, et 1 Boost Vedette + 1 Boost Visibilité inclus chaque mois (non cumulables)."
            : "gosholo Base (free): 1 offer or 1 event active at a time, real-time statistics, and your business displayed on the interactive map.\n\ngosholo Plus: up to 5 offers or events active at the same time, access to statistics, your business displayed on the map, and 1 Featured Boost + 1 Visibility Boost included each month (non-cumulative)."
        },
        {
          question: locale === 'fr' ? "Est-ce que je peux changer d'abonnement en cours de route ?" : "Can I change my subscription along the way?",
          answer: locale === 'fr' 
            ? "Oui, vous pouvez passer de Base à Plus ou revenir à Base à tout moment depuis la section Abonnement."
            : "Yes, you can switch from Base to Plus or return to Base at any time from the Subscription section."
        },
        {
          question: locale === 'fr' ? "Puis-je annuler mon abonnement quand je veux ?" : "Can I cancel my subscription whenever I want?",
          answer: locale === 'fr' 
            ? "Oui, vous pouvez annuler en tout temps. Votre accès restera actif jusqu'à la fin de la période déjà payée."
            : "Yes, you can cancel at any time. Your access will remain active until the end of the already paid period."
        }
      ]
    },
    {
      title: locale === 'fr' ? "Paiements et factures (Historique de paiement)" : "Payments and invoices (Payment history)",
      items: [
        {
          question: locale === 'fr' ? "Où puis-je consulter mes factures et paiements passés ?" : "Where can I view my past invoices and payments?",
          answer: locale === 'fr' 
            ? "Vous pouvez voir vos factures et paiements dans la section « Historique de paiement » de votre tableau de bord."
            : "You can see your invoices and payments in the 'Payment History' section of your dashboard."
        },
        {
          question: locale === 'fr' ? "Est-ce que je peux télécharger mes factures en PDF ?" : "Can I download my invoices in PDF?",
          answer: locale === 'fr' 
            ? "Oui, chaque facture peut être téléchargée en format PDF."
            : "Yes, each invoice can be downloaded in PDF format."
        },
        {
          question: locale === 'fr' ? "Quels modes de paiement sont acceptés ?" : "What payment methods are accepted?",
          answer: locale === 'fr' 
            ? "Les paiements par carte de crédit sont acceptés."
            : "Credit card payments are accepted."
        },
        {
          question: locale === 'fr' ? "Puis-je ajouter ou modifier ma carte de crédit ?" : "Can I add or modify my credit card?",
          answer: locale === 'fr' 
            ? "Oui, vous pouvez mettre à jour votre carte de crédit directement dans la section profil."
            : "Yes, you can update your credit card directly in the profile section."
        },
        {
          question: locale === 'fr' ? "Que faire si un paiement a été refusé ?" : "What to do if a payment has been refused?",
          answer: locale === 'fr' 
            ? "Vérifiez vos informations de carte ou ajoutez un nouveau mode de paiement pour régulariser la situation."
            : "Check your card information or add a new payment method to resolve the situation."
        },
        {
          question: locale === 'fr' ? "Est-ce que je reçois une confirmation par courriel pour chaque paiement ?" : "Do I receive an email confirmation for each payment?",
          answer: locale === 'fr' 
            ? "Oui, une confirmation est envoyée automatiquement à l'adresse associée à votre compte."
            : "Yes, a confirmation is automatically sent to the address associated with your account."
        },
        {
          question: locale === 'fr' ? "Puis-je obtenir un relevé mensuel de mes paiements ?" : "Can I get a monthly statement of my payments?",
          answer: locale === 'fr' 
            ? "Oui, vous pouvez télécharger vos factures mois par mois dans votre historique de paiement."
            : "Yes, you can download your invoices month by month in your payment history."
        }
      ]
    },
    {
      title: locale === 'fr' ? "Mon compte entreprise (Profil et compte)" : "My business account (Profile and account)",
      items: [
        {
          question: locale === 'fr' ? "Quelles informations apparaissent dans mon profil public sur gosholo ?" : "What information appears in my public profile on gosholo?",
          answer: locale === 'fr' 
            ? "Votre nom d'entreprise, description, logo, catégorie, coordonnées et s'affichent sur votre profil visible dans l'application."
            : "Your business name, description, logo, category, contact details are displayed on your profile visible in the application."
        },
        {
          question: locale === 'fr' ? "Comment modifier ma description, mes horaires ou mes coordonnées ?" : "How to modify my description, schedule or contact details?",
          answer: locale === 'fr' 
            ? "Vous pouvez mettre à jour ces informations dans la section « Profil et Compte » dans mes commerce ou via votre tableau de bord."
            : "You can update this information in the 'Profile and Account' section in my businesses or via your dashboard."
        },
        {
          question: locale === 'fr' ? "Puis-je changer mon logo ou mes images de commerce ?" : "Can I change my logo or business images?",
          answer: locale === 'fr' 
            ? "Oui, vous pouvez remplacer vos visuels à tout moment dans la section « Profil et Compte » dans mes commerces ou via votre tableau de bord."
            : "Yes, you can replace your visuals at any time in the 'Profile and Account' section in my businesses or via your dashboard."
        },
        {
          question: locale === 'fr' ? "Comment ajouter plusieurs succursales à un seul compte ?" : "How to add multiple branches to a single account?",
          answer: locale === 'fr' 
            ? "Chaque succursale doit être ajoutée séparément depuis votre tableau de bord pour apparaître sur la carte."
            : "Each branch must be added separately from your dashboard to appear on the map."
        },
        {
          question: locale === 'fr' ? "Comment changer mon mot de passe ou mon courriel de connexion ?" : "How to change my password or login email?",
          answer: locale === 'fr' 
            ? "Vous pouvez le faire dans la section « Profil et Compte » dans information du compte."
            : "You can do this in the 'Profile and Account' section in account information."
        },
        {
          question: locale === 'fr' ? "Est-ce que je peux supprimer mon compte définitivement ?" : "Can I permanently delete my account?",
          answer: locale === 'fr' 
            ? "Oui, vous pouvez le faire dans la section Profil et compte."
            : "Yes, you can do this in the Profile and account section."
        }
      ]
    }
  ]

  return (
    <Card className="bg-white border border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg text-primary">
          {locale === 'fr' ? 'Questions fréquemment posées (FAQ)' : 'Frequently Asked Questions (FAQ)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {faqSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3">
            <h3 className="text-base font-semibold text-primary border-b border-primary/20 pb-2">
              {section.title}
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {section.items.map((item, itemIndex) => (
                <AccordionItem key={itemIndex} value={`item-${sectionIndex}-${itemIndex}`} className="border-b border-primary/10">
                  <AccordionTrigger className="text-left text-sm font-medium text-primary hover:text-primary/80 py-3">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-primary/70 pb-3 whitespace-pre-line">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
