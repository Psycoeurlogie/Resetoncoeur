import express from 'express'
import crypto from 'crypto'
import rateLimit from 'express-rate-limit'

// Fail-closed: refuse to start if secrets are missing
if (!process.env.VERIFY_TOKEN) throw new Error('VERIFY_TOKEN env var is required')
if (!process.env.APP_SECRET) throw new Error('APP_SECRET env var is required')
if (!process.env.IG_TOKEN) throw new Error('IG_TOKEN env var is required')
console.log(`APP_SECRET loaded: len=${process.env.APP_SECRET?.trim().length}`)

const VERIFY_TOKEN = process.env.VERIFY_TOKEN
const APP_SECRET = process.env.APP_SECRET?.trim()
const IG_ACCESS_TOKEN = process.env.IG_TOKEN
const IG_USER_ID = process.env.IG_USER_ID || '17841480078629028'
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
app.set('trust proxy', 1)

app.use('/webhook', rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false }))

app.use('/webhook', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} /webhook sig=${req.headers['x-hub-signature-256'] ? 'present' : 'MISSING'} ip=${req.ip}`)
  next()
})

// Signature verification — fail-closed (403 if missing or invalid)
// TODO: remove DEBUG_SIG once APP_SECRET mismatch is resolved (see tasks/lessons.md)
app.use(express.json({
  verify(req, res, buf) {
    const sig = req.headers['x-hub-signature-256']
    const expStr = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(buf).digest('hex')
    console.log('SIG check: present=' + !!sig + ' bodyLen=' + buf.length)
    if (process.env.DEBUG_SIG === '1') return
    if (!sig) {
      const err = new Error('Missing signature')
      err.status = 403
      throw err
    }
    const sigBuf = Buffer.from(sig)
    const expBuf = Buffer.from(expStr)
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      const err = new Error('Invalid signature')
      err.status = 403
      throw err
    }
  }
}))

app.use((err, req, res, next) => {
  if (err.status === 403) {
    console.error('403 rejected:', err.message, 'ip:', req.ip)
    return res.sendStatus(403)
  }
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

      // --- NEW FOLLOWER → WELCOME DM ---
      if (change.field === 'follow') {
        const followerId = change.value?.from?.id
        if (typeof followerId !== 'string' || !/^\d{1,30}$/.test(followerId)) continue
        const dedupKey = `follow:${followerId}`
        if (await dedup.seen(dedupKey)) {
          console.log(`Duplicate follow ${followerId.slice(0, 4)}*** — skipped`)
          continue
        }
        await dedup.mark(dedupKey, 30 * 86_400)
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
          text: `As-salamu 'alaykum 🌙\n\nJ'ai vu ton commentaire et ça m'a touchée 🤍\n\nSi ce post te parle, c'est déjà un signe. Je ne sais pas où tu en es dans ton chemin, mais je peux peut-être t'aider à y voir plus clair, bi idhni'Allah ✨\n\nJe t'ai préparé un petit guide gratuit, juste pour t'accompagner doucement là où tu en es.\n\n👇🏼\n${DOWNLOAD_LINK}\n\nQu'Allah te facilite et mette du khayr dans ta démarche 🤍`,
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
  const WELCOME_LINK = 'https://resetoncoeur.vercel.app/mini-guide.html'
  try {
    const response = await fetch('https://graph.instagram.com/v21.0/me/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: userId },
        message: {
          text: `As-salamu 'alaykum 🌙\n\nTu viens de faire un premier pas — et ce n'est pas un hasard 🤍\n\nIl y a une chose que j'aurais aimé qu'on me dise quand j'ai commencé à me reconnecter à la Sunnah. Je te l'ai mise dans ce guide gratuit, fait pour celles qui ont décidé de ne plus attendre.\n\nOuvre-le ce soir 👇🏼\n${WELCOME_LINK}\n\nQu'Allah mette du barakah dans ta démarche 🤍\nMajda`,
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
