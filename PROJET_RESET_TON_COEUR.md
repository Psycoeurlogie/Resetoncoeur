# Reset ton cœur — Document de passation projet

## IDENTITÉ DU PROJET

- **Marque produit** : Reset ton cœur
- **Fondatrice / handle social** : Psycœurlogie (@psy.coeurlogie)
- **Produit principal** : Ebook "Reset ton cœur — Le programme 30 jours" — 17€
- **Lead magnet** : Mini-guide gratuit "Reset ton corps avec la Sunnah" — protocole 7 jours
- **Cible** : Femmes musulmanes 20-35 ans, guérison émotionnelle + spiritualité + dev perso
- **Positionnement** : "Deviens la personne qu'Allah veut que tu sois"

---

## STACK TECHNIQUE

- **Hébergement** : Vercel (gratuit)
- **Repository** : github.com/Psycoeurlogie/Resetoncoeur (public, branche main)
- **URL production** : resetoncoeur.vercel.app
- **Stack** : HTML statique + CSS + JS vanilla (pas de framework)
- **Paiement** : Stripe Payment Link
- **Email marketing** : Brevo
- **Formulaire contact** : Formspree (ID : xbdwrzpz) + Brevo (double fetch)
- **DM automation Instagram** : serveur webhook Node.js (`webhook/server.js`)

## WEBHOOK COMMENTS TO DM (`webhook/`)

Serveur Express qui écoute les commentaires Instagram et envoie automatiquement le lien mini-guide par DM.

- **Déclencheur** : commentaire contenant `sunnah` ou `baraka`
- **Message envoyé** : DM avec lien vers `mini-guide.html`
- **Déduplication** : Upstash Redis (ou mémoire en fallback)
- **Sécurité** : vérification signature Meta `x-hub-signature-256`
- **Stack** : Node.js 20+, Express, `@upstash/redis`

**Variables d'environnement requises** (voir `webhook/.env.example`) :
- `IG_TOKEN` — token Instagram long-lived
- `VERIFY_TOKEN` — token de vérification Meta webhook
- `APP_SECRET` — secret de l'app Meta
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — optionnel (Redis)

---

## FICHIERS DU PROJET

Tous les fichiers sont dans le repository GitHub :

| Fichier | Description | Statut |
|---------|-------------|--------|
| index.html | Page d'accueil | ✅ En ligne |
| ebook.html | Page de vente ebook | ✅ En ligne |
| mini-guide.html | Page lead magnet | ✅ En ligne |
| manifesto.html | Page manifesto | ✅ En ligne |
| contact.html | Page contact | ✅ En ligne |
| merci.html | Page post-achat | ✅ En ligne |
| mentions-legales.html | Mentions légales | ⚠️ Placeholders à remplir |
| cgv.html | CGV | ⚠️ Placeholders à remplir |
| confidentialite.html | Politique confidentialité | ⚠️ Placeholders à remplir |
| styles.css | Styles globaux partagés | ✅ En ligne |
| ebook-cover.png | Cover ebook principal | ✅ En ligne |
| page-2.png à page-8.png | Pages slider ebook | ✅ En ligne |
| mini-guide-cover.png | Cover mini-guide | ✅ En ligne |
| mini-guide-page-1.png | Page 1 mini-guide | ✅ En ligne |

---

## IDENTITÉ VISUELLE

```css
--ivory: #f7f1ea
--ivory-deep: #ede4d8
--rose: #d4a5a0
--rose-soft: #e8c8c4
--burgundy: #5c2a2f
--burgundy-deep: #3d1c20
--ink: #2a1d1f
--ink-soft: #5a4a4c
--gold: #b8956a
```

**Typographie** : Cormorant Garamond (italic, titres) + Inter (300/400/500, corps)

---

## STRIPE

