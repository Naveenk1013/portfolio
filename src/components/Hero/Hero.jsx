import { useState, useEffect, useRef, useCallback } from 'react';
import TextPressure from '../TextPressure/TextPressure';
import ProfileCard from '../ProfileCard/ProfileCard';
import PortalTransition from '../PortalTransition/PortalTransition';
import './Hero.css';

const PORTAL_CLICK_THRESHOLD = 6;
const CLICK_RESET_DELAY = 3000; // Reset counter after 3s of inactivity

const Hero = () => {
    const [typedText, setTypedText] = useState('');
    const [textArrayIndex, setTextArrayIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    // Easter egg state
    const [avatarClicks, setAvatarClicks] = useState(0);
    const [portalActive, setPortalActive] = useState(false);
    const [avatarWiggle, setAvatarWiggle] = useState(false);
    const clickTimerRef = useRef(null);

    const textArray = [
        'Frontend Developer',
        'HR Specialist',
        'Educational Technology Enthusiast',
        'Web Developer',
        'Creative Designer'
    ];

    useEffect(() => {
        const currentText = textArray[textArrayIndex];
        let timeout;

        if (isDeleting) {
            timeout = setTimeout(() => {
                setTypedText(currentText.substring(0, charIndex - 1));
                setCharIndex(charIndex - 1);
            }, 50);
        } else {
            timeout = setTimeout(() => {
                setTypedText(currentText.substring(0, charIndex + 1));
                setCharIndex(charIndex + 1);
            }, 100);
        }

        if (!isDeleting && charIndex === currentText.length) {
            timeout = setTimeout(() => setIsDeleting(true), 2000);
        } else if (isDeleting && charIndex === 0) {
            setIsDeleting(false);
            setTextArrayIndex((textArrayIndex + 1) % textArray.length);
        }

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, textArrayIndex, textArray]);

    const handleContactClick = () => {
        window.location.href = '#contact';
    };

    // Easter egg: 6-click avatar handler
    const handleAvatarClick = useCallback(() => {
        if (portalActive) return;

        // Reset inactivity timer
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

        const newCount = avatarClicks + 1;
        setAvatarClicks(newCount);

        // Visual wiggle feedback on each click
        setAvatarWiggle(true);
        setTimeout(() => setAvatarWiggle(false), 300);

        if (newCount >= PORTAL_CLICK_THRESHOLD) {
            // ACTIVATE PORTAL!
            setPortalActive(true);
        } else {
            // Auto-reset after inactivity
            clickTimerRef.current = setTimeout(() => {
                setAvatarClicks(0);
            }, CLICK_RESET_DELAY);
        }
    }, [avatarClicks, portalActive]);

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
                        Welcome to my portfolio
                    </div>
                    {/* TextPressure Effect for Name */}
                    <div className="hero-title-container">
                        <TextPressure
                            text="Naveen Kumar"
                            flex={true}
                            alpha={false}
                            stroke={false}
                            width={true}
                            weight={true}
                            italic={true}
                            textColor="#ffffff"
                            strokeColor="#00f7ff"
                            minFontSize={48}
                        />
                    </div>
                    <div className="hero-description">
                        <span className="typed-text">{typedText}</span>
                        <span className="typed-cursor">|</span>
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
                        name="Naveen Kumar"
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

            {/* Portal Transition Overlay */}
            <PortalTransition
                active={portalActive}
                onComplete={() => setPortalActive(false)}
            />
        </section>
    );
};

export default Hero;
