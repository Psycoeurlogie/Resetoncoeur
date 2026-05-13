import express from 'express'
import crypto from 'crypto'
import rateLimit from 'express-rate-limit'
import cron from 'node-cron'

// Fail-closed: refuse to start if secrets are missing
if (!process.env.VERIFY_TOKEN) throw new Error('VERIFY_TOKEN env var is required')
if (!process.env.APP_SECRET) throw new Error('APP_SECRET env var is required')
if (!process.env.IG_TOKEN) throw new Error('IG_TOKEN env var is required')

const VERIFY_TOKEN = process.env.VERIFY_TOKEN
const APP_SECRET = process.env.APP_SECRET
const IG_ACCESS_TOKEN = process.env.IG_TOKEN
const DOWNLOAD_LINK = 'https://resetoncoeur.vercel.app/mini-guide.html'
const KEYWORDS = ['sunnah', 'baraka']
const PORT = process.env.PORT || 3000

// Deduplication: Upstash Redis if configured, in-memory fallback
let dedup
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const { Redis } = await import('@upstash/redis')
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  dedup = {
    async seen(id) { return !!(await redis.get(`dedup:${id}`)) },
    async mark(id, ttl = 86400) { await redis.set(`dedup:${id}`, 1, { ex: ttl }) },
  }
  console.log('Deduplication: Upstash Redis')
} else {
  console.warn('UPSTASH_REDIS_REST_URL not set — using in-memory deduplication (resets on restart)')
  const store = new Map()
  dedup = {
    async seen(id) { return store.has(id) },
    async mark(id, ttl = 86400) {
      store.set(id, true)
      setTimeout(() => store.delete(id), ttl * 1000)
    },
  }
}

const app = express()

app.use('/webhook', rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false }))

// Signature verification — fail-closed (403 if missing or invalid)
app.use(express.json({
  verify(req, res, buf) {
    const sig = req.headers['x-hub-signature-256']
    if (!sig) {
      const err = new Error('Missing signature')
      err.status = 403
      throw err
    }
    const expected = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(buf).digest('hex')
    const sigBuf = Buffer.from(sig)
    const expBuf = Buffer.from(expected)
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      const err = new Error('Invalid signature')
      err.status = 403
      throw err
    }
  }
}))

app.use((err, req, res, next) => {
  if (err.status === 403) return res.sendStatus(403)
  next(err)
})

app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }))

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  } else {
    res.sendStatus(403)
  }
})

app.post('/webhook', async (req, res) => {
  res.sendStatus(200)
  const entries = req.body?.entry ?? []
  for (const entry of entries) {
    for (const change of entry.changes ?? []) {

      // --- COMMENTS TO DM ---
      if (change.field === 'comments') {
        const commentId = change.value?.id
        const senderId = change.value?.from?.id
        const text = change.value?.text ?? ''
        if (typeof senderId !== 'string' || !/^\d{1,30}$/.test(senderId)) continue
        const matched = KEYWORDS.find(k => text.toLowerCase().includes(k))
        if (!matched) continue
        if (commentId && await dedup.seen(commentId)) {
          console.log(`Duplicate event ${commentId} — skipped`)
          continue
        }
        if (commentId) await dedup.mark(commentId)
        console.log(`Keyword "${matched}" — sending DM to ${senderId.slice(0, 4)}***`)
        await sendDM(senderId)
      }

      // --- NEW FOLLOWER WELCOME DM ---
      if (change.field === 'follow') {
        const followerId = change.value?.from?.id
        if (typeof followerId !== 'string' || !/^\d{1,30}$/.test(followerId)) continue
        const dedupKey = `follow:${followerId}`
        if (await dedup.seen(dedupKey)) {
          console.log(`Duplicate follow ${followerId.slice(0, 4)}*** — skipped`)
          continue
        }
        await dedup.mark(dedupKey, 30 * 86_400) // 30 jours TTL
        console.log(`New follower ${followerId.slice(0, 4)}*** — sending welcome DM`)
        await sendFollowerWelcomeDM(followerId)
      }

    }
  }
})

async function sendDM(userId) {
  try {
    const response = await fetch('https://graph.instagram.com/v21.0/me/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: userId },
        message: {
          text: `As-salamu 'alaykum 🌙\n\nQu'Allah te facilite et mette du khayr dans ta démarche 🤍\n\nSi tu es ici, c'est que tu as commenté SUNNAH et c'est que ce sujet te parle... et je peux t'aider à y voir plus clair, bi idhni'Allah ✨\n\nClique ci-dessous pour télécharger ton mini guide gratuit 👇🏼\n${DOWNLOAD_LINK}`,
        },
        access_token: IG_ACCESS_TOKEN,
      }),
      signal: AbortSignal.timeout(10000),
    })
    const data = await response.json()
    if (data.error) console.error('DM failed:', data.error.code, data.error.message)
    else console.log('DM sent')
  } catch (err) {
    console.error('sendDM error:', err.message)
  }
}