- **Produit** : Reset ton cœur — Le programme 21 jours — 17€
- **Payment Link** : à récupérer dans le dashboard Stripe
- **Redirection post-paiement** : https://resetoncoeur.vercel.app/merci.html
- **⚠️ PENDING** : Remplacer les href="#" des boutons "Commencer pour 17€" dans ebook.html par le vrai lien Stripe

---

## BREVO

- **Compte** : majdasakhi.ms@gmail.com
- **Liste mini-guide** : "Mini Guide Reset Ton Coeur" (6 contacts)
- **Liste contact** : "Formulaire Contact"
- **Formulaire mini-guide** : URL sibforms — endpoint POST configuré
- **Formulaire contact** : URL sibforms — endpoint POST configuré
- **Automation mini-guide** : "Suivi de soumission de formulaire #1" — ACTIVE
- **Template email mini-guide** : Email bordeaux avec lien Google Drive PDF
- **Lien PDF mini-guide** : https://drive.google.com/file/d/1doSKJ0xqlJ3yKofs4RUqYIbv5ah2DTQo/view?usp=sharing
- **⚠️ PENDING** : Créer automation Brevo pour formulaire contact (email automatique à la sœur)

---

## FORMSPREE

- **ID** : xbdwrzpz
- **URL** : https://formspree.io/f/xbdwrzpz
- **Usage** : Formulaire contact → messages reçus dans Gmail (majdasakhi.ms@gmail.com)

---

## FONCTIONNEMENT DES FORMULAIRES

### Mini-guide (mini-guide.html)
- Fetch no-cors vers Brevo → contact ajouté à la liste → automation déclenche email PDF
- Message succès : "Vérifie ta boîte mail ✦ Ton guide arrive dans quelques minutes. Pense à vérifier tes spams."

### Contact (contact.html)
- Double fetch : Formspree (Gmail) + Brevo (email automatique à la sœur)
- ⚠️ Automation Brevo contact pas encore créée

---

## TÂCHES RESTANTES

Aucune — projet complet ✅

---

## TÂCHES COMPLÉTÉES

- ✅ Site complet 9 pages en ligne sur Vercel
- ✅ Paiement Stripe fonctionnel avec redirection merci.html
- ✅ Formulaire mini-guide avec email automatique Brevo (PDF Google Drive)
- ✅ Formulaire contact avec réception Gmail (Formspree) + email auto Brevo
- ✅ Automation Brevo contact créée
- ✅ Slider 8 pages sur ebook.html
- ✅ Slider 2 pages sur mini-guide.html
- ✅ Cover ebook remplacée par vraie image
- ✅ Image mini-guide vérifiée sur Vercel
- ✅ Google Analytics GA4 (G-BH1LRKVSJG) installé sur toutes les pages
- ✅ Bug CSP corrigé (sibforms.com autorisé pour Brevo)
- ✅ Pages légales remplies (mentions légales, CGV, confidentialité)
- ✅ ManyChat / DM automation Instagram active (@psycoeurlogie)

---

## INSTAGRAM

- **Handle** : @psy.coeurlogie
- **Followers** : ~9909
- **Stratégie** : Reel avec CTA "commente RESET" → DM automatique avec lien mini-guide
- **Problème ManyChat** : Instagram bloque les liens dans les DM automatiques
- **Solution en attente** : tester DM avec lien bio ou autre outil

---

## NOTES TECHNIQUES IMPORTANTES

- Les fichiers HTML contiennent leur propre CSS dans `<style>` + `styles.css` global
- Le script Brevo `main.js` (sibforms) NE DOIT PAS être chargé — il cause une erreur `removeClass` qui bloque les formulaires
- L'envoi vers Brevo se fait uniquement via fetch no-cors (pas de script externe)
- Les images du mini-guide s'appellent `mini-guide-cover.png` et `mini-guide-page-1.png` (avec tirets, sans espaces)
- URL Vercel de production : resetoncoeur.vercel.app (ignorer les URLs avec hash aléatoire)
