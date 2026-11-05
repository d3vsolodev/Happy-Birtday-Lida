import React, { useMemo, useState } from 'react'
import { Link } from 'react-router'
import FloatingPetals from '../components/FloatingPetals'
import '../Extras.css'

const BIRTH_MONTH = 10 // November (0-based)
const BIRTH_DAY = 21

const getCountdown = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let next = new Date(now.getFullYear(), BIRTH_MONTH, BIRTH_DAY)
    if (next < today) next = new Date(now.getFullYear() + 1, BIRTH_MONTH, BIRTH_DAY)
    return Math.round((next - today) / 86400000)
}

const WishPage = () => {
    const [blown, setBlown] = useState(false)
    const [wish, setWish] = useState('')
    const [sent, setSent] = useState(false)
    const [tilt, setTilt] = useState({ x: 14, y: -8 })
    const days = useMemo(getCountdown, [])

    const blow = () => {
        if (blown) return
        setBlown(true)
        const fire = (o) =>
            window.confetti?.({
                origin: { y: 0.65 },
                colors: ['#ff6f9c', '#ffd1de', '#ffffff', '#ffc83d', '#b9a2ff'],
                ...o,
            })
        fire({ particleCount: 120, spread: 90 })
        setTimeout(() => fire({ particleCount: 80, spread: 120, scalar: 1.2 }), 350)
    }

    const relight = () => {
        setBlown(false)
        setSent(false)
        setWish('')
    }

    const onMove = (e) => {
        const r = e.currentTarget.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        setTilt({ x: 14 - py * 16, y: px * 28 })
    }

    return (
        <main className="extra-page wish-page">
            <FloatingPetals count={18} />

            <header className="extra-head">
                <span className="extra-kicker">
                    {days === 0 ? '🎉 Today is your day!' : `${days} day${days === 1 ? '' : 's'} until 21 November`}
                </span>
                <h1 className="extra-title">Make a Wish, Lida</h1>
            </header>

            <div className="cake-stage" onMouseMove={onMove} onMouseLeave={() => setTilt({ x: 14, y: -8 })}>
                <div className="bd-cake" style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }} onClick={blow}>
                    <div className="candles">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="candle" style={{ '--i': i }}>
                                <span className={`flame ${blown ? 'out' : ''}`} />
                                <span className={`smoke ${blown ? 'show' : ''}`} />
                                <span className="wax" />
                            </div>
                        ))}
                    </div>
                    <div className="tier tier-top"><i className="drip" /></div>
                    <div className="tier tier-mid"><i className="drip" /></div>
                    <div className="tier tier-bot"><i className="drip" /></div>
                    <div className="plate" />
                    <span className="cake-heart">♡</span>
                </div>
            </div>

            {!blown ? (
                <div className="extra-actions">
                    <button className="extra-btn" onClick={blow}>💨 Blow out the candles</button>
                    <Link className="extra-btn ghost" to="/">← Back</Link>
                </div>
            ) : (
                <div className="wish-panel">
                    {!sent ? (
                        <>
                            <p className="wish-title">Close your eyes and make a wish ✨</p>
                            <p className="wish-sub">Type it here. It goes straight to the stars and nowhere else.</p>
                            <div className="wish-row">
                                <input
                                    className="wish-input"
                                    value={wish}
                                    onChange={(e) => setWish(e.target.value)}
                                    placeholder="I wish..."
                                    maxLength={120}
                                />
                                <button
                                    className="extra-btn"
                                    onClick={() => {
                                        setSent(true)
                                        window.confetti?.({ particleCount: 60, spread: 60, origin: { y: 0.8 }, shapes: ['star'], colors: ['#ffd76a', '#fff'] })
                                    }}
                                >
                                    Send ⭐
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="wish-title">Your wish is on its way to the stars ⭐</p>
                            <p className="wish-sub">
                                And here is mine for you: lots of fun, good health, and a love that
                                stays right beside you. May it all come true. 💗 — TH3AN
                            </p>
                        </>
                    )}
                    <div className="extra-actions">
                        <Link className="extra-btn" to="/flower">🌷 Get your flower</Link>
                        <button className="extra-btn ghost" onClick={relight}>🕯️ Light again</button>
                        <Link className="extra-btn ghost" to="/">← Back</Link>
                    </div>
                </div>
            )}
        </main>
    )
}

export default WishPage