async function sendFollowerWelcomeDM(userId) {
  try {
    const response = await fetch('https://graph.instagram.com/v21.0/me/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: userId },
        message: {
          text: `As-salamu 'alaykum 🌙\n\nBienvenue dans la communauté Reset ton cœur 🤍\n\nJe suis vraiment contente de te voir ici. Ça veut dire que quelque chose en toi cherche à revenir — à toi-même, à Allah, à ce qui compte vraiment.\n\nPour te souhaiter la bienvenue, je t'offre mon mini-guide gratuit ✨\n7 jours pour réaligner ton corps et ton âme avec la Sunnah — concret, doux, et ancré dans ce qui plaît à Allah.\n\nClique ici pour le recevoir 👇🏼\n${DOWNLOAD_LINK}\n\nQu'Allah te facilite et mette du barakah dans ta démarche 🤍\nMajda`,
        },
        access_token: IG_ACCESS_TOKEN,
      }),
      signal: AbortSignal.timeout(10000),
    })
    const data = await response.json()
    if (data.error) console.error('Welcome DM failed:', data.error.code, data.error.message)
    else console.log('Welcome DM sent')
  } catch (err) {
    console.error('sendFollowerWelcomeDM error:', err.message)
  }
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// --- FOLLOWER POLLING (toutes les 15 min) ---
const IG_USER_ID = process.env.IG_USER_ID  // ID numérique du compte Instagram ex: 17841480078629028

async function pollNewFollowers() {
  if (!IG_USER_ID) {
    console.warn('IG_USER_ID not set — follower polling disabled')
    return
  }
  try {
    let url = `https://graph.instagram.com/v21.0/${IG_USER_ID}/followers?fields=id&limit=50&access_token=${IG_ACCESS_TOKEN}`
    const newFollowers = []

    // On parcourt jusqu'à trouver un follower déjà connu (arrêt anticipé)
    while (url) {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
      const data = await res.json()
      if (data.error) {
        console.error('Follower poll error:', data.error.code, data.error.message)
        return
      }
      let hitKnown = false
      for (const user of data.data ?? []) {
        const key = `known_follower:${user.id}`
        if (await dedup.seen(key)) { hitKnown = true; break }
        newFollowers.push(user.id)
      }
      url = (!hitKnown && data.paging?.next) ? data.paging.next : null
    }

    // Marquer tous les followers comme connus (TTL 90 jours)
    for (const id of newFollowers) {
      await dedup.mark(`known_follower:${id}`, 90 * 86400)
    }

    if (newFollowers.length > 0) {
      console.log(`Follower poll: ${newFollowers.length} new follower(s) detected`)
      for (const id of newFollowers) {
        const dmKey = `follow:${id}`
        if (await dedup.seen(dmKey)) continue
        await dedup.mark(dmKey, 30 * 86400)
        console.log(`New follower ${id.slice(0, 4)}*** — sending welcome DM`)
        await sendFollowerWelcomeDM(id)
      }
    } else {
      console.log('Follower poll: no new followers')
    }
  } catch (err) {
    console.error('pollNewFollowers error:', err.message)
  }
}

// Initialisation : marquer tous les followers actuels comme connus (sans envoyer de DM)
async function seedKnownFollowers() {
  if (!IG_USER_ID) return
  try {
    let url = `https://graph.instagram.com/v21.0/${IG_USER_ID}/followers?fields=id&limit=200&access_token=${IG_ACCESS_TOKEN}`
    let count = 0
    while (url) {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
      const data = await res.json()
      if (data.error) {
        console.error('Seed followers error:', data.error.code, data.error.message)
        return
      }
      for (const user of data.data ?? []) {
        const key = `known_follower:${user.id}`
        if (!(await dedup.seen(key))) {
          await dedup.mark(key, 90 * 86400)
          count++
        }
      }
      url = data.paging?.next ?? null
    }
    console.log(`Seed complete: ${count} existing followers marked as known`)
  } catch (err) {
    console.error('seedKnownFollowers error:', err.message)
  }
}

// Au démarrage : seed des followers existants, puis polling toutes les 15 min
if (IG_USER_ID) {
  seedKnownFollowers()
  cron.schedule('*/15 * * * *', pollNewFollowers)
  console.log('Follower polling: active (every 15 min)')
}
