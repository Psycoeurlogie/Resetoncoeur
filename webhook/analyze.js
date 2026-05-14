// Usage: node --env-file=.env analyze.js
// Requires: IG_TOKEN + IG_USER_ID in .env

const TOKEN = process.env.IG_TOKEN
const USER_ID = process.env.IG_USER_ID

if (!TOKEN) throw new Error('IG_TOKEN manquant dans .env')
if (!USER_ID) throw new Error('IG_USER_ID manquant dans .env')

const BASE = 'https://graph.facebook.com/v21.0'

async function api(path) {
  const sep = path.includes('?') ? '&' : '?'
  const res = await fetch(`${BASE}${path}${sep}access_token=${TOKEN}`, {
    signal: AbortSignal.timeout(15000),
  })
  const data = await res.json()
  if (data.error) throw new Error(`${data.error.message} [code ${data.error.code}]`)
  return data
}

async function fetchAllMedia() {
  const posts = []
  let url = `${BASE}/${USER_ID}/media?fields=id,caption,media_type,timestamp,like_count,comments_count,permalink&limit=50&access_token=${TOKEN}`
  while (url && posts.length < 100) {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    const data = await res.json()
    if (data.error) { console.error('Media error:', data.error.message); break }
    posts.push(...(data.data ?? []))
    url = data.paging?.next ?? null
  }
  return posts
}

async function fetchMediaInsights(mediaId, mediaType) {
  try {
    const isVideo = ['VIDEO', 'REEL'].includes(mediaType)
    const metrics = isVideo
      ? 'reach,saved,shares,views,total_interactions'
      : 'reach,saved,total_interactions'
    const data = await api(`/${mediaId}/insights?metric=${metrics}`)
    const result = {}
    for (const m of data.data ?? []) {
      result[m.name] = m.values?.[0]?.value ?? m.value ?? 0
    }
    return result
  } catch {
    return {}
  }
}

async function fetchAccountInsights() {
  const since = Math.floor(Date.now() / 1000) - 30 * 86400
  const until = Math.floor(Date.now() / 1000)
  try {
    const data = await api(
      `/${USER_ID}/insights?metric=reach,profile_views,follower_count&period=day&since=${since}&until=${until}`
    )
    return data.data ?? []
  } catch (e) {
    console.error('Account insights error:', e.message)
    return []
  }
}

async function fetchAudience() {
  try {
    const data = await api(
      `/${USER_ID}/insights?metric=follower_demographics&period=lifetime&breakdown=age,gender,country,city`
    )
    const result = {}
    for (const m of data.data ?? []) result[m.name] = m.values?.[0]?.value
    return result
  } catch (e) {
    console.error('Audience error:', e.message)
    return {}
  }
}

async function fetchOnlineFollowers() {
  try {
    const data = await api(`/${USER_ID}/insights?metric=online_followers&period=lifetime`)
    const metric = data.data?.find(m => m.name === 'online_followers')
    return metric?.values?.[0]?.value ?? {}
  } catch (e) {
    console.error('Online followers error:', e.message)
    return {}
  }
}

function avg(arr) {
  return arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0
}

