import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TextPressure from '../TextPressure/TextPressure';
import CinematicTitle from './CinematicTitle';
import ProfileCard from '../ProfileCard/ProfileCard';
import './Hero.css';

const PORTAL_CLICK_THRESHOLD = 6;
const CLICK_RESET_DELAY = 3000; // Reset counter after 3s of inactivity

const textArray = [
    'Frontend Dev',
    'UI/UX Designer',
    'Tech Paglu',
];

const Hero = () => {
    const navigate = useNavigate();
    const [typedText, setTypedText] = useState('');
    const [textArrayIndex, setTextArrayIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    // Easter egg state
    const [avatarClicks, setAvatarClicks] = useState(0);
    const [avatarWiggle, setAvatarWiggle] = useState(false);
    const clickTimerRef = useRef(null);

    useEffect(() => {
        const currentText = textArray[textArrayIndex];
        let timeout;

        if (!isDeleting && charIndex === currentText.length) {
            // Fully typed — pause, then start deleting
            timeout = setTimeout(() => setIsDeleting(true), 2500);
        } else if (isDeleting && charIndex === 0) {
            // Fully deleted — pause, then move to next word
            timeout = setTimeout(() => {
                setIsDeleting(false);
                setTextArrayIndex((textArrayIndex + 1) % textArray.length);
            }, 200);
        } else if (isDeleting) {
            // Deleting in progress
            timeout = setTimeout(() => {
                setTypedText(currentText.substring(0, charIndex - 1));
                setCharIndex(charIndex - 1);
            }, 50);
        } else {
            // Typing in progress
            timeout = setTimeout(() => {
                setTypedText(currentText.substring(0, charIndex + 1));
                setCharIndex(charIndex + 1);
            }, 80);
        }

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, textArrayIndex]);

    const handleContactClick = () => {
        document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Easter egg: 6-click avatar handler
    const handleAvatarClick = useCallback(() => {
        // Reset inactivity timer
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

        const newCount = avatarClicks + 1;
        setAvatarClicks(newCount);

        // Visual wiggle feedback on each click
        setAvatarWiggle(true);
        setTimeout(() => setAvatarWiggle(false), 300);

        if (newCount >= PORTAL_CLICK_THRESHOLD) {
            // ACTIVATE PORTAL IMMEDATELY
            navigate('/anime');
        } else {
            // Auto-reset after inactivity
            clickTimerRef.current = setTimeout(() => {
                setAvatarClicks(0);
            }, CLICK_RESET_DELAY);
        }
    }, [avatarClicks, navigate]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        };
    }, []);

    return (
        <section className="hero" id="home">
            <div className="hero-layout">
                {/* Left Content */}
                <div className="hero-content">
                    <div className="hero-subtitle">
                        Architecting Digital Experiences
                    </div>
                    {/* Cinematic Title Reveal */}
                    <div className="hero-title-container">
                        <CinematicTitle text="NAVEEN KUMAR" />
                    </div>
                    <div className="hero-description-pressure">
                        <TextPressure
                            text={typedText || ' '}
                            flex={true}
                            alpha={false}
                            stroke={false}
                            width={true}
                            weight={true}
                            italic={true}
                            textColor="#00f7ff"
                            minFontSize={32}
                        />
                    </div>
                    <div className="hero-buttons">
                        <a href="#projects" className="btn btn-primary">
                            <span>View Projects</span>
                        </a>
                        <a href="#contact" className="btn btn-secondary">
                            <span>Get in Touch</span>
                        </a>
                    </div>
                </div>

                {/* Right - Profile Card */}
                <div className={`hero-card ${avatarWiggle ? 'hero-card-wiggle' : ''}`}>
                    <ProfileCard
                        name="NAVEEN KUMAR"
                        title="Frontend Developer"
                        handle="naveenkumar"
                        status="Available for work"
                        contactText="Contact Me"
                        avatarUrl="/me.png"
                        showUserInfo={true}
                        enableTilt={true}
                        enableMobileTilt={false}
                        behindGlowColor={
                            avatarClicks >= 4
                                ? 'rgba(255, 45, 85, 0.7)'
                                : avatarClicks >= 2
                                    ? 'rgba(139, 92, 246, 0.6)'
                                    : 'rgba(82, 39, 255, 0.5)'
                        }
                        onContactClick={handleContactClick}
                        onAvatarClick={handleAvatarClick}
                    />
                    {/* Click hint indicator */}
                    {avatarClicks > 0 && avatarClicks < PORTAL_CLICK_THRESHOLD && (
                        <div className="hero-click-hint">
                            {'●'.repeat(avatarClicks)}{'○'.repeat(PORTAL_CLICK_THRESHOLD - avatarClicks)}
                        </div>
                    )}
                </div>
            </div>

            <div className="scroll-indicator">
                <div className="mouse">
                    <div className="wheel"></div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
