import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import './CinematicTitle.css';

const CinematicTitle = ({ text }) => {
    const textRef = useRef(null);

    useEffect(() => {
        // Split text into letters
        const letters = textRef.current.innerText.split("");
        textRef.current.innerHTML = letters.map(l => 
            `<span class="letter" style="display:inline-block">${l === " " ? "&nbsp;" : l}</span>`
        ).join("");

        // Anime.js 4 animation
        animate('.cinematic-title .letter', {
            translateY: [100, 0],
            opacity: [0, 1],
            easing: "easeOutExpo",
            duration: 1400,
            delay: (el, i) => 300 + 30 * i
        });
    }, [text]);

    return (
        <h1 ref={textRef} className="cinematic-title">
            {text}
        </h1>
    );
};

export default CinematicTitle;
