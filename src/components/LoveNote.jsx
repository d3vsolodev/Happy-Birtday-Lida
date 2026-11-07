import React, { useEffect, useState } from 'react'

// Floating 💌 button that opens a small love note (never covers her photo)
const LoveNote = () => {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!open) return
        const onKey = (e) => e.key === 'Escape' && setOpen(false)
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open])

    return (
        <>
            <button className="note-fab" onClick={() => setOpen(true)} aria-label="Open a little note">
                💌
            </button>

            {open && (
                <div className="note-backdrop" onClick={() => setOpen(false)}>
                    <div className="note-paper" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="A little note for Lida">
                        <button className="note-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
                        <h3>Dear Lida,</h3>
                        <p>
                            Wishing you fun, good health, and a heart full of happiness every
                            day. I love you more than words can say.
                        </p>
                        <span className="sign">TH3AN 🌷</span>
                    </div>
                </div>
            )}
        </>
    )
}

export default LoveNote
