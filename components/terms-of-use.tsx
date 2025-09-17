"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/contexts/language-context"

interface TermsOfUseProps {
  children: React.ReactNode
}

export function TermsOfUse({ children }: TermsOfUseProps) {
  const { locale } = useLanguage()

  const frenchTerms = `**Conditions d'utilisation du site Web de gosholo.com**

**Utilisation du site Web gosholo**
Ce site Web gosholo.com, incluant les réseaux sociaux, applications mobiles et autres plateformes détenues et exploitées par gosholo (collectivement le « Site »), est la propriété de gosholo, appartenant à Les Sociétés Haeyu Inc., dont le siège social est situé au 3626 rue Adam, Montréal, Québec, H1W 1Y9. En accédant ou en naviguant sur ce Site, vous acceptez sans condition d'être soumis aux présentes Conditions d'utilisation (les « Conditions ») et à toutes les lois applicables. L'utilisation de notre Site est réservée à un usage personnel et non commercial.

**Modification des présentes Conditions**
gosholo se réserve le droit de modifier ces Conditions en tout temps, sans préavis. Les Conditions en vigueur sont disponibles en tout temps sur notre Site, et en poursuivant votre visite, vous consentez aux Conditions alors en vigueur. Il est de votre responsabilité de vous tenir informé des Conditions et des modifications apportées, indiquées par la date de mise à jour.

**Modification du Site, des services et des offres**
gosholo se réserve le droit de modifier, suspendre ou retirer tout contenu, service ou offre sur le Site, à sa seule discrétion et sans préavis. gosholo n'est pas responsable des pertes ou dommages résultant de telles modifications.

**Hyperliens**
Le Site peut contenir des hyperliens vers des sites externes opérés par des tiers. gosholo n'a aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu. L'utilisation de ces sites est aux risques de l'utilisateur, sans aucune responsabilité pour gosholo.

**Protection des enfants**
gosholo respecte les lois relatives à la protection des enfants en ligne. Les parents sont invités à surveiller l'utilisation du Site par leurs enfants.

**Limitation de responsabilité**
gosholo ne pourra être tenu responsable de tout dommage direct ou indirect, incluant, sans s'y limiter, la perte de données, les interruptions ou erreurs de service ou de produit, même si gosholo a été informé de la possibilité de tels dommages. Votre recours exclusif est de cesser d'utiliser le Site.

**Risques associés à l'utilisation de l'Internet**
Le Site est accessible en fonction de sa disponibilité. Bien que gosholo s'efforce de maintenir le Site exempt de toute erreur ou virus, il n'est pas garanti que le Site soit toujours exempt de problèmes techniques. Vous êtes responsable de tout dommage à votre appareil résultant de votre navigation.

**Code d'utilisateur, mot de passe et sécurité**
Lorsque applicable, gosholo déploie des mesures de sécurité pour protéger vos informations, mais la confidentialité totale sur Internet n'étant pas garantie, l'utilisation de l'Internet comporte des risques. Vous êtes responsable de la sécurité de vos identifiants et devez informer gosholo en cas d'utilisation non autorisée de votre compte.

**Utilisation de l'information et erreurs**
Le contenu du Site est fourni à titre informatif seulement. Bien que gosholo fasse tout son possible pour maintenir les informations exactes et à jour, des erreurs peuvent se produire. gosholo se réserve le droit de corriger ces erreurs sans préavis.

**Droits de propriété intellectuelle**
Tout contenu du Site, incluant les textes, images, vidéos, logos, et autres éléments, est protégé par les droits de propriété intellectuelle de gosholo ou de ses partenaires. Toute utilisation sans autorisation préalable est strictement interdite.

**Commentaires et suggestions**
En nous envoyant des commentaires ou suggestions via le Site, vous concédez à gosholo une licence irrévocable, perpétuelle et gratuite pour utiliser ces informations.

**Sécurité du Site**
L'utilisation du Site doit être conforme aux présentes Conditions. Toute tentative d'accès non autorisé ou de violation de la sécurité peut entraîner des poursuites civiles ou pénales.

**Fin de l'utilisation du Site**
gosholo se réserve le droit de mettre fin ou de suspendre votre accès au Site, à sa seule discrétion et sans préavis.

**Autres conditions d'utilisation**
Certaines offres ou services peuvent être soumis à des conditions additionnelles spécifiques qui vous seront communiquées lors de leur accès.

**Lois applicables**
L'utilisation du Site est soumise aux lois de la province de Québec et du Canada, et tout litige sera soumis aux tribunaux de la province de Québec, district de Montréal.

**Contactez-nous**
Pour toute question, veuillez contacter le Service clientèle de gosholo à l'adresse suivante :
Les Sociétés Haeyu Inc.
3626 rue Adam, Montréal, Québec, H1W 1Y9
Email : assistance@gosholo.com

**gosholo est une propriété de Les Sociétés Haeyu Inc.**`

  const englishTerms = `**Terms of Use for the gosholo Website**

**Use of the gosholo Website**
This website, gosholo.com, including social networks, mobile applications, and other platforms owned and operated by gosholo (collectively, the "Site"), is the property of gosholo, owned by Les Sociétés Haeyu Inc., with its head office located at 3626 rue Adam, Montreal, Quebec, H1W 1Y9. By accessing or browsing this Site, you unconditionally agree to be bound by these Terms of Use (the "Terms") and all applicable laws. Use of our Site is for personal, non-commercial purposes only.

**Modification of These Terms**
gosholo reserves the right to modify these Terms at any time, without prior notice. The current Terms are available at all times on our Site, and by continuing your visit, you agree to the Terms then in effect. It is your responsibility to stay informed of the Terms and any changes, indicated by the update date.

**Modification of the Site, Services, and Offers**
gosholo reserves the right to modify, suspend, or remove any content, service, or offer on the Site at its sole discretion and without notice. gosholo is not responsible for any loss or damage resulting from such modifications.

**Hyperlinks**
The Site may contain hyperlinks to external sites operated by third parties. gosholo has no control over these sites and disclaims any responsibility for their content. Use of these sites is at the user's own risk, without any liability for gosholo.

**Child Protection**
gosholo complies with online child protection laws. Parents are encouraged to supervise their children's use of the Site.

**Limitation of Liability**
gosholo shall not be liable for any direct or indirect damages, including, without limitation, data loss, service interruptions, or product errors, even if gosholo has been advised of the possibility of such damages. Your sole remedy is to stop using the Site.

**Risks Associated with Internet Use**
The Site is accessible based on its availability. While gosholo strives to keep the Site free of errors or viruses, there is no guarantee that the Site will always be free from technical issues. You are responsible for any damage to your device resulting from your browsing.

**User ID, Password, and Security**
Where applicable, gosholo deploys security measures to protect your information, but complete confidentiality on the Internet is not guaranteed, and Internet use involves risks. You are responsible for the security of your credentials and must notify gosholo of any unauthorized use of your account.

**Use of Information and Errors**
The content of the Site is provided for informational purposes only. Although gosholo makes every effort to keep information accurate and up to date, errors may occur. gosholo reserves the right to correct these errors without prior notice.

**Intellectual Property Rights**
All content on the Site, including text, images, videos, logos, and other elements, is protected by the intellectual property rights of gosholo or its partners. Any use without prior authorization is strictly prohibited.

**Comments and Suggestions**
By sending us comments or suggestions via the Site, you grant gosholo an irrevocable, perpetual, and royalty-free license to use this information.

**Site Security**
Use of the Site must comply with these Terms. Any attempt at unauthorized access or security breach may result in civil or criminal proceedings.

**Termination of Site Use**
gosholo reserves the right to terminate or suspend your access to the Site at its sole discretion and without notice.

**Other Terms of Use**
Certain offers or services may be subject to additional specific conditions that will be communicated to you upon access.

**Applicable Laws**
Use of the Site is governed by the laws of the province of Quebec and Canada, and any dispute will be submitted to the courts of the province of Quebec, district of Montreal.

**Contact Us**
For any questions, please contact gosholo's Customer Service at the following address:
Les Sociétés Haeyu Inc.
3626 rue Adam, Montreal, Quebec, H1W 1Y9
Email: assistance@gosholo.com

**gosholo is a property of Les Sociétés Haeyu Inc.**`

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
            {locale === 'fr' ? 'Conditions d\'utilisation' : 'Terms of Use'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] sm:h-[65vh] pr-4">
          <div className="space-y-2">
            {formatText(locale === 'fr' ? frenchTerms : englishTerms)}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
