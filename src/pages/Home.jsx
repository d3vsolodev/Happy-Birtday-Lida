import React, { useState } from "react";
import { Link } from "react-router";
import { FaHeart, FaEnvelopeOpenText } from "react-icons/fa";
import flagImg from "../assets/1.png";
import balloon1 from "../assets/balloon1.png";
import balloon2 from "../assets/balloon2.png";
import decorate from "../assets/decorate.png";
import decoFlower from "../assets/decorate_flower.png";
import hat from "../assets/hat.png";
import smileIcon from "../assets/smiley_icon.png";
import lidaPhoto from "../assets/cutegirl.jpg";
import BookCanvas from "../components/BookCanvas";
import LoveNote from "../components/LoveNote";
import FloatingPetals from "../components/FloatingPetals";
import { SITE } from "../config";
import "../Home.css";

// Splits a word into animated letters
const Letters = ({ text, start }) =>
    text.split("").map((c, i) => (
        <span key={i} style={{ "--d": `${start + i * 0.07}s` }}>{c}</span>
    ));

const STARS = [
    { top: "13%", left: "5%", s: 18, d: 2.6 },
    { top: "9%", left: "90%", s: 15, d: 2.8 },
    { top: "44%", left: "3%", s: 14, d: 3.0 },
    { top: "55%", left: "94%", s: 18, d: 3.2 },
    { top: "78%", left: "7%", s: 16, d: 3.4 },
    { top: "88%", left: "88%", s: 14, d: 3.6 },
];
const FLOWERS = [
    { top: "30%", left: "93%", d: 3.0 },
    { top: "64%", left: "4%", d: 3.2 },
    { top: "93%", left: "48%", d: 3.4 },
];

const Home = () => {
    const [Active, SetActive] = useState(true);

    // 3D tilt on the photo - mouse only, so touch scrolling is never blocked
    const tilt = (e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        e.currentTarget.style.transform = `perspective(600px) rotateY(${x * 22}deg) rotateX(${-y * 22}deg) scale(1.04)`;
    };
    const untilt = (e) => { e.currentTarget.style.transform = ""; };

    return (
        <div id="wrapper">
            <FloatingPetals count={12} />

            <div className="flags" aria-hidden="true">
                <img className="flag-l" src={flagImg} alt="" />
                <img className="flag-r" src={flagImg} alt="" />
            </div>

            {STARS.map((st, i) => (
                <div key={i} className="deco deco--star" style={{ top: st.top, left: st.left, "--s": `${st.s}px`, "--d": `${st.d}s` }} />
            ))}
            {FLOWERS.map((f, i) => (
                <div key={i} className="deco deco--flower" style={{ top: f.top, left: f.left, "--d": `${f.d}s` }}>
                    <img src={decoFlower} alt="" />
                </div>
            ))}
            <div className="deco deco--smile"><img src={smileIcon} alt="" /></div>
            <div className="deco deco--blob"><img src={decorate} alt="" /></div>

            <main className="content">
                {/* ---------------- left: text + buttons ---------------- */}
                <section className="left">
                    <div className="title">
                        <h1 className="happy"><Letters text="Happy" start={1.0} /></h1>
                        <h1 className="birthday"><Letters text="Birthday" start={1.35} /></h1>
                        <div className="hat"><img src={hat} alt="" /></div>
                    </div>

                    <div className="date-pill" style={{ marginTop: "clamp(1rem, 3vh, 1.8rem)" }}>
                        <i>★</i><span>{SITE.birthdayLabel}</span><i>★</i>
                    </div>

                    <div className="cta" style={{ marginTop: "clamp(1rem, 3vh, 1.8rem)" }}>
                        <div className="home-actions">
                            <button
                                id="btn__letter"
                                className="pill pill--primary reveal"
                                style={{ "--d": "2.3s" }}
                                onClick={() => SetActive(!Active)}
                            >
                                <FaHeart color="#d13852" /> Open Lida's Card
                            </button>
                            <Link
                                id="FromTH3AN"
                                className="pill pill--primary reveal"
                                style={{ "--d": "2.45s" }}
                                to="/love-letter"
                            >
                                <FaEnvelopeOpenText color="#fff" /> From TH3AN
                            </Link>
                        </div>

                        <div className="home-extras">
                            <Link to="/flower" className="pill" style={{ "--d": "2.7s" }}>
                                <span className="emoji">🌷</span> Your Flower
                            </Link>
                            <Link to="/wish" className="pill" style={{ "--d": "2.9s" }}>
                                <span className="emoji">🎂</span> Make a Wish
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ---------------- right: her photo ---------------- */}
                <section className="right">
                    <div className="photo-wrap">
                        <div className="balloon balloon--a"><img src={balloon1} alt="" /></div>
                        <div className="balloon balloon--b"><img src={balloon2} alt="" /></div>

                        <div className="float">
                            <div className="photo" onPointerMove={tilt} onPointerLeave={untilt}>
                                <img src={lidaPhoto} alt="Lida" />
                            </div>

                            <div className="name-badge">
                                <b>♥</b><span>Dear Lida</span><b>♥</b>
                            </div>

                            <div className="spin-badge" aria-hidden="true">
                                <div className="spin-ring">
                                    {["h", "a", "p", "p", "y", "-", "b", "i", "r", "t", "h", "d", "a", "y", "-"].map((c, i) => (
                                        <span key={i} style={{ "--i": i + 1 }}>{c}</span>
                                    ))}
                                </div>
                                <div className="spin-heart">♥</div>
                            </div>

                            <span className="bit bit--1">♥</span>
                            <span className="bit bit--2">✦</span>
                            <span className="bit bit--3">✿</span>
                        </div>
                    </div>
                </section>
            </main>

            <LoveNote />

            {/* Card book (opens from "Open Lida's Card") */}
            <BookCanvas active={Active} setActive={SetActive} />
        </div>
    );
};

export default Home;
