import React, { useEffect, useRef } from 'react'
import '../Flower3D.css'

// Three rings of petals: outer (wide open), middle, inner (still curled)
const LAYERS = [
    { n: 8, tilt: 66, scale: 1, offset: 0, cls: 'outer', delay: 0.0 },
    { n: 7, tilt: 44, scale: 0.84, offset: 20, cls: 'mid', delay: 0.35 },
    { n: 6, tilt: 22, scale: 0.62, offset: 8, cls: 'inner', delay: 0.7 },
]

const Flower3D = ({ bloomKey = 0 }) => {
    const sceneRef = useRef(null)
    const state = useRef({ x: 16, y: 0, dragging: false, lastX: 0, lastY: 0 })

    useEffect(() => {
        let raf
        const tick = () => {
            const s = state.current
            if (!s.dragging) s.y += 0.28
            if (sceneRef.current) {
                sceneRef.current.style.transform = `rotateX(${s.x}deg) rotateY(${s.y}deg)`
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [])

    const down = (e) => {
        const s = state.current
        s.dragging = true
        s.lastX = e.clientX
        s.lastY = e.clientY
        e.currentTarget.setPointerCapture?.(e.pointerId)
    }
    const move = (e) => {
        const s = state.current
        if (!s.dragging) return
        s.y += (e.clientX - s.lastX) * 0.6
        s.x = Math.max(-10, Math.min(70, s.x - (e.clientY - s.lastY) * 0.4))
        s.lastX = e.clientX
        s.lastY = e.clientY
    }
    const up = () => { state.current.dragging = false }

    return (
        <div
            className="flower3d-stage"
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onPointerLeave={up}
        >
            <div className="flower3d-glow" />
            <div className="flower3d-scene" ref={sceneRef}>
                <div className="flower3d-plant" key={bloomKey}>
                    {/* stem + leaves */}
                    <div className="stem">
                        <div className="leaf leaf-a" />
                        <div className="leaf leaf-b" />
                        <div className="leaf leaf-c" />
                    </div>

                    {/* flower head */}
                    <div className="head">
                        {LAYERS.map((L) =>
                            Array.from({ length: L.n }).map((_, i) => (
                                <div
                                    key={`${L.cls}-${i}`}
                                    className={`petal ${L.cls}`}
                                    style={{
                                        '--a': `${(360 / L.n) * i + L.offset}deg`,
                                        '--t': `${L.tilt}deg`,
                                        '--s': L.scale,
                                        '--d': `${L.delay + i * 0.04}s`,
                                    }}
                                />
                            ))
                        )}
                        <div className="core" />
                        {Array.from({ length: 10 }).map((_, i) => (
                            <span
                                key={i}
                                className="pollen"
                                style={{ '--a': `${i * 36}deg`, '--r': `${6 + (i % 3) * 4}px` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="flower3d-shadow" />
        </div>
    )
}

export default Flower3D
