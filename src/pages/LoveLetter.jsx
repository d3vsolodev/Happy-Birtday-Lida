import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

const LoveLetter = () => {      
    const lettersData = [
        {
            id: 1,
            name: "TH3AN",
            msg: "Happy Birthday, Lida. Today the world got a little brighter, because you were born in it. 🌸",
        },
        {
            id: 2,
            name: "TH3AN",
            msg: "One smile from you can change my whole day, my whole mood, my whole heartbeat.",
        },
        {
            id: 3,
            name: "TH3AN",
            msg: "I hope this year is full of laughter, adventures, and all the little things that make you smile until your cheeks hurt.",
        },
        {
            id: 4,
            name: "TH3AN",
            msg: "I wish you good health, a calm mind, and a happy heart, every single day of this year.",
        },
        {
            id: 5,
            name: "TH3AN",
            msg: "Your laugh reaches me like sunlight through a window: warm, real, and impossible to forget.",
        },
        {
            id: 6,
            name: "TH3AN",
            msg: `Whatever this year brings, I'll be on your side. I'll cheer for you, listen to you, and choose you.`,
        },
        {
            id: 7,
            name: "TH3AN",
            msg: "Thank you for being you. You turned ordinary days into moments I never want to forget.",
        },
        {
            id: 8,
            name: "TH3AN",
            msg: `I love you, Lida. Happy Birthday, always and forever. 💗 (Don't forget to see your flower 🌷)`,
        },
    ];
    const [openEnvelope, setOpenEnvelope] = useState(false);
    const [letters, setLetters] = useState([]);
    const [zIndexCounter, setZIndexCounter] = useState(10);
    const lettersContainerRef = useRef(null);
    useEffect(() => {
        setLetters(lettersData);
    }, []);
    // Drag logic
    const handleMouseDown = (e) => {
        const isTouch = e.type === "touchstart";
        const startEvent = isTouch ? e.touches[0] : e;

        if (startEvent.target.tagName === "BUTTON") return;

        const letterEl = e.currentTarget;

        const rect = letterEl.getBoundingClientRect();

        const offsetX = startEvent.clientX - rect.left;
        const offsetY = startEvent.clientY - rect.top;

        const startLeft = rect.left + window.scrollX;
        const startTop = rect.top + window.scrollY;

        letterEl.style.transform = "none";
        letterEl.classList.remove("-translate-x-1/2");
        letterEl.classList.remove("-translate-y-1/2");

        letterEl.style.position = "absolute";
        letterEl.style.left = `${startLeft}px`;
        letterEl.style.top = `${startTop}px`;
        letterEl.style.margin = 0;
        letterEl.style.zIndex = zIndexCounter;

        const moveAt = (posX, posY) => {
            letterEl.style.left = `${posX - offsetX}px`;
            letterEl.style.top = `${posY - offsetY}px`;
        };

        const onMouseMove = (moveEvent) => {
            const ev = isTouch ? moveEvent.touches[0] : moveEvent;
            moveAt(ev.clientX, ev.clientY);
        };

        const onMouseUp = () => {
            if (isTouch) {
                document.removeEventListener("touchmove", onMouseMove);
                document.removeEventListener("touchend", onMouseUp);
            } else {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            }
        };

        if (isTouch) {
            document.addEventListener("touchmove", onMouseMove);
            document.addEventListener("touchend", onMouseUp);
        } else {
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        }
    };


    const handleCloseLetter = (id) => {
        setLetters((prev) => prev.filter((l) => l.id !== id));
    };


    return (
        <main className='munna love-letter-page bg-[#8b0000] h-screen w-full overflow-hidden'>
            <Link className="love-letter-home" to="/" draggable="false">
                <span aria-hidden="true">←</span> Back to birthday
            </Link>
            <section className="munna cssletter z-10">
                <div className={`envelope ${openEnvelope ? "active" : ""}`}>
                    <button
                        className="munna heart"
                        id="openEnvelope"
                        aria-label="Open Envelope"
                        onClick={() => setOpenEnvelope(true)}
                    >
                        <span className="munna heart-text">Open</span>
                    </button>
                    <div className="munna envelope-flap text-black relative">
                        <div className='munna absolute left-1/2 top-[20%] -translate-x-1/2 flex items-center justify-center flex-col md:gap-y-2'>
                            <span className='munna font-sriracha md:text-2xl text-lg'>Envelope Of Love</span>
                            <span className='munna font-dancingScript md:text-3xl text-xl'>Dear Lida</span>
                        </div>
                    </div>
                    <div className="munna envelope-folds">
                        <div className="munna envelope-left"></div>
                        <div className="munna envelope-right"></div>
                        <div className="munna envelope-bottom"></div>
                    </div>
                </div>

                <div className="munna letters" ref={lettersContainerRef}>
                    {letters.map((letter) => (
                        <blockquote
                            key={letter.id}
                            className="munna letter center -translate-x-1/2 -translate-y-1/2"
                            id={letter.id}
                            tabIndex={0}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                            }}

                            onMouseDown={(e) => handleMouseDown(e, letter.id)}
                            onTouchStart={handleMouseDown}
                        >
                            <button
                                className="munna closeLetter"
                                title={`Close ${letter.name}'s letter`}
                                onClick={() => handleCloseLetter(letter.id)}
                            >
                                Close {letter.name}'s letter
                            </button>
                            <p>{letter.msg}</p>
                            <cite>{letter.name}</cite>
                        </blockquote>
                    ))}
                </div>
            </section>


            {/* ------------------ Heart Beating  */}
            <div className="munna heart-container absolute top-[20%] md:left-20 left-6">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="munna heartBeating md:w-[150px] w-[110px] h-[200px]"
                >
                    <path
                        d="M471.7 73.6c-54.5-46.4-136-38.3-186.4 15.8L256 120.6l-29.3-31.2C176.3 35.3 94.8 27.2 40.3 73.6-18 125.4-13.3 221 43 273.7l187.3 177.6a24 24 0 0032.4 0L469 273.7c56.3-52.8 61-148.3 2.7-200.1z"
                        fill="#b10505"
                    />
                </svg>
            </div>
            <div className="munna heart-container absolute bottom-[10%] md:right-20 right-6 rotate-180">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="munna heartBeating md:w-[150px] w-[110px] h-[200px]"
                >
                    <path
                        d="M471.7 73.6c-54.5-46.4-136-38.3-186.4 15.8L256 120.6l-29.3-31.2C176.3 35.3 94.8 27.2 40.3 73.6-18 125.4-13.3 221 43 273.7l187.3 177.6a24 24 0 0032.4 0L469 273.7c56.3-52.8 61-148.3 2.7-200.1z"
                        fill="#b10505"
                    />
                </svg>
            </div>
            {/* ------------------ Heart Falling  */}
            <div className="munna snowflakes z-0">
                <div className="munna snowflake">
                    <img src="https://i.pinimg.com/originals/96/c7/8b/96c78bc8ab873498b763798793d64f62.png" width="25" />
                </div>
                <div className="munna snowflake">
                    <img src="https://i.pinimg.com/originals/96/c7/8b/96c78bc8ab873498b763798793d64f62.png" width="25" />  </div>
                <div className="munna snowflake">
                    <img src="https://i.pinimg.com/originals/96/c7/8b/96c78bc8ab873498b763798793d64f62.png" width="25" />
                </div>
                <div className="munna snowflake">
                    <img src="https://i.pinimg.com/originals/96/c7/8b/96c78bc8ab873498b763798793d64f62.png" width="25" />
                </div>
                <div className="munna snowflake">
                    <img src="https://i.pinimg.com/originals/96/c7/8b/96c78bc8ab873498b763798793d64f62.png" width="25" />
                </div>
                <div className="munna snowflake">
                    <img src="https://i.pinimg.com/originals/96/c7/8b/96c78bc8ab873498b763798793d64f62.png" width="25" />
                </div>
                <div className="munna snowflake">
                    <img src="https://i.pinimg.com/originals/96/c7/8b/96c78bc8ab873498b763798793d64f62.png" width="25" />
                </div>
                <div className="munna snowflake">
                    <img src="https://i.pinimg.com/originals/96/c7/8b/96c78bc8ab873498b763798793d64f62.png" width="25" />
                </div>
                <div className="munna snowflake">
                    <img src="https://i.pinimg.com/originals/96/c7/8b/96c78bc8ab873498b763798793d64f62.png" width="25" />
                </div>
                <div className="munna snowflake">
                    <img src="https://i.pinimg.com/originals/96/c7/8b/96c78bc8ab873498b763798793d64f62.png" width="25" />
                </div>
            </div>
        </main>
    )
}

export default LoveLetter