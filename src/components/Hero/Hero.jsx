import { useState, useEffect, useRef, useCallback } from 'react';
import ProfileCard from '../ProfileCard/ProfileCard';
import PortalTransition from '../PortalTransition/PortalTransition';
import { animeAudio } from '../../utils/animeAudio';
import { ZapIcon, RocketIcon, SendIcon } from '../icons';
import './Hero.css';

const PORTAL_CLICK_THRESHOLD = 6;
const CLICK_RESET_DELAY = 3500; // Reset counter after 3.5s of inactivity

const Hero = () => {
    // Easter egg state
    const [avatarClicks, setAvatarClicks] = useState(0);
    const [avatarWiggle, setAvatarWiggle] = useState(false);
    const [isPortalActive, setIsPortalActive] = useState(false);
    const clickTimerRef = useRef(null);

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

        // Play audio feedback for Haki charge
        animeAudio.playHakiCharge(newCount);

        if (newCount >= PORTAL_CLICK_THRESHOLD) {
            // Trigger Dimensional Slash Portal
            setIsPortalActive(true);
        } else {
            // Auto-reset after inactivity
            clickTimerRef.current = setTimeout(() => {
                setAvatarClicks(0);
            }, CLICK_RESET_DELAY);
        }
    }, [avatarClicks]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        };
    }, []);

    return (
        <section className="hero" id="home">
            {/* Fullscreen Dimensional Katana Slash Transition */}
            <PortalTransition
                active={isPortalActive}
                onComplete={() => setIsPortalActive(false)}
            />

            <div className="hero-layout">
                {/* Left Content */}
                <div className="hero-content">
                    {/* Futuristic Cyber Badge */}
                    <div className="hero-badge-pill">
                        <span className="hero-badge-beacon" />
                        <span className="hero-badge-text">Architecting Digital Experiences</span>
                        <span className="hero-badge-tag">// UI/UX & DEV</span>
                    </div>

                    {/* Vibe-Matched Holographic Neon Name Title */}
                    <div className="hero-title-wrapper">
                        <h1 className="hero-name-title">
                            <span className="hero-name-first">NAVEEN </span>
                            <span className="hero-name-last">KUMAR</span>
                        </h1>
                        <div className="hero-title-beam" />
                    </div>
                    <div className="hero-buttons">
                        <a href="#projects" className="btn btn-primary">
                            <RocketIcon size={18} style={{ marginRight: 8, display: 'inline-flex', verticalAlign: 'middle' }} />
                            <span>View Projects</span>
                        </a>
                        <a href="#contact" className="btn btn-secondary">
                            <SendIcon size={17} style={{ marginRight: 8, display: 'inline-flex', verticalAlign: 'middle' }} />
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
                    {/* Enhanced Click hint indicator */}
                    {avatarClicks > 0 && avatarClicks < PORTAL_CLICK_THRESHOLD && (
                        <div className="hero-click-hint">
                            <span className="hero-hint-gauge">
                                <ZapIcon size={16} className="hero-hint-zap" style={{ color: '#ff2d55', marginRight: 5 }} /> HAKI: {avatarClicks}/{PORTAL_CLICK_THRESHOLD}
                            </span>
                            <span className="hero-hint-dots">
                                {'◆'.repeat(avatarClicks)}{'◇'.repeat(PORTAL_CLICK_THRESHOLD - avatarClicks)}
                            </span>
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