function bar(val, max, width = 20) {
  const filled = Math.round((val / max) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

async function main() {
  console.log('\n⏳ Récupération des données Instagram...\n')

  const [media, accountInsights, audience, onlineHours] = await Promise.all([
    fetchAllMedia(),
    fetchAccountInsights(),
    fetchAudience(),
    fetchOnlineFollowers(),
  ])

  process.stdout.write(`📸 ${media.length} posts trouvés — récupération des insights`)

  const postsWithInsights = []
  for (const post of media) {
    const insights = await fetchMediaInsights(post.id, post.media_type)
    postsWithInsights.push({ ...post, insights })
    process.stdout.write('.')
  }
  console.log(' ✓\n')

  // ── TOP POSTS ──────────────────────────────────────────────────────────────
  const byEngagement = [...postsWithInsights].sort(
    (a, b) => (b.insights.total_interactions || 0) - (a.insights.total_interactions || 0)
  )
  const bySaves = [...postsWithInsights].sort(
    (a, b) => (b.insights.saved || 0) - (a.insights.saved || 0)
  )
  const byReach = [...postsWithInsights].sort(
    (a, b) => (b.insights.reach || 0) - (a.insights.reach || 0)
  )

  console.log('══════════════════════════════════════════════')
  console.log('  TOP 5 — ENGAGEMENT (likes + comments + saves + shares)')
  console.log('══════════════════════════════════════════════')
  for (const p of byEngagement.slice(0, 5)) {
    const caption = (p.caption ?? '').slice(0, 70).replace(/\n/g, ' ')
    console.log(`  [${p.media_type.padEnd(9)}] ${p.timestamp.slice(0, 10)}`)
    console.log(`  📊 ${p.insights.total_interactions ?? 0} interactions | reach: ${p.insights.reach ?? 0} | saves: ${p.insights.saved ?? 0}`)
    if (caption) console.log(`  💬 "${caption}..."`)
    console.log(`  🔗 ${p.permalink}`)
    console.log()
  }

  console.log('══════════════════════════════════════════════')
  console.log('  TOP 5 — SAVES (intention d\'achat / valeur perçue)')
  console.log('══════════════════════════════════════════════')
  for (const p of bySaves.slice(0, 5)) {
    const caption = (p.caption ?? '').slice(0, 70).replace(/\n/g, ' ')
    console.log(`  [${p.media_type.padEnd(9)}] ${p.timestamp.slice(0, 10)} — ${p.insights.saved ?? 0} saves | reach: ${p.insights.reach ?? 0}`)
    if (caption) console.log(`  💬 "${caption}..."`)
    console.log()
  }

  console.log('══════════════════════════════════════════════')
  console.log('  TOP 5 — REACH (viralité)')
  console.log('══════════════════════════════════════════════')
  for (const p of byReach.slice(0, 5)) {
    const caption = (p.caption ?? '').slice(0, 70).replace(/\n/g, ' ')
    console.log(`  [${p.media_type.padEnd(9)}] ${p.timestamp.slice(0, 10)} — reach: ${(p.insights.reach ?? 0).toLocaleString()} | impressions: ${(p.insights.impressions ?? 0).toLocaleString()}`)
    if (caption) console.log(`  💬 "${caption}..."`)
    console.log()
  }

  // ── FORMAT BREAKDOWN ────────────────────────────────────────────────────────
  const typeStats = {}
  for (const p of postsWithInsights) {
    const t = p.media_type
    if (!typeStats[t]) typeStats[t] = { count: 0, engagements: [], reaches: [], saves: [] }
    typeStats[t].count++
    typeStats[t].engagements.push(p.insights.total_interactions || 0)
    typeStats[t].reaches.push(p.insights.reach || 0)
    typeStats[t].saves.push(p.insights.saved || 0)
  }

  const maxReach = Math.max(...Object.values(typeStats).map(s => avg(s.reaches)))
  console.log('══════════════════════════════════════════════')
  console.log('  PERFORMANCE PAR FORMAT')
  console.log('══════════════════════════════════════════════')
  for (const [type, s] of Object.entries(typeStats).sort((a, b) => avg(b[1].reaches) - avg(a[1].reaches))) {
    const r = avg(s.reaches)
    console.log(`  ${type.padEnd(12)} ${bar(r, maxReach)} reach moy: ${r.toLocaleString()} | engagement moy: ${avg(s.engagements)} | saves moy: ${avg(s.saves)} (${s.count} posts)`)
  }
  console.log()

  // ── MEILLEURS JOURS ─────────────────────────────────────────────────────────
  const dayStats = {}
  for (const p of postsWithInsights) {
    const d = new Date(p.timestamp).getDay()
    if (!dayStats[d]) dayStats[d] = { engagements: [], count: 0 }
    dayStats[d].engagements.push(p.insights.total_interactions || 0)
    dayStats[d].count++
  }

  const maxDayEng = Math.max(...Object.values(dayStats).map(s => avg(s.engagements)))
  console.log('══════════════════════════════════════════════')
  console.log('  MEILLEURS JOURS DE POST (par engagement moyen)')
  console.log('══════════════════════════════════════════════')
  for (const [d, s] of Object.entries(dayStats).sort((a, b) => avg(b[1].engagements) - avg(a[1].engagements))) {
    const e = avg(s.engagements)
    console.log(`  ${DAYS[d]}  ${bar(e, maxDayEng, 15)} ${e} eng moy (${s.count} posts)`)
  }
  console.log()

  // ── HEURES EN LIGNE ──────────────────────────────────────────────────────────
  const onlineEntries = Object.entries(onlineHours)
  if (onlineEntries.length) {
    const maxOnline = Math.max(...onlineEntries.map(([, v]) => v))
    const sorted = onlineEntries.sort((a, b) => b[1] - a[1])
    console.log('══════════════════════════════════════════════')
    console.log('  FOLLOWERS EN LIGNE PAR HEURE (top 8)')
    console.log('══════════════════════════════════════════════')
    for (const [hour, count] of sorted.slice(0, 8)) {
      console.log(`  ${String(hour).padStart(2, '0')}h  ${bar(count, maxOnline, 15)} ${count}`)
    }
    console.log()
  }

  // ── AUDIENCE ─────────────────────────────────────────────────────────────────
  if (audience.audience_gender_age) {
    console.log('══════════════════════════════════════════════')
    console.log('  DÉMOGRAPHIE (genre / âge)')
    console.log('══════════════════════════════════════════════')
    const total = Object.values(audience.audience_gender_age).reduce((s, v) => s + v, 0)
    const sorted = Object.entries(audience.audience_gender_age).sort((a, b) => b[1] - a[1])
    const maxV = sorted[0]?.[1] ?? 1
    for (const [k, v] of sorted.slice(0, 10)) {
      const pct = ((v / total) * 100).toFixed(1)
      console.log(`  ${k.padEnd(8)} ${bar(v, maxV, 15)} ${pct}%`)
    }
    console.log()
  }

  if (audience.audience_country) {
    console.log('══════════════════════════════════════════════')
    console.log('  TOP PAYS')
    console.log('══════════════════════════════════════════════')
    const sorted = Object.entries(audience.audience_country).sort((a, b) => b[1] - a[1])
    const total = sorted.reduce((s, [, v]) => s + v, 0)
    for (const [k, v] of sorted.slice(0, 5)) {
      console.log(`  ${k.padEnd(4)} ${((v / total) * 100).toFixed(1)}%  (${v})`)
    }
    console.log()
  }

  if (audience.audience_city) {
    console.log('══════════════════════════════════════════════')
    console.log('  TOP VILLES')
    console.log('══════════════════════════════════════════════')
    const sorted = Object.entries(audience.audience_city).sort((a, b) => b[1] - a[1])
    for (const [k, v] of sorted.slice(0, 5)) {
      console.log(`  ${k}: ${v}`)
    }
    console.log()
  }

  // ── TENDANCE 30J ─────────────────────────────────────────────────────────────
  if (accountInsights.length) {
    console.log('══════════════════════════════════════════════')
    console.log('  TENDANCE 30 JOURS')
    console.log('══════════════════════════════════════════════')
    for (const metric of accountInsights) {
      const total = (metric.values ?? []).reduce((s, v) => s + (v.value || 0), 0)
      const label = {
        reach: 'Reach total',
        impressions: 'Impressions totales',
        profile_views: 'Visites profil',
        follower_count: 'Variation followers',
      }[metric.name] ?? metric.name
      const prefix = metric.name === 'follower_count' && total > 0 ? '+' : ''
      console.log(`  ${label}: ${prefix}${total.toLocaleString()}`)
    }
    console.log()
  }

  // ── EXPORT JSON ───────────────────────────────────────────────────────────────
  const { writeFileSync } = await import('fs')
  const report = {
    generated: new Date().toISOString(),
    posts: postsWithInsights,
    accountInsights,
    audience,
    onlineHours,
    typeStats: Object.fromEntries(
      Object.entries(typeStats).map(([k, v]) => [k, {
        count: v.count,
        avgEngagement: avg(v.engagements),
        avgReach: avg(v.reaches),
        avgSaves: avg(v.saves),
      }])
    ),
  }
  writeFileSync('insights_report.json', JSON.stringify(report, null, 2))
  console.log('✅ Rapport complet exporté dans insights_report.json\n')
}

main().catch(e => {
  console.error('Erreur:', e.message)
  process.exit(1)
})
