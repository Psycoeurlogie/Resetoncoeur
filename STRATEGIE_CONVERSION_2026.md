# Stratégie de Conversion 2026 — @psy.coeurlogie (Majda)
**Document produit le : 2026-05-14**
**Compte : ~9 900 abonnées | Domaine : resetoncoeur.fr | Stack : Vercel + Brevo + Stripe + Webhook Node.js**

---

## Sommaire

1. Persona — La cliente idéale
2. Tunnel de conversion actuel — état réel et gaps
3. Offres — Structure complète de la gamme
4. Les 3 chantiers prioritaires
5. Roadmap 90 jours — Juin / Juillet / Août 2026
6. KPIs à suivre

---

## 1. Persona — La cliente idéale

### Profil sociodémographique

| Dimension | Détail |
|---|---|
| Prénom fictif | Yasmine |
| Age | 25–38 ans |
| Situation | Célibataire ou jeune mariée, sans enfant ou avec un enfant en bas âge |
| Localisation | France, Belgique, Suisse, Canada francophone |
| Rapport à la religion | Pratiquante modérée à pratiquante engagée — veut réconcilier foi et bien-être psychologique |
| Réseaux sociaux | Instagram principal, TikTok secondaire, peu présente sur Facebook |
| Consommation de contenu | Reels (temps d'arrêt entre 45 sec et 3 min), sauvegarde massivement les contenus utiles |

### Douleurs profondes

- Elle se sent **épuisée émotionnellement** sans comprendre vraiment pourquoi : fatigue spirituelle, ruminations, sentiment de vide malgré les prières.
- Elle cherche à **guérir d'une blessure passée** (rupture, deuil, trahison, conflit familial) mais ne sait pas par où commencer.
- Elle a l'impression que la thérapie classique **ne parle pas son langage** — elle veut une approche qui intègre l'Islam, pas qui l'ignore.
- Elle est tiraillée entre ce que la société lui demande d'être et ce qu'elle ressent intérieurement comme ses **vraies valeurs islamiques**.
- Elle a commencé plusieurs fois des "programmes de développement personnel" puis abandonnée — **manque de régularité** et de cadre bienveillant.

### Aspirations

- Retrouver la **paix du cœur** (sakina) — un état stable, pas juste des pics d'émotion positifs.
- Développer des **habitudes ancrées dans la Sunnah** qui lui donnent structure et sens dans le quotidien.
- Se **réconcilier avec elle-même** : son corps, ses émotions, son rapport à Allah.
- Être guidée par quelqu'un qui **la comprend de l'intérieur** — pas une coach généraliste, une femme qui a le même référentiel.
- Obtenir des **résultats concrets et mesurables** en un temps raisonnable (7 jours, 21 jours, pas une démarche floue).

### Vocabulaire et langue islamique

Elle dit naturellement : baraka, khayr, bi idhni'llah, incha'Allah, alhamdulillah, sakina, tawakkul, tawba, zikr, dua, Sunnah, nigelle (habbatus sawda), hijra intérieure. Elle réagit fortement aux contenus qui associent science moderne et versets coraniques. Elle sauvegarde les Reels "pratiques" qu'elle compte appliquer.

### Comportement d'achat

- Sensible aux **offres basses à risque zéro** pour tester (guide gratuit, ebook < 20€).
- Prête à investir davantage si elle a eu une **première transformation concrète**.
- Achète **seule**, pas besoin de valider avec son entourage.
- Fait confiance aux **témoignages de femmes qui lui ressemblent**.
- Frein principal : "je ne suis pas sûre que ça va vraiment changer quelque chose pour moi."

---

## 2. Tunnel de conversion actuel — État réel et gaps

### Schéma du tunnel actuel

```
TOFU (Awareness)
Instagram Reels — reach moyen 17 369 / post
Mots-clés déclencheurs webhook : "sunnah", "baraka"
         |
         v (DM automatique → lien mini-guide)
MOFU (Consideration)
Page mini-guide.html (resetoncoeur.fr/mini-guide.html)
Formulaire Brevo — liste active, 6 contacts
Lead magnet : PDF "Reset ton corps avec la Sunnah" 7 jours
         |
         v (???  —  GAP CRITIQUE : pas de séquence email)
BOFU (Decision)
Page ebook.html (resetoncoeur.fr/ebook.html)
Ebook "Reset ton cœur — 21 jours" — 17€ via Stripe
```

### Analyse des gaps identifiés

**Gap 1 — Chute entre DM et capture email (impact : CRITIQUE)**
Le webhook envoie un DM avec le lien direct vers `mini-guide.html`. Si la personne visite la page sans laisser son email, elle est perdue à jamais. Il n'existe pas de page de capture dédiée avec un seul objectif (email only) avant l'accès au PDF. La liste Brevo à 6 contacts confirme ce problème : le volume de DM envoyés est sans doute 10 à 50x supérieur.

**Gap 2 — Absence de nurturing post-lead magnet (impact : CRITIQUE)**
Il n'existe aucune séquence email automatisée après inscription au mini-guide. Les templates HTML dans `/email-templates/` existent (p1 à p5, emails 1 à 4) mais ne semblent pas branchés sur une automation Brevo opérationnelle. La personne reçoit le guide et disparaît dans le silence. Aucun pont vers l'ebook à 17€.

**Gap 3 — Un seul point d'entrée webhook (impact : MOYEN)**
Les mots-clés "sunnah" et "baraka" envoient tous vers le même DM et le même lead magnet. Aucune distinction entre une personne qui cherche des rituels corps (mini-guide pertinent) et une personne qui cherche un accompagnement cœur/coaching (offre premium pertinente). Les futurs mots-clés NAJAT et COEUR permettront de corriger cela.

**Gap 4 — Pas d'offre intermédiaire entre 17€ et le vide (impact : ÉLEVÉ)**
La gamme s'arrête à l'ebook 17€. Il n'existe rien entre 17€ et rien. Une personne qui finit l'ebook et veut "aller plus loin" n'a nulle part où aller. Ce gap génère une perte de valeur client massive.

**Gap 5 — Absence de preuve sociale visible (impact : MOYEN)**
Aucune page ou section de témoignages. Les top Reels génèrent des milliers de sauvegardes et d'interactions mais cette confiance construite sur Instagram ne se transforme pas en preuves sur le site.

### Forces à capitaliser

- Le contenu Reels fonctionne de manière exceptionnelle : ratio engagement/reach bien supérieur à la moyenne du secteur.
- Le webhook DM est opérationnel, fiable (déduplication Redis, signature Meta vérifiée) et scalable.
- La stack Brevo + Stripe est en place — aucune infrastructure à reconstruire.
- La marque "Reset ton cœur" et "Psycoeurlogie" ont une identité visuelle cohérente et premium.

---

## 3. Offres — Structure complète de la gamme

### Vue d'ensemble de la gamme

| Niveau | Nom | Prix | Format | Statut |
|---|---|---|---|---|
| Gratuit | Mini-guide "Reset ton corps avec la Sunnah" | 0€ | PDF 7 jours | En place |
| Low-ticket | Ebook "Reset ton cœur — 21 jours" | 17€ | PDF programme | En place |
| Moyen-ticket | Programme "Cœur Apaisé" | 147€ | Vidéos + workbook | A créer |
| High-ticket | Coaching individuel "Najat" | 490–690€ | Séances 1:1 | A créer |

---

### Offre 0 — Mini-guide (existant, à optimiser)

**Nom complet :** Reset ton corps avec la Sunnah — 7 jours pour réaligner corps, esprit et âme

**Prix :** Gratuit contre email

**Format :** PDF livré par email, 7 jours de protocole quotidien

**Promesse :** En 7 jours, intégrer 3 habitudes Sunnah concrètes qui transforment ton énergie physique et ta clarté mentale.

**A qui :** Yasmine qui vient de découvrir Majda via un Reel et veut une "première victoire rapide" sans engagement financier.

**Action prioritaire :** Créer une landing page de capture dédiée avant l'accès (voir Chantier 1).

---

### Offre 1 — Ebook 17€ (existant, à promouvoir)

**Nom complet :** Reset ton cœur — 21 jours pour reconstruire ta paix intérieure

**Prix :** 17€ (Stripe en place)

**Format :** PDF programme jour par jour, 21 jours

**Promesse :** En 21 jours de pratique guidée, libère les émotions qui t'alourdissent, retrouve ta stabilité intérieure et reconstruis un lien apaisé avec toi-même — avec les outils de la Sunnah et de la psychologie positive.

**A qui :** Yasmine qui a apprécié le mini-guide gratuit et veut un vrai programme structuré. Elle est prête à tester à faible risque financier.

**Déclencheur email :** Email 4 et 5 de la séquence post-mini-guide (voir Chantier 2).

---

### Offre 2 — Programme "Cœur Apaisé" (à créer) — Moyen-ticket

**Nom :** Cœur Apaisé — 6 semaines pour reconstruire ta stabilité émotionnelle avec l'Islam

**Prix :** 147€ (lancement fondateur) / 197€ (prix normal)

**Format :**
- 6 modules vidéo (1 par semaine, 20–35 min chacun)
- 1 workbook PDF par module (exercices, réflexions, duas adaptées)
- Accès à un espace communautaire privé (groupe Telegram ou WhatsApp fermé)
- Accès illimité au contenu une fois acheté

**Contenu suggéré des 6 modules :**
1. Comprendre son cœur — cartographier ses blessures émotionnelles
2. Le pardon comme libération — protocole pratique
3. Restructurer ses pensées avec les outils coraniques
4. Retrouver le corps — rituel Sunnah au quotidien
5. Construire des habitudes stables (barakah dans la routine)
6. La femme qui avance — vision, dua et planification

**Promesse :** En 6 semaines, transforme durablement ta relation à tes émotions, tes habitudes et à Allah — sans culpabilité, sans perfectionnisme, avec douceur et méthode.

**A qui :** Yasmine qui a terminé l'ebook 21 jours et veut aller en profondeur, ou qui cherche d'emblée un programme structuré. Elle est prête à investir pour un vrai changement.

**Mot-clé webhook déclencheur :** COEUR (→ DM vers page dédiée programme Cœur Apaisé)

**Comment vendre :** Séquence email dédiée + Reel spécifique + upsell post-achat ebook 17€

---

### Offre 3 — Coaching individuel "Najat" (à créer) — High-ticket

**Nom :** Najat — Accompagnement individuel sur-mesure (najat = salut, délivrance en arabe)

**Prix :** 490€ (3 mois, formule essentielle) / 690€ (3 mois, formule complète)

**Format — Formule essentielle (490€) :**
- 6 séances individuelles de 60 min en visio (1 séance toutes les 2 semaines)
- Accès au programme Cœur Apaisé inclus
- Support WhatsApp entre les séances (réponse sous 48h)
- Plan personnalisé de rituels et pratiques

**Format — Formule complète (690€) :**
- 8 séances individuelles de 60 min en visio
- Accès au programme Cœur Apaisé inclus
- Support WhatsApp illimité
- Plan personnalisé + bilan final avec feuille de route 3 mois suivants

**Promesse :** En 3 mois d'accompagnement sur-mesure, transforme en profondeur ce qui te bloque — blessures relationnelles, anxiété chronique, perte de sens — avec une approche qui respecte ton identité de femme musulmane.

**A qui :** Yasmine en situation de crise émotionnelle sérieuse (séparation, deuil, burn-out spirituel) qui veut être accompagnée personnellement, pas seulement suivre un programme. Elle a les moyens d'investir et cherche avant tout une relation de confiance.

**Processus d'achat :** Pas d'achat direct — appel de découverte 30 min obligatoire (formulaire contact.html ou lien Calendly). Stripe pour le paiement une fois l'appel concluant.

**Mot-clé webhook déclencheur :** NAJAT (→ DM vers page appel découverte coaching Najat)

**Comment vendre :** Reel storytelling personnel de Majda + email dédié liste chaude + upsell post-programme Cœur Apaisé

---

## 4. Les 3 chantiers prioritaires

### Chantier 1 — Page de capture email dédiée (Urgence : IMMÉDIATE)

**Problème résolu :** Actuellement le webhook DM envoie vers `mini-guide.html` qui n'est pas optimisée pour la capture. Les personnes passent sans laisser leur email. La liste Brevo à 6 contacts en est la preuve.

**Ce qu'il faut construire :**
Créer une nouvelle page `/capture.html` (ou renommer/rediriger) avec un seul objectif : obtenir l'email en échange du mini-guide. Cette page doit :
- Avoir un titre ultra-clair : "Ton mini-guide gratuit t'attend — entre ton email pour le recevoir maintenant"
- Un seul champ : email
- Un seul bouton CTA : "Recevoir mon guide"
- Aucun lien de navigation (pas de menu, pas de footer distrayant)
- Confirmation : page `/merci.html` déjà existante (réutilisable)

**Modification webhook server.js nécessaire :**
Remplacer dans la constante `DOWNLOAD_LINK` :
```
Avant : 'https://resetoncoeur.vercel.app/mini-guide.html'
Après : 'https://resetoncoeur.fr/capture.html'
```

**Brevo — Automation à vérifier :**
L'inscription sur `/capture.html` doit déclencher l'envoi automatique du PDF via Brevo (automation déjà active selon la mémoire projet — vérifier que le trigger est bien sur cette liste).

**Objectif :** Passer de 6 contacts à 50+ contacts en 30 jours post-déploiement.

---

### Chantier 2 — Séquence email 5 emails post-mini-guide (Urgence : HAUTE)

**Problème résolu :** Silence total après le guide. Aucune conversion vers l'ebook 17€. Les templates HTML existent dans `/email-templates/` mais ne forment pas une séquence cohérente branchée sur Brevo.

**Structure de la séquence (à configurer dans Brevo Automation) :**

| Email | Délai | Objet | Objectif | Contenu clé |
|---|---|---|---|---|
| Email 1 | J+0 (immédiat) | "Ton guide est là — bismillah" | Livraison + première connexion | Lien PDF, mot de bienvenue chaleureux de Majda, 1 hadith sur l'intention |
| Email 2 | J+2 | "Jour 2 — comment tu te sens ?" | Engagement + confiance | Retour sur le Jour 1, encouragement, une astuce bonus non dans le guide, question ouverte |
| Email 3 | J+4 | "Ce que personne ne te dit sur les habitudes Sunnah" | Valeur pure + autorité | Insight surprenant (ex: science + Sunnah), lien vers le Reel le plus viral du compte |
| Email 4 | J+6 | "Tu arrives au bout — et après ?" | Transition douce vers l'offre payante | Félicitations, question "tu veux aller plus loin ?", introduction de l'ebook 21 jours avec la promesse |
| Email 5 | J+8 | "Dernière chance — le programme 21 jours t'attend" | Conversion ebook 17€ | Témoignage (si disponible), récapitulatif de la promesse de l'ebook, lien Stripe direct, urgence douce |

**Ton de toute la séquence :**
- Voix de Majda, première personne, chaleureux et bienveillant
- Formules islamiques naturelles (bismillah, alhamdulillah, barakAllah fiki)
- Jamais de pression agressive — "je t'accompagne si tu veux aller plus loin"
- Format texte simple (pas de lourd HTML) sur mobile — les templates existants sont déjà bien structurés

**Configuration Brevo :**
- Trigger : inscription à la liste "mini-guide" (déjà active)
- Délais en jours absolus (J+0, J+2, J+4, J+6, J+8)
- Condition de sortie : si l'abonnée a cliqué sur le lien Stripe de l'ebook (achat) → sortir de la séquence

---

### Chantier 3 — Nouveaux mots-clés webhook : NAJAT et COEUR (Urgence : MOYENNE)

**Problème résolu :** Un seul message DM pour tout le monde. Pas de personnalisation selon l'intention exprimée dans le commentaire.

**Modification technique dans `webhook/server.js` :**

La constante `KEYWORDS` actuelle :
```javascript
const KEYWORDS = ['sunnah', 'baraka']
```

Doit devenir une map de routage :
```javascript
const KEYWORD_ROUTES = {
  sunnah: { link: 'https://resetoncoeur.fr/capture.html', message: 'mini-guide' },
  baraka: { link: 'https://resetoncoeur.fr/capture.html', message: 'mini-guide' },
  coeur:  { link: 'https://resetoncoeur.fr/programme-coeur-apaise.html', message: 'programme' },
  najat:  { link: 'https://resetoncoeur.fr/coaching-najat.html', message: 'coaching' },
}
```

**Message DM pour le mot-clé COEUR :**
```
As-salamu 'alaykum 🌙

Tu as commenté CŒUR — et ça ne surprend pas, ce sujet touche beaucoup de femmes en ce moment.

Si tu veux retrouver ta paix intérieure et reconstruire ta stabilité émotionnelle avec des outils qui parlent vraiment ton langage, j'ai quelque chose pour toi 👇🏼

[lien programme Cœur Apaisé]

Bi idhni'llah, ce programme peut changer beaucoup de choses 🤍
```

**Message DM pour le mot-clé NAJAT :**
```
As-salamu 'alaykum 🌙

Tu as commenté NAJAT — et si tu l'as fait, c'est probablement qu'une partie de toi cherche quelque chose de plus profond.

Je propose des accompagnements individuels sur-mesure pour les femmes prêtes à transformer vraiment ce qui les bloque.

Si tu veux qu'on en parle, voici comment réserver un appel découverte gratuit de 30 min 👇🏼

[lien appel découverte]

À bientôt incha'Allah 🤍
```

**Réels à créer pour alimenter ces mots-clés :**
- Pour COEUR : "Commente COEUR si toi aussi tu veux retrouver la paix" (fin de Reel sur la guérison émotionnelle)
- Pour NAJAT : "Commente NAJAT si tu veux un accompagnement personnalisé" (Reel storytelling de Majda)

---

## 5. Roadmap 90 jours — Juin / Juillet / Août 2026

### Vue d'ensemble

| Mois | Thème | Objectif principal |
|---|---|---|
| Juin | Fondations | Réparer le tunnel et activer la capture email |
| Juillet | Croissance | Lancer le programme Cœur Apaisé, faire 10 ventes |
| Août | Montée en gamme | Ouvrir les premières places coaching Najat |

---

### Juin 2026 — Fondations du tunnel

| Semaine | Actions | Livrable |
|---|---|---|
| S1 (2–8 juin) | Créer `/capture.html` dédiée capture email | Page en ligne sur resetoncoeur.fr |
| S1 | Modifier `server.js` : DOWNLOAD_LINK → `/capture.html` | Webhook mis à jour, déployé |
| S1 | Vérifier automation Brevo : trigger + livraison PDF | Email J+0 fonctionnel |
| S2 (9–15 juin) | Rédiger les 5 emails de la séquence post-mini-guide | Textes validés |
| S2 | Configurer l'automation Brevo 5 emails | Séquence active dans Brevo |
| S3 (16–22 juin) | Créer 2 Reels avec CTA "commente SUNNAH" | 2 Reels publiés |
| S3 | Créer 1 Reel avec CTA "commente COEUR" | 1 Reel publié |
| S4 (23–30 juin) | Analyser les premiers résultats capture (GA4 + Brevo) | Premier bilan, ajustements |

**Objectifs fin juin :**
- Liste Brevo : 50 contacts (contre 6 actuellement)
- Taux d'ouverture Email 1 : > 60%
- Premières ventes ebook via séquence email : 3–5 ventes

---

### Juillet 2026 — Lancement programme Cœur Apaisé

| Semaine | Actions | Livrable |
|---|---|---|
| S1–S2 (1–14 juil.) | Créer le contenu du programme : 6 modules vidéo + 6 workbooks PDF | Contenu programme terminé |
| S1 | Créer la page de vente `/programme-coeur-apaise.html` | Page en ligne |
| S2 | Configurer le produit Stripe 147€ | Paiement opérationnel |
| S2 | Ajouter COEUR dans les KEYWORD_ROUTES du webhook | Webhook mis à jour |
| S3 (15–21 juil.) | Lancement officiel : email à toute la liste + 2 Reels dédiés | Lancement visible |
| S3–S4 | Série de 3 Reels de preuve sociale (avant/après, témoignage) | Contenu de vente publié |
| S4 (22–31 juil.) | Email de relance liste chaude | Email envoyé |

**Objectifs fin juillet :**
- Liste Brevo : 150 contacts
- Ventes programme Cœur Apaisé : 10 ventes (1 470€ CA)
- Ventes ebook 17€ : 15 ventes cumulées depuis juin (255€)
- CA juillet : ~1 725€

---

### Août 2026 — Ouverture coaching Najat

| Semaine | Actions | Livrable |
|---|---|---|
| S1 (1–10 août) | Créer la page `/coaching-najat.html` avec formulaire appel découverte | Page en ligne |
| S1 | Ajouter NAJAT dans les KEYWORD_ROUTES du webhook | Webhook mis à jour |
| S1–S2 | Créer 2 Reels storytelling Majda (pourquoi ce coaching, son parcours) | Reels publiés |
| S2 | Email dédié à la liste : "Je prends 5 femmes en coaching ce mois-ci" | Email envoyé |
| S2–S3 | Mener les appels découverte (objectif : 10 appels, 4 closes) | Premières clientes Najat |
| S4 (25–31 août) | Bilan trimestriel complet + plan Q4 | Décisions Q4 prises |

**Objectifs fin août :**
- Liste Brevo : 250 contacts
- Ventes coaching Najat : 4 clientes (à 490€ = 1 960€)
- Ventes programme Cœur Apaisé cumulées : 20 ventes (2 940€)
- Ventes ebook 17€ cumulées : 30 ventes (510€)
- **CA cumulé Juin–Août : ~5 410€ (objectif conservateur)**

---

## 6. KPIs à suivre

| # | Métrique | Outil de mesure | Valeur cible | Fréquence |
|---|---|---|---|---|
| KPI 1 | Taille liste Brevo (contacts actifs) | Dashboard Brevo | 250 contacts fin août | Hebdomadaire |
| KPI 2 | Taux de conversion DM → capture email | Brevo nouveaux contacts / semaine vs. volume DM webhook | > 30% | Hebdomadaire |
| KPI 3 | Taux d'ouverture séquence email | Brevo statistiques emails | Email 1 > 60%, Email 5 > 35% | Par email envoyé |
| KPI 4 | Taux de conversion liste → ebook 17€ | Stripe ventes / contacts liste | > 5% sur 30 jours post-inscription | Mensuel |
| KPI 5 | Chiffre d'affaires mensuel | Stripe dashboard | 0€ (mai) → 300€ (juin) → 1 725€ (juillet) → 3 000€ (août) | Mensuel |

### Notes sur le suivi

- **GA4 (G-BH1LRKVSJG)** est déjà en place sur toutes les pages — créer des événements de conversion pour les clics sur le bouton Stripe de l'ebook et du programme.
- **Brevo** permet d'exporter un rapport hebdomadaire automatique — l'activer pour ne pas suivre manuellement.
- Le **webhook** logge déjà les DM envoyés en console — si le serveur est hébergé (Railway, Fly.io ou similaire), récupérer les logs pour compter le volume de DM par mot-clé.
- Revoir les KPIs mensuellement et ajuster les objectifs si la liste croît plus vite ou plus lentement que prévu.

---

## Synthèse des décisions à prendre dans les 7 prochains jours

1. Créer `/capture.html` et mettre à jour `server.js` avec la nouvelle URL.
2. Rédiger les 5 emails de la séquence et les configurer dans Brevo.
3. Planifier le tournage de 3 Reels pour juin (2x SUNNAH, 1x COEUR).
4. Décider du prix de lancement du programme Cœur Apaisé (147€ ou 197€).
5. Fixer les disponibilités pour les appels découverte Najat en août.

---

*Document vivant — à mettre à jour à chaque fin de mois avec les résultats réels vs. objectifs.*
