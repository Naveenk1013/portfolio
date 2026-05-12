import { useState, useEffect } from 'react';
import TextPressure from '../TextPressure/TextPressure';
import CinematicTitle from './CinematicTitle';
import ProfileCard from '../ProfileCard/ProfileCard';
import './Hero.css';

const textArray = [
    'Frontend Developer',
    'UI/UX Designer',
    'Tech Enthusiast',
    'Creative Developer',
    'Problem Solver'
];

const Hero = () => {
    const [typedText, setTypedText] = useState('');
    const [textArrayIndex, setTextArrayIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

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
            }, 80);
        }

        if (!isDeleting && charIndex === currentText.length) {
            timeout = setTimeout(() => setIsDeleting(true), 2500);
        } else if (isDeleting && charIndex === 0) {
            setIsDeleting(false);
            setTextArrayIndex((textArrayIndex + 1) % textArray.length);
        }

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, textArrayIndex]);

    const handleContactClick = () => {
        window.location.href = '#contact';
    };

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
                <div className="hero-card">
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
                        behindGlowColor="rgba(82, 39, 255, 0.5)"
                        onContactClick={handleContactClick}
                    />
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

