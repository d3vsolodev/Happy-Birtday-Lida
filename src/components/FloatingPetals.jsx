import React, { useMemo } from 'react'

// Soft sakura petals drifting down the screen
const FloatingPetals = ({ count = 20 }) => {
    const petals = useMemo(
        () =>
            Array.from({ length: count }).map((_, i) => ({
                id: i,
                left: Math.random() * 100,
                size: 10 + Math.random() * 14,
                dur: 9 + Math.random() * 9,
                delay: -Math.random() * 18,
                drift: -60 + Math.random() * 120,
                hue: Math.random() > 0.5 ? 'a' : 'b',
            })),
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
