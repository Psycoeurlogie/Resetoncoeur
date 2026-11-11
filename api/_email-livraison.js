// E-mail de livraison envoyé juste après un paiement (voir /api/stripe-webhook).
// Gabarit repris de email-templates/bl-email1.html, barème du 2026-08-09 (corps 17px / 30px,
// bouton 15px, notes 14px, pied 12px). Aucun prix, aucune donnée de la cliente dans le HTML.

import { LIENS, TITRES } from './_livres.js';

function bouton(produit, libelle) {
  return `
            <tr>
              <td align="center" style="padding:0 16px 14px;">
                <table border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" bgcolor="#5c2a2f" style="border-radius:100px;">
                      <a href="${LIENS[produit]}" style="display:inline-block;padding:15px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#f7f1ea;text-decoration:none;letter-spacing:0.03em;white-space:nowrap;">
                        ${libelle} &#8594;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;
}

export function construireEmail(produits) {
  const deux = produits.length > 1;
  const sujet = deux ? 'Tes deux livres sont là' : `Ton livre est là : ${TITRES[produits[0]]}`;
  const surTitre = deux ? 'Tes deux livres' : 'Ton livre';
  const titre = deux ? 'Le parcours complet' : TITRES[produits[0]];

  const boutons = deux
    ? bouton('racines', 'Télécharger Les racines') + bouton('base', 'Télécharger Reset ton cœur')
    : bouton(produits[0], 'Télécharger mon livre');

  const liensTexte = produits.map((p) => `${TITRES[p]} : ${LIENS[p]}`).join('\n');

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${sujet}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background: #f7f1ea; }
    @media only screen and (max-width: 600px) {
      table[class=full] { width: 100% !important; }
      td[class=mobile-pad] { padding: 0 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f7f1ea;">
<table width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f7f1ea">
  <tr><td>
    <table class="full" align="center" width="560" border="0" cellpadding="0" cellspacing="0">
      <tr><td height="40"></td></tr>
      <tr>
        <td align="center" style="padding:0 24px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#5c2a2f;letter-spacing:0.04em;">
          Psyc&#339;urlogie
        </td>
      </tr>
      <tr><td height="8"></td></tr>
      <tr>
        <td align="center">
          <table width="40" border="0" cellpadding="0" cellspacing="0"><tr><td height="1" bgcolor="#d4a5a0"></td></tr></table>
        </td>
      </tr>
      <tr><td height="40"></td></tr>
      <tr>
        <td align="center" style="padding:0 20px;">
          <table class="full" width="520" border="0" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="border-radius:12px;border:1px solid #ede4d8;">
            <tr><td height="48"></td></tr>
            <tr>
              <td class="mobile-pad" align="center" style="padding:0 48px;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#b07a74;letter-spacing:0.2em;text-transform:uppercase;">${surTitre}</p>
                <p style="margin:16px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:32px;color:#3d1c20;line-height:1.25;">${titre}</p>
              </td>
            </tr>
            <tr><td height="32"></td></tr>
            <tr>
              <td class="mobile-pad" style="padding:0 48px;">
                <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:17px;color:#5a4a4c;line-height:28px;font-style:italic;">Bismillah,</p>
                <p style="margin:0 0 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:17px;color:#2a1d1f;line-height:30px;">
                  Ton paiement est bien confirm&#233;. ${deux ? 'Tes deux livres sont l&#224;, ils t\'attendent.' : 'Ton livre est l&#224;, il t\'attend.'}
                </p>
                <p style="margin:0 0 32px 0;font-family:Arial,Helvetica,sans-serif;font-size:17px;color:#2a1d1f;line-height:30px;">
                  Lis &#224; ton rythme. Il n'y a pas de bon moment pour commencer, il y a le moment o&#249; ton c&#339;ur en a besoin.
                </p>
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:17px;color:#5a4a4c;line-height:28px;">
                  Avec douceur,<br/><strong style="color:#5c2a2f;">Psyc&#339;urlogie</strong>
                </p>
              </td>
            </tr>
            <tr><td height="36"></td></tr>
${boutons}
            <tr><td height="8"></td></tr>
            <tr>
              <td class="mobile-pad" align="center" style="padding:0 48px;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#5a4a4c;line-height:22px;">
                  Si le t&#233;l&#233;chargement ne d&#233;marre pas, ouvre le lien dans Safari ou Chrome plut&#244;t que dans Instagram. Garde cet e-mail&#160;: le lien reste valable. Un souci&#160;? R&#233;ponds simplement &#224; ce message.
                </p>
              </td>
            </tr>
            <tr><td height="48"></td></tr>
          </table>
        </td>
      </tr>
      <tr><td height="32"></td></tr>
      <tr>
        <td align="center" style="padding:0 24px;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#5a4a4c;line-height:22px;">
            Tu re&#231;ois cet e-mail suite &#224; ton achat sur resetoncoeur.fr.
          </p>
        </td>
      </tr>
      <tr><td height="40"></td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const texte = `Bismillah,

Ton paiement est bien confirmé. ${deux ? "Tes deux livres sont là, ils t'attendent." : "Ton livre est là, il t'attend."}

${liensTexte}

Si le téléchargement ne démarre pas, ouvre le lien dans Safari ou Chrome plutôt que dans Instagram. Un souci ? Réponds simplement à ce message.

Avec douceur,
Psycœurlogie`;

  return { sujet, html, texte };
}
