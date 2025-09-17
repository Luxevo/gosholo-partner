"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/contexts/language-context"

interface PrivacyPolicyProps {
  children: React.ReactNode
}

export function PrivacyPolicy({ children }: PrivacyPolicyProps) {
  const { locale } = useLanguage()

  const frenchPolicy = `**Politique de Confidentialité de gosholo web et application mobile**

Chez gosholo, la protection de vos renseignements personnels est de la plus haute importance. Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons les informations vous concernant lorsque vous utilisez notre plateforme en ligne. En utilisant le site web et l'application mobile de gosholo, vous acceptez les pratiques décrites dans cette politique.

**1. Renseignements que Nous Collectons**
Nous pouvons recueillir les types de renseignements suivants :
Renseignements personnels : tels que votre nom, adresse courriel, numéro de téléphone, ou toute information permettant de vous identifier directement.
Informations techniques : incluant l'adresse IP, le type d'appareil, le navigateur, les pages visitées et la durée des visites.
Données transactionnelles : toute information sur les interactions avec les offres et les partenaires de gosholo, y compris les points accumulés et échangés.

**2. Utilisation des Renseignements**
Les renseignements recueillis sont utilisés pour :
Fournir et améliorer nos services : pour gérer votre compte, faciliter vos transactions et offrir une meilleure expérience utilisateur.
Communiquer avec vous : en envoyant des notifications et des offres ciblées, et en répondant à vos demandes.
Analyser et comprendre l'utilisation de la plateforme : pour améliorer nos services, adapter notre contenu et optimiser nos fonctionnalités.
Conformité légale : lorsque requis, pour respecter les lois, règlements ou autres demandes légales.

**3. Partage des Renseignements**
Nous ne partageons vos renseignements personnels qu'avec :
Nos partenaires commerciaux : uniquement pour les transactions en lien avec les offres, en veillant à limiter les informations partagées à ce qui est strictement nécessaire.
Fournisseurs de services : qui travaillent pour notre compte, tels que des services d'hébergement ou de messagerie, toujours avec des ententes garantissant la confidentialité de vos données.
Autorités légales : si requis par la loi ou pour protéger nos droits, en conformité avec les règlements en vigueur.

**4. Conservation et Sécurité des Données**
Nous conservons vos informations personnelles aussi longtemps que nécessaire pour atteindre les objectifs définis dans cette politique. Nous prenons des mesures raisonnables de sécurité pour protéger vos données contre l'accès non autorisé, la divulgation, ou la destruction.

**5. Vos Droits et Choix**
Conformément aux lois québécoises et canadiennes, vous disposez de droits relatifs à vos informations personnelles :
Accès et rectification : vous pouvez demander à accéder aux informations que nous détenons sur vous et à les corriger si elles sont inexactes.
Retrait du consentement : vous pouvez retirer votre consentement pour certaines utilisations de vos données en contactant notre service client.
Droit à l'effacement : dans certains cas, vous pouvez demander que vos données soient supprimées.

**6. Cookies et Technologies Similaires**
Nous utilisons des cookies et des technologies similaires pour :
Améliorer votre expérience sur notre site.
Analyser et comprendre l'utilisation de notre plateforme.
Personnaliser les publicités et contenus qui vous sont proposés.
Vous pouvez gérer vos préférences de cookies en modifiant les paramètres de votre navigateur.

**7. Modifications de la Politique de Confidentialité**
gosholo se réserve le droit de mettre à jour cette politique de confidentialité afin de refléter les changements dans nos pratiques de confidentialité ou les lois applicables. Toute modification sera affichée sur notre site avec la date de mise à jour.

**8. Contact**
Pour toute question, demande d'accès, de correction, ou de retrait de consentement, vous pouvez contacter notre responsable de la protection des renseignements personnels à :
Courriel : assistance@gosholo.com

**gosholo est une propriété de Les Sociétés Haeyu Inc.**`

  const englishPolicy = `**gosholo web and mobile application Privacy Policy**

At gosholo, protecting your personal information is of utmost importance. This privacy policy explains how we collect, use, share, and protect your information when you use our online platform. By using the gosholo website and mobile application, you agree to the practices described in this policy.

**1. Information We Collect**
We may collect the following types of information:
Personal Information: Such as your name, email address, phone number, or any information that can directly identify you.
Technical Information: Including IP address, device type, browser, visited pages, and duration of visits.
Transactional Data: Any information about interactions with Gosholo offers and partners, including points accumulated and redeemed.

**2. Use of Information**
The collected information is used to:
Provide and improve our services: To manage your account, facilitate transactions, and enhance user experience.
Communicate with you: By sending targeted notifications and offers and responding to your inquiries.
Analyze and understand platform usage: To improve our services, tailor content, and optimize our features.
Legal Compliance: When required, to comply with laws, regulations, or other legal requests.

**3. Sharing Information**
We share your personal information only with:
Our business partners: Solely for transactions related to offers, ensuring that shared information is limited to what is strictly necessary.
Service providers: Who work on our behalf, such as hosting or messaging services, always with agreements ensuring the confidentiality of your data.
Legal authorities: When required by law or to protect our rights, in compliance with applicable regulations.

**4. Data Retention and Security**
We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy. We take reasonable security measures to protect your data from unauthorized access, disclosure, or destruction.

**5. Your Rights and Choices**
In accordance with Quebec and Canadian laws, you have rights related to your personal information:
Access and Correction: You can request access to the information we hold about you and correct it if it is inaccurate.
Withdrawal of Consent: You can withdraw your consent for certain uses of your data by contacting our customer service.
Right to Erasure: In certain cases, you may request the deletion of your data.

**6. Cookies and Similar Technologies**
We use cookies and similar technologies to:
Improve your experience on our website.
Analyze and understand the use of our platform.
Personalize the advertisements and content offered to you.
You can manage your cookie preferences by changing your browser settings.

**7. Changes to the Privacy Policy**
gosholo reserves the right to update this privacy policy to reflect changes in our privacy practices or applicable laws. Any changes will be posted on our website with the update date.

**8. Contact**
For any questions, requests for access, correction, or withdrawal of consent, you can contact our Privacy Officer at:
Email: assistance@gosholo.com

**gosholo is owned and operated by Les Sociétés Haeyu Inc.**`

  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        // Bold headers
        return (
          <h3 key={index} className="font-bold text-lg mt-4 mb-2 text-primary">
            {line.replace(/\*\*/g, '')}
          </h3>
        )
      } else if (line.trim() === '') {
        // Empty lines
        return <div key={index} className="h-2" />
      } else {
        // Regular text
        return (
          <p key={index} className="text-sm text-gray-700 mb-2 leading-relaxed">
            {line}
          </p>
        )
      }
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] sm:max-h-[85vh] max-w-[95vw] sm:max-w-4xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            {locale === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] sm:h-[65vh] pr-4">
          <div className="space-y-2">
            {formatText(locale === 'fr' ? frenchPolicy : englishPolicy)}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
