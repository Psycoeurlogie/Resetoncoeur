#!/usr/bin/env node
// Usage: node --env-file=.env get-token.js
// Generates a fresh long-lived Instagram User Access Token via local OAuth flow.
//
// Before running:
//   1. In Meta App Dashboard → Paramètres de l'app → Basique
//      → "URI de redirection OAuth valides" : add  http://localhost:9000/callback
//   2. Run this script, open the printed URL in your browser (logged in as Majda)
//   3. Authorize → token printed in terminal → copy to .env as IG_TOKEN

import http from 'http'
import { exec } from 'child_process'

const APP_ID     = process.env.META_APP_ID || '1271378321813561'
const APP_SECRET = process.env.APP_SECRET
const PORT       = 9000
const REDIRECT   = `http://localhost:${PORT}/callback`

if (!APP_SECRET) {
  console.error('APP_SECRET manquant dans .env')
  process.exit(1)
}

const SCOPES = [
  'instagram_business_basic',
  'instagram_manage_insights',
].join(',')

const authUrl =
  `https://www.facebook.com/dialog/oauth` +
  `?client_id=${APP_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT)}` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&response_type=code`

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  if (url.pathname !== '/callback') { res.end(); return }

  const error = url.searchParams.get('error')
  if (error) {
    const desc = url.searchParams.get('error_description') ?? ''
    res.end(`<h2>Erreur: ${error}</h2><p>${desc}</p>`)
    console.error('OAuth error:', error, desc)
    server.close()
    return
  }

  const code = url.searchParams.get('code')
  if (!code) { res.end('Missing code'); server.close(); return }

  res.end('<h2>Autorisation reçue — retourne dans le terminal 👇</h2><p>Tu peux fermer cet onglet.</p>')

  try {
    // Step 1: exchange code → short-lived User token
    const tokenUrl = new URL('https://graph.facebook.com/oauth/access_token')
    tokenUrl.searchParams.set('client_id', APP_ID)
    tokenUrl.searchParams.set('client_secret', APP_SECRET)
    tokenUrl.searchParams.set('redirect_uri', REDIRECT)
    tokenUrl.searchParams.set('code', code)

    const tokenRes = await fetch(tokenUrl.toString())
    const tokenData = await tokenRes.json()
    if (tokenData.error) throw new Error(tokenData.error.message)
    const shortToken = tokenData.access_token

    console.log('\n✅ Token court-terme obtenu')

    // Step 2: exchange → long-lived token (60 days)
    const llUrl = new URL('https://graph.facebook.com/oauth/access_token')
    llUrl.searchParams.set('grant_type', 'fb_exchange_token')
    llUrl.searchParams.set('client_id', APP_ID)
    llUrl.searchParams.set('client_secret', APP_SECRET)
    llUrl.searchParams.set('fb_exchange_token', shortToken)

    const llRes = await fetch(llUrl.toString())
    const llData = await llRes.json()
    if (llData.error) throw new Error(llData.error.message)

    const expiresDays = Math.round((llData.expires_in ?? 0) / 86400)

    console.log('\n════════════════════════════════════════')
    console.log('  NOUVEAU TOKEN LONG-TERME (60 jours)')
    console.log('════════════════════════════════════════')
    console.log(llData.access_token)
    console.log(`\n  Expire dans : ~${expiresDays} jours`)
    console.log('\n  → Copie ce token dans webhook/.env :')
    console.log(`  IG_TOKEN=${llData.access_token}`)
    console.log('════════════════════════════════════════\n')

  } catch (err) {
    console.error('\nErreur lors de l\'échange de token:', err.message)
  }

  server.close()
})

server.listen(PORT, () => {
  console.log('\n══════════════════════════════════════════════════════')
  console.log('  GÉNÉRATEUR DE TOKEN INSTAGRAM')
  console.log('══════════════════════════════════════════════════════')
  console.log('\n  ÉTAPE PRÉALABLE (une seule fois) :')
  console.log('  Dans Meta App Dashboard → Paramètres de l\'app → Basique')
  console.log('  → Section "Paramètres avancés" ou "Facebook Login"')
  console.log('  → Ajouter aux "URI de redirection OAuth valides" :')
  console.log(`  http://localhost:${PORT}/callback`)
  console.log('\n  Puis ouvre cette URL dans ton navigateur (connectée en tant que Majda) :')
  console.log('\n  ' + authUrl)
  console.log('\n══════════════════════════════════════════════════════\n')

  // Try to open the browser automatically
  exec(`open "${authUrl}"`, () => {})
})
