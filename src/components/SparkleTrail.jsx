import { useEffect } from 'react'

// Tiny cute sparkles that follow the cursor / finger
const SparkleTrail = () => {
    useEffect(() => {
        let last = 0
        const glyphs = ['✦', '✿', '♡', '✧']
        const spawn = (x, y) => {
            const now = performance.now()
            if (now - last < 55) return
            last = now
            const el = document.createElement('span')
            el.className = 'sparkle-trail'
            el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)]
            el.style.left = `${x}px`
            el.style.top = `${y}px`
            el.style.setProperty('--dx', `${(Math.random() - 0.5) * 40}px`)
            el.style.fontSize = `${10 + Math.random() * 10}px`
            document.body.appendChild(el)
            setTimeout(() => el.remove(), 900)
        }
        const onMove = (e) => spawn(e.clientX, e.clientY)
        const onTouch = (e) => {
            const t = e.touches[0]
            if (t) spawn(t.clientX, t.clientY)
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('touchmove', onTouch, { passive: true })
        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('touchmove', onTouch)
        }
    }, [])
    return null
}

export default SparkleTrail
