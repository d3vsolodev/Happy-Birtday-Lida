// Quick offline test of api/wish.js (GitHub + Telegram are mocked). Run: npm run test:api
import assert from 'node:assert/strict'
import handler from '../api/wish.js'

const calls = []
globalThis.fetch = async (url, opts) => {
    calls.push({ url: String(url), opts })
    return { ok: true, status: 201 }
}

const run = async ({ method = 'POST', body = {}, headers = {} } = {}) => {
    let status = 0
    let json = null
    const res = {
        setHeader() {},
        status(s) { status = s; return this },
        json(j) { json = j; return this },
    }
    await handler({ method, body, headers: { host: 'site.vercel.app', ...headers }, socket: { remoteAddress: '1.1.1.1' } }, res)
    return { status, json }
}

process.env.GITHUB_TOKEN = 't'
process.env.GITHUB_REPO = 'TH3AN/lida-wishes'
process.env.TELEGRAM_BOT_TOKEN = 'b'
process.env.TELEGRAM_CHAT_ID = '123'

let r = await run({ body: { wish: 'I wish for a happy year' } })
assert.equal(r.status, 200); assert.equal(calls.length, 2)
assert.ok(calls[0].url.includes('api.github.com/repos/TH3AN/lida-wishes/issues'))
assert.ok(calls[1].url.includes('api.telegram.org/botb/sendMessage'))
assert.equal(calls[0].opts.headers.Authorization, 'Bearer t')

r = await run({ body: { wish: '   ' } }); assert.equal(r.status, 400)
r = await run({ method: 'GET' }); assert.equal(r.status, 405)
r = await run({ body: { wish: 'x' }, headers: { origin: 'https://evil.example' } }); assert.equal(r.status, 403)

const before = calls.length
r = await run({ body: { wish: 'bot', website: 'spam' } }); assert.equal(r.status, 200); assert.equal(calls.length, before)

r = await run({ body: { wish: 'a'.repeat(1000) } }); assert.equal(r.status, 200)
assert.ok(JSON.parse(calls.at(-2).opts.body).body.length < 400, 'wish is trimmed to 300 chars')

// GitHub fails, Telegram still delivers -> ok
globalThis.fetch = async (url) => (String(url).includes('github') ? { ok: false, status: 500 } : { ok: true, status: 200 })
r = await run({ body: { wish: 'one channel is enough' } }); assert.equal(r.status, 200)
// both fail -> error
globalThis.fetch = async () => ({ ok: false, status: 500 })
r = await run({ body: { wish: 'both down' } }); assert.equal(r.status, 502)
// not configured
delete process.env.GITHUB_TOKEN; delete process.env.TELEGRAM_BOT_TOKEN
r = await run({ body: { wish: 'no config' } }); assert.equal(r.status, 500)

console.log('wish API: all checks passed ✅')
