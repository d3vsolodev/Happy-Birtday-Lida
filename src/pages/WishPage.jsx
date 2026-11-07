import React, { useRef, useState } from 'react'
import { Link } from 'react-router'
import ThreeCanvas from '../three/ThreeCanvas'
import { buildCake } from '../three/buildCake'
import FloatingPetals from '../components/FloatingPetals'
import { SITE, daysUntilBirthday } from '../config'
import { sendWish } from '../lib/sendWish'
import '../Extras.css'

const buildLidaCake = (ctx) => buildCake(ctx, { name: SITE.name })
const MAX_WISH = 300

const WishPage = () => {
    const cakeRef = useRef(null)
    const [blown, setBlown] = useState(false)
    const [wish, setWish] = useState('')
    const [trap, setTrap] = useState('') // hidden anti-bot field
    const [status, setStatus] = useState('idle') // idle | sending | sent | error
    const [days] = useState(daysUntilBirthday)

    const confetti = (o) =>
        window.confetti?.({
            origin: { y: 0.65 },
            colors: ['#ff6f9c', '#ffd1de', '#ffffff', '#ffc83d', '#b9a2ff'],
            ...o,
        })

    const blow = () => {
        if (blown) return
        cakeRef.current?.blowOut()
        setBlown(true)
        confetti({ particleCount: 120, spread: 90 })
        setTimeout(() => confetti({ particleCount: 80, spread: 120, scalar: 1.2 }), 350)
    }

    const relight = () => {
        cakeRef.current?.relight()
        setBlown(false)
        setStatus('idle')
        setWish('')
    }

    const submit = async () => {
        const text = wish.trim()
        if (!text || status === 'sending') return
        setStatus('sending')
        const ok = await sendWish(text, trap)
        setStatus(ok ? 'sent' : 'error')
        if (ok) confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 }, shapes: ['star'], colors: ['#ffd76a', '#fff'] })
    }

    return (
        <main className="extra-page wish-page">
            <FloatingPetals count={14} />

            <header className="extra-head">
                <span className="extra-kicker">
                    {days === 0 ? '🎉 Today is your day!' : `${days} day${days === 1 ? '' : 's'} until ${SITE.birthdayLabel}`}
                </span>
                <h1 className="extra-title">Make a Wish, {SITE.name}</h1>
            </header>

            <ThreeCanvas
                className="stage3d"
                label="A 3D birthday cake you can turn around"
                build={buildLidaCake}
                onReady={(api) => { cakeRef.current = api }}
                fallback={<div className="stage3d-fallback">🎂</div>}
            />
            <p className="extra-hint">Drag to turn the cake 360° · pinch or scroll to zoom</p>

            {!blown ? (
                <div className="extra-actions">
                    <button className="extra-btn" onClick={blow}>💨 Blow out the candles</button>
                    <Link className="extra-btn ghost" to="/">← Back</Link>
                </div>
            ) : (
                <div className="wish-panel">
                    {status !== 'sent' ? (
                        <>
                            <p className="wish-title">Close your eyes and make a wish ✨</p>
                            <p className="wish-sub">
                                Type your wish and send it. {SITE.sender} will receive it 💌
                            </p>
                            <div className="wish-row">
                                <input
                                    className="wish-input"
                                    value={wish}
                                    onChange={(e) => setWish(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                                    placeholder="I wish..."
                                    maxLength={MAX_WISH}
                                    aria-label="Your wish"
                                    disabled={status === 'sending'}
                                />
                                {/* honeypot: real people never see or fill this */}
                                <input
                                    className="wish-trap"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    aria-hidden="true"
                                    value={trap}
                                    onChange={(e) => setTrap(e.target.value)}
                                    name="website"
                                />
                                <button className="extra-btn" onClick={submit} disabled={!wish.trim() || status === 'sending'}>
                                    {status === 'sending' ? 'Sending…' : 'Send ⭐'}
                                </button>
                            </div>
                            {status === 'error' && (
                                <p className="wish-error">The stars are busy right now. Please try sending again 💗</p>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="wish-title">Your wish is on its way ⭐</p>
                            <p className="wish-sub">
                                {SITE.sender} got your wish, and here is his wish for you: lots of fun, good
                                health, and a love that stays right beside you. 💗
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
