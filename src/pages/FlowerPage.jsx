import React, { useRef, useState } from 'react'
import { Link } from 'react-router'
import ThreeCanvas from '../three/ThreeCanvas'
import { buildFlower } from '../three/buildFlower'
import Flower3D from '../components/Flower3D'
import FloatingPetals from '../components/FloatingPetals'
import { SITE } from '../config'
import '../Extras.css'

const FlowerPage = () => {
    const flowerRef = useRef(null)
    const [bloomKey, setBloomKey] = useState(0) // only used by the no-WebGL fallback

    const bloomAgain = () => {
        flowerRef.current?.replay()
        setBloomKey((k) => k + 1)
        window.confetti?.({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#ff6f9c', '#ffd1de', '#ffffff', '#ffc83d'],
            scalar: 0.9,
        })
    }

    return (
        <main className="extra-page flower-page">
            <FloatingPetals count={16} />

            <header className="extra-head">
                <span className="extra-kicker">for {SITE.name} 🌷</span>
                <h1 className="extra-title">A Flower For You</h1>
            </header>

            <ThreeCanvas
                className="stage3d"
                label="A 3D rose you can turn around"
                build={buildFlower}
                onReady={(api) => { flowerRef.current = api }}
                fallback={<Flower3D bloomKey={bloomKey} />}
            />
            <p className="extra-hint">Drag to turn it 360° · pinch or scroll to zoom</p>

            <div className="extra-note">
                <p>
                    I can't hand you a real flower from here, so I grew you one that will
                    never fade. It blooms every time you look at it, just like you do for me.
                </p>
                <span className="extra-sign">{SITE.sender} 💗</span>
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
