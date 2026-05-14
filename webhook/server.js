import express from 'express'
import crypto from 'crypto'
import rateLimit from 'express-rate-limit'

// Fail-closed: refuse to start if secrets are missing
if (!process.env.VERIFY_TOKEN) throw new Error('VERIFY_TOKEN env var is required')
if (!process.env.APP_SECRET) throw new Error('APP_SECRET env var is required')
if (!process.env.IG_TOKEN) throw new Error('IG_TOKEN env var is required')

const VERIFY_TOKEN = process.env.VERIFY_TOKEN
const APP_SECRET = process.env.APP_SECRET
const IG_ACCESS_TOKEN = process.env.IG_TOKEN
const DOWNLOAD_LINK = 'https://resetoncoeur.vercel.app/ig.html'
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
