import React from 'react'
import '../HeartTransition.css';
import { useLocation } from 'react-router';

const HeartTransition = () => {
    const location = useLocation();

    // The very first page load is handled by the cake opening animation,
    // so the heart only plays when moving between pages.
    if (location.key === 'default') return null;

    // `key` restarts the CSS animation on every navigation (works on iPhone Safari too)
    return (
                <div className="route-loader" key={location.key}>
                    <main className='bg-[#8b0000] HeartTransisitonOpen'>
                        <svg className="heart-loader" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 90 90" version="1.1">
                            <g className="heart-loader__group">
                                <path className="heart-loader__square" strokeWidth="1" fill="none" d="M0,30 0,90 60,90 60,30z" />
                                <path className="heart-loader__circle m--left" strokeWidth="1" fill="none" d="M60,60 a30,30 0 0,1 -60,0 a30,30 0 0,1 60,0" />
                                <path className="heart-loader__circle m--right" strokeWidth="1" fill="none" d="M60,60 a30,30 0 0,1 -60,0 a30,30 0 0,1 60,0" />
                                <path className="heart-loader__heartPath" strokeWidth="2" d="M60,30 a30,30 0 0,1 0,60 L0,90 0,30 a30,30 0 0,1 60,0" />
                            </g>
                        </svg>
                    </main>

                </div>
    )
}

export default HeartTransition
