# Lessons — Reset ton cœur webhook

Format : [date] | ce qui s'est mal passé | règle à suivre la prochaine fois

---

[2026-05-14] | Changé l'endpoint DM plusieurs fois (graph.instagram.com ↔ graph.facebook.com) en tâtonnant, causant des déploiements inutiles et cassant un webhook qui fonctionnait | Lire GUIDE-DM-AUTO-COMPLET.md avant de toucher à l'endpoint. La règle est : graph.instagram.com/v21.0/me/messages + token IGAAS. Ne jamais changer sans avoir relu le guide.

[2026-05-14] | Déployé sur le mauvais projet Railway (acceptable-comfort = kaiskin) au lieu de upbeat-growth (psy.coeurlogie) | Toujours vérifier `railway status` ou le nom du projet dans `railway link` avant tout déploiement. upbeat-growth = psy.coeurlogie, acceptable-comfort = kaiskin.

[2026-05-14] | Plusieurs redéploiements en boucle pendant le debug ont rendu le webhook instable (Meta l'a marqué comme unhealthy) et ont cassé ce qui fonctionnait | Comprendre l'architecture complète AVANT de déployer. En cas de doute : lire le guide, vérifier les variables, tester le /health endpoint d'abord. Pas de déploiement à l'aveugle.

[2026-05-14] | Le token EAASET (Facebook User Token) a été mis dans IG_TOKEN à la place du token IGAAS (Instagram User Token) | Le token pour graph.instagram.com doit commencer par IGAAS. Le token EAASET (commence par EAASET) est pour graph.facebook.com. Ils ne sont pas interchangeables. Générer le bon token depuis : Meta App → Cas d'utilisation → Messenger → Section 2 → Générer un token.

[2026-05-14] | DEBUG_SIG=1 laissé actif en production après le debug — bypass de sécurité oublié | DEBUG_SIG=1 est un outil de diagnostic temporaire UNIQUEMENT. Dès qu'on confirme que le webhook reçoit bien les events (DM envoyé), le retirer IMMÉDIATEMENT de Railway. Ne jamais laisser une variable de bypass en production plus de 30 minutes.

[2026-05-14] | APP_SECRET lu directement depuis process.env sans .trim() — whitespace/newline invisible peut rendre le HMAC invalide | Toujours lire les secrets env avec .trim() : `process.env.APP_SECRET?.trim()`. Un newline de fin ajouté par railway CLI ou copier-coller suffit pour casser toutes les vérifications de signature.

[2026-05-14] | Quand HMAC ne correspond pas, ni avec la clé string ni avec la clé hex-décodée, ça signifie que l'APP_SECRET lui-même est corrompu dans Railway (whitespace, mauvaise valeur) | Checklist signature mismatch : (1) Ajouter `secLen=` dans les logs pour vérifier que `APP_SECRET.length === 32`. (2) Appliquer `.trim()`. (3) Vérifier dans Railway dashboard que la valeur est exactement 32 chars hex sans espaces ni guillemets. (4) Si toujours mismatch → effacer et re-saisir APP_SECRET manuellement dans le dashboard Railway (pas via CLI).

[2026-05-14] | Meta met le webhook en backoff après 10+ réponses 403 — les retries s'espacent, c'est normal | Quand on active DEBUG_SIG=1 pendant un backoff Meta, les retries arrivent progressivement (bodyLen identique = même event retenté). Ne pas s'alarmer si les DM ne partent pas immédiatement — attendre le prochain retry (quelques minutes) ou déclencher manuellement un nouveau commentaire.

[2026-05-14] | Checklist de diagnostic webhook ignorée — debug dans le désordre | Ordre de diagnostic quand le webhook ne répond plus : (1) railway logs | grep "GET\|POST /webhook" → est-ce que Meta envoie ? (2) ip du dernier appel → est-ce une IP Meta (173.252.x, 69.171.x, 66.220.x) ? (3) sig=present ou MISSING → Meta envoie-t-il une signature ? (4) SIG MISMATCH → vérification APP_SECRET + trim. (5) COMMENT/BODY logs → le corps est-il parsé ? (6) DM failed → problème API token IG.

[2026-05-20] | tasks/lessons.md non lu en début de session — DEBUG_SIG retiré du code sans que la signature soit vérifiée, cassant les DMs | TOUJOURS lire tasks/lessons.md en PREMIER avant toute modification. Ne JAMAIS retirer DEBUG_SIG tant que la signature HMAC n'est pas confirmée valide dans les logs (recv == expStr). L'ordre est : (1) corriger APP_SECRET dans Railway, (2) vérifier recv==expStr dans les logs, (3) seulement alors retirer DEBUG_SIG.

[2026-05-20] | Suggestion répétée de "changer l'app Meta" comme cause du mismatch de signature — piste fausse déjà réfutée | La cause du mismatch est toujours une corruption de APP_SECRET dans Railway (whitespace, guillemets). Ne jamais suggérer une piste sur la signature sans avoir d'abord relu lessons.md. La checklist du 2026-05-14 est exhaustive et suffit.

[2026-05-25] | Affiché le prix (25€) dans le bouton CTA et en sous-texte des emails de conversion | Le prix est une barrière à l'entrée. Ne JAMAIS faire apparaître de montant dans un email Psycœurlogie. Le prix est découvert uniquement sur la page de vente. CTAs sans prix : "Commencer les 21 jours →", "Parcourir les 21 jours →".

[2026-05-25] | Ajouté une temporalité à la garantie ("Garantie 7 jours", "après une semaine") | La garantie Psycœurlogie ne comporte aucune durée. Formuler toujours ainsi : "Satisfaite ou remboursée. Si tu ne te sens pas à ta place, écris-moi. Je te rembourse intégralement, sans question." Aucune fenêtre de temps mentionnée.

[2026-05-25] | Style d'écriture des emails de conversion trop "marketing" / insuffisamment ancré dans le ton Psycœurlogie | Toujours lire pa-email1.html et mg-email1.html avant de créer un template email. Le style Psycœurlogie est : intime, personnel, conversationnel, spirituel, phrases courtes, "je" omniprésent, fermeture avec "Bi idhni'llah" ou "Avec amour". Aucun pattern de liste salesy. Le style doit être identique sur TOUS les emails, séquences de vente comprises.

[2026-05-25] | Structure des emails de conversion non respectée | Toujours appliquer la stratégie des 4R + PS : Objet=FOMO, Preheader=suspens, R1=raconter le problème, R2=remuer les souffrances, R3=résoudre sans donner la solution, R4=faire rêver sur les bénéfices, CTA, PS=rejet doux ou urgence pour faire remonter le mail. Taille de texte 15px. Tutoiement systématique.

[2026-05-25] | Footer des mg-emails disait "Reset ton cœur" au lieu de "Reset ton corps" | Le mini-guide s'appelle "Reset ton corps avec la Sunnah". L'ebook s'appelle "Reset ton cœur". Ne jamais confondre. Footer mg-email1-5 et conv-h1/h2 : "mini-guide Reset ton corps". Footer pa-email1-5 : "Reset ton cœur" (correct — c'est l'ebook).

[2026-05-25] | Bloc garanties écrit à 14px au lieu de 15px | Tout le corps du texte des emails Psycœurlogie est à 15px — paragraphes ET blocs garanties. Seuls les logos, footers, PS (13px) et CTA buttons (14px) font exception. Vérifier systématiquement avant de valider un template. **RÈGLE REMPLACÉE le 2026-08-09, voir l'entrée du 09/08 : le corps passe à 17px.**

[2026-08-09] | Email de livraison écrit au standard de 15px, jugé trop petit à la lecture par Gent | Le corps des emails Psycœurlogie est désormais à **17px avec un interlignage de 30px**. Barème complet : corps et signature 17px (interlignage 30px, 28px pour bismillah et signature), citations 19px/30px, titre 32px, sur-titres 11px, bouton CTA 15px, notes sous CTA 14px, pied de page 12px. La règle des 15px du 2026-05-25 est caduque. Toujours rendre le template à 390px de large et le relire avant de le déclarer bon, la taille ne se juge pas dans le code.

[2026-08-09] | Prévu des compteurs d'occurrences faux avant un remplacement en masse sur un template email (3 règles sur 10 annonçaient le mauvais nombre) | Sur un remplacement en masse, ne jamais se fier au nombre attendu : faire le remplacement, puis RELIRE le résultat et vérifier l'état final réellement obtenu. Ajouter des assertions sur l'état final (présence du lien, absence de l'ancienne taille) avant de pousser vers Brevo.
