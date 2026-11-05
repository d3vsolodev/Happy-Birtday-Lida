import React, { useState } from 'react'
import { Link } from 'react-router'
import Flower3D from '../components/Flower3D'
import FloatingPetals from '../components/FloatingPetals'
import '../Extras.css'

const FlowerPage = () => {
    const [bloomKey, setBloomKey] = useState(0)

    const bloomAgain = () => {
        setBloomKey((k) => k + 1)
        window.confetti?.({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#ff6f9c', '#ffd1de', '#ffffff', '#ffc83d'],
            shapes: ['circle'],
            scalar: 0.9,
        })
    }

    return (
        <main className="extra-page flower-page">
            <FloatingPetals count={24} />

            <header className="extra-head">
                <span className="extra-kicker">for Lida 🌷</span>
                <h1 className="extra-title">A Flower For You</h1>
            </header>

            <Flower3D bloomKey={bloomKey} />
            <p className="extra-hint">Drag to turn it around</p>

            <div className="extra-note">
                <p>
                    I can't hand you a real flower from here, so I grew you one that will
                    never fade. It blooms every time you look at it, just like you do for me.
                </p>
                <span className="extra-sign">TH3AN 💗</span>
            </div>

            <div className="extra-actions">
                <button className="extra-btn" onClick={bloomAgain}>🌸 Bloom again</button>
                <Link className="extra-btn ghost" to="/wish">🎂 Make a wish</Link>
                <Link className="extra-btn ghost" to="/">← Back</Link>
            </div>
        </main>
    )
}

export default FlowerPage
