import React, { useMemo } from 'react'

// Soft sakura petals drifting down the screen
const FloatingPetals = ({ count = 20 }) => {
    const petals = useMemo(
        () =>
            Array.from({ length: count }).map((_, i) => {
                // deterministic "random" values so rendering stays pure
                const r = (n) => ((i * 9301 + n * 49297) % 233280) / 233280
                return {
                    id: i,
                    left: r(1) * 100,
                    size: 10 + r(2) * 14,
                    dur: 9 + r(3) * 9,
                    delay: -r(4) * 18,
                    drift: -60 + r(5) * 120,
                    hue: r(6) > 0.5 ? 'a' : 'b',
                }
            }),
        [count]
    )

    return (
        <div className="petals-layer" aria-hidden="true">
            {petals.map((p) => (
                <span
                    key={p.id}
                    className={`fall-petal ${p.hue}`}
                    style={{
                        left: `${p.left}%`,
                        width: p.size,
                        height: p.size * 1.25,
                        animationDuration: `${p.dur}s`,
                        animationDelay: `${p.delay}s`,
                        '--drift': `${p.drift}px`,
                    }}
                />
            ))}
        </div>
    )
}

export default FloatingPetals
