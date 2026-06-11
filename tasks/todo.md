# To-Do — Psycœurlogie / Reset ton cœur
*Mis à jour le 11 juin 2026*

## CHANTIER 4 — DESIGN V2 « ÉDITORIAL IMMERSIF » (site entier)
**Statut : ebook.html EN PROD ✅ (11 juin) — reste l'harmonisation du site**

Process validé : maquette sur branche `design-v2` → URL preview Vercel → validation mobile ensemble → merge. **Jamais de changement design sans validation.**

- [x] ebook.html — design v2 déployé (hero typo monumentale, galerie pages scroll-snap, bento prix 80€ vs 25€, buybar flottante, GA4 begin_checkout, mobile-first)
- [ ] **Harmoniser le reste du site sur le design v2** : index.html, quiz.html, mini-guide.html, manifesto.html, contact.html, merci.html (+ styles.css partagé à refondre)
- [ ] Corrections critiques (peuvent se faire avant/pendant l'harmonisation) :
  - [ ] Formulaire newsletter index.html MORT (alert placeholder) → brancher sibforms Brevo
  - [ ] Burger mobile absent sur 5 pages (nav inutilisable sur mobile)
  - [ ] GA4 events sur tout le funnel (quiz, mini-guide, clics Stripe hors ebook)
  - [ ] Témoignages placeholder "À venir" sur index → réutiliser les 3 témoignages réels
  - [ ] Prix 25€ absent du bloc produit vedette sur index
- [ ] Photographie authentique sans visage (mains, tasbih, lumière, carnet) — dépend de Majda

---

## CHANTIER 1 — WEBHOOK (Instagram DMs automatisés)
**Statut : TERMINÉ ✅**

---

## CHANTIER 2 — SÉQUENCE EMAIL BREVO
**Statut : TERMINÉ ✅ — séquence active (J+0/J+2/J+4/J+6/J+8)**

---

## CHANTIER 3 — STRATÉGIE PRODUITS
**Statut : STRATÉGIE DÉFINIE — exécution à lancer**

### Actions immédiates (cette semaine)
- [x] Passer l'e-book Reset ton cœur à **25€** (était 17€)
- [x] Page de vente dédiée : `ebook.html` — prix non affiché (frein psychologique intentionnel)
- [x] Séquence email post-achat créée (pa-email1 à pa-email5 : J+0 / J+3 / J+7 / J+14 / J+21)
  - pa-email4 et pa-email5 : **remplacer `[LIEN_WAITLIST_TAZKIYA]`** quand la liste est créée dans Brevo
  - Configurer le trigger Stripe → Brevo (webhook ou Zapier) pour déclencher la séquence à l'achat

### Court terme (mai - juin 2026)
- [x] Définir la structure des 7 modules de **Tazkiya Progressive** → `/strategie/tazkiya-progressive-modules.md`
- [ ] Ouvrir beta fermée Tazkiya Progressive : 10-15 femmes à 97€
- [x] Lancer stratégie de contenu Instagram Phase 1 → `/strategie/instagram-phase1-contenu.md`
  - 16 posts prêts (captions + scripts Reels) · 4 semaines · 19 mai → 14 juin 2026
  - [ ] Créer les visuels (templates carousel + citations)
  - [ ] Story highlight "Les 5 profils" avant le 19 mai

### Moyen terme (juillet - septembre 2026)
- [ ] Enregistrer les 7 modules vidéo pendant la beta
- [ ] Collecter 10+ témoignages de la beta
- [ ] Lancer Tazkiya Progressive au prix définitif : **197€**
- [ ] Atteindre 500 abonnés email actifs

### Long terme (jan - fév 2027)
- [ ] Lancer **Sakina** (high ticket 1 200€) après 20 témoignages Tazkiya Progressive
- [ ] 4-6 places max, entretien de sélection obligatoire, jamais en vente publique

---

## FICHIERS CLÉS
- Stratégie complète : `/strategie/strategie-produits-2026.md`
