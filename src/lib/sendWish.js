// Sends Lida's wish to the backend (api/wish.js on Vercel).
// Returns true when the wish was delivered, false otherwise.
export async function sendWish(wish, honeypot = '') {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
        const res = await fetch('/api/wish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wish, website: honeypot }),
            signal: controller.signal,
        })
        return res.ok
    } catch {
        return false
    } finally {
        clearTimeout(timer)
    }
}
