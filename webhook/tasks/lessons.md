# Lessons — webhook psy.coeurlogie

[2026-05-14] | Suppression de DEBUG_SIG sans avoir résolu le SIG MISMATCH → DMs cassés immédiatement | Ne JAMAIS retirer DEBUG_SIG avant d'avoir confirmé que la signature HMAC passe correctement dans les logs (`recv=` == `expStr=`). Tester avec un commentaire réel avant de déployer.
