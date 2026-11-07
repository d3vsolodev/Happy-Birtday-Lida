// Vercel serverless function: POST /api/wish
// Receives the wish Lida types on the site, then
//   1) stores it as a new Issue in YOUR private GitHub repo (storage + GitHub notification)
//   2) optionally pings you on Telegram right away
// All secrets live in Vercel Environment Variables, never in the website code.

const MAX_WISH = 300
const RATE_LIMIT = 10 // wishes per IP per hour (best effort, resets when the function restarts)
const hits = new Map()

const clientIp = (req) =>
    String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()

const rateLimited = (ip) => {
    const now = Date.now()
    const recent = (hits.get(ip) || []).filter((t) => now - t < 3600_000)
    recent.push(now)
    hits.set(ip, recent)
    return recent.length > RATE_LIMIT
}

// only accept requests coming from this same site (or ALLOWED_ORIGIN)
const originAllowed = (req) => {
    const origin = req.headers.origin
    if (!origin) return true // same-origin requests may omit it
    try {
        const host = new URL(origin).host
        if (host === req.headers.host) return true
        if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) return true
        const extra = (process.env.ALLOWED_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean)
        return extra.some((o) => o === origin || o === host)
    } catch {
        return false
    }
}

const readBody = (req) => {
    if (req.body && typeof req.body === 'object') return req.body
    try {
        return JSON.parse(req.body || '{}')
    } catch {
        return {}
    }
}

const saveToGitHub = async ({ token, repo, wish, when }) => {
    const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
            'User-Agent': 'lida-birthday-wishes',
        },
        body: JSON.stringify({
            title: `💫 Lida's wish (${when.slice(0, 10)})`,
            body: `> ${wish.replace(/\n/g, '\n> ')}\n\n_Sent: ${when}_`,
            labels: ['wish'],
        }),
    })
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`)
    return true
}

const pingTelegram = async ({ token, chatId, wish }) => {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: `💫 Lida made a wish:\n\n${wish}` }),
    })
    if (!res.ok) throw new Error(`Telegram responded ${res.status}`)
    return true
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).json({ ok: false, error: 'Method not allowed' })
    }
    if (!originAllowed(req)) return res.status(403).json({ ok: false, error: 'Forbidden' })

    const body = readBody(req)

    // honeypot: bots fill the hidden field. Pretend it worked, store nothing.
    if (body.website) return res.status(200).json({ ok: true })

    const wish = String(body.wish || '').trim().slice(0, MAX_WISH)
    if (!wish) return res.status(400).json({ ok: false, error: 'Please write a wish first' })

    if (rateLimited(clientIp(req))) return res.status(429).json({ ok: false, error: 'Too many wishes, try again later' })

    const { GITHUB_TOKEN, GITHUB_REPO, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env
    const when = new Date().toISOString()

    const jobs = []
    if (GITHUB_TOKEN && GITHUB_REPO) jobs.push(saveToGitHub({ token: GITHUB_TOKEN, repo: GITHUB_REPO, wish, when }))
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) jobs.push(pingTelegram({ token: TELEGRAM_BOT_TOKEN, chatId: TELEGRAM_CHAT_ID, wish }))

    if (jobs.length === 0) {
        console.error('wish API: no GITHUB_TOKEN/GITHUB_REPO or TELEGRAM settings configured')
        return res.status(500).json({ ok: false, error: 'Server is not configured yet' })
    }

    const results = await Promise.allSettled(jobs)
    results.filter((r) => r.status === 'rejected').forEach((r) => console.error('wish API:', r.reason?.message))

    // success if at least one channel (GitHub or Telegram) received it
    if (results.some((r) => r.status === 'fulfilled')) return res.status(200).json({ ok: true })
    return res.status(502).json({ ok: false, error: 'Could not deliver the wish' })
}
