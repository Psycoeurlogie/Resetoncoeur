# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Webhook Instagram Comments-to-DM + site statique + emails pour le compte @psy.coeurlogie.

- **Site (Vercel)** : `resetoncoeur.vercel.app` / `resetoncoeur.fr` — déploiement automatique sur push `main`
- **Webhook (Railway)** : `upbeat-growth-production-4db4.up.railway.app` — projet `upbeat-growth`
- **App Meta** : `psy.coeurlogie automation`, APP_ID `1271378321813561`
- **IG_USER_ID** : `17841480078629028`
- **Guide DM de référence** : `/Users/gentx/workspace/kaiskin-webhook/GUIDE-DM-AUTO-COMPLET.md`

## Architecture — deux déploiements séparés

```
resetoncoeur/              ← Vercel (site statique + serverless)
  *.html                   ← pages HTML vanilla
  styles.css               ← feuille de style partagée
  api/subscribe.js         ← serverless ESM — inscription Brevo (listes 9-13)
  email-templates/         ← templates HTML envoyés via Brevo
  package.json             ← "type":"module" uniquement (pas de build)
  vercel.json              ← redirects légaux + CSP headers

  webhook/                 ← Railway (service Node séparé, déploiement indépendant)
    server.js              ← Express, HMAC-SHA256, DM comments + follower
    package.json           ← dépendances Express, Upstash Redis
    get-token.js           ← OAuth local port 9000 pour générer un nouveau token IG
    analyze.js             ← rapport analytics Instagram
```

Le dossier `webhook/` est un projet Node **autonome** avec ses propres `node_modules`. Ne pas exécuter `npm install` depuis la racine pour le webhook.

## Commandes

```bash
# Webhook — développement local
cd webhook && node server.js

# Webhook — logs Railway (depuis webhook/)
railway logs

# Webhook — déploiement Railway
# TOUJOURS vérifier le projet lié avant : railway status
# upbeat-growth = psy.coeurlogie | acceptable-comfort = kaiskin (mauvais projet)
railway up

# Webhook — vérifier que le service répond
curl https://upbeat-growth-production-4db4.up.railway.app/health

# Site — déploiement Vercel (automatique sur push, ou manuel)
vercel --prod
```

## Conventions email templates

| Préfixe | Séquence | Trigger | Emails |
|---------|----------|---------|--------|
| `mg-email1-5` | Mini-guide | Inscription Brevo | J+0 / J+2 / J+4 / J+6 / J+8 |
| `pa-email1-5` | Post-achat e-book | Achat Stripe (à configurer) | J+0 / J+3 / J+7 / J+14 / J+21 |
| `p1-email1-4` à `p5-email4` | Quiz profils 1-5 | Quiz resetoncoeur.fr/quiz.html | immédiat / J+2 / J+4 / J+7 |

Le contenu source des séquences quiz (profils 1-5) est dans `email-sequences.md`. Les fichiers HTML dans `email-templates/` sont les versions finales déjà créées dans Brevo.

## Brevo — liste IDs

`api/subscribe.js` n'accepte que les list IDs 9, 10, 11, 12, 13. Tout autre ID retourne 400.

## Sécurité

Ne JAMAIS demander ou afficher de token, APP_SECRET, ou autre secret dans le chat.
Les secrets ne vivent que dans `webhook/.env` et dans les variables Railway.

## SELF-LEARNING

**Règles obligatoires :**

1. Lire `tasks/lessons.md` au début de chaque session, avant de toucher au code.
2. Appliquer chaque règle de `tasks/lessons.md` avant toute modification.
3. Après chaque correction de l'utilisateur, ajouter immédiatement une entrée dans `tasks/lessons.md` au format :
   ```
   [YYYY-MM-DD] | ce qui s'est mal passé | règle à suivre la prochaine fois
   ```
