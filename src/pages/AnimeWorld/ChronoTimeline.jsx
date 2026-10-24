import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { 
    FaTv, FaBook, FaShieldAlt, FaFeatherAlt, 
    FaMountain, FaChevronLeft, FaChevronRight,
    FaTerminal, FaFingerprint
} from 'react-icons/fa';
import { 
    ZapIcon, 
    FlameIcon, 
    SparklesIcon 
} from '../../components/icons';
import { journeyMilestones } from '../../data/animeData';
import { animeAudio } from '../../utils/animeAudio';
import './ChronoTimeline.css';

/* ── Milestone Icon Resolver ── */
const getMilestoneIcon = (iconKey) => {
    switch (iconKey) {
        case 'tv': return <FaTv />;
        case 'book': return <FaBook />;
        case 'bolt': return <ZapIcon size={24} />;
        case 'sword': return <FaShieldAlt />;
        case 'feather': return <FaFeatherAlt />;
        case 'mountain': return <FaMountain />;
        case 'graduate': return <SparklesIcon size={24} />;
        default: return <FlameIcon size={24} />;
    }
};

/* ── Individual 3D Transformative Memory Capsule ── */
const ChronoCard = ({ milestone, index, total, smoothProgress, isActive, onSelect }) => {
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0, sheenX: 50, sheenY: 50 });
    const [isHovered, setIsHovered] = useState(false);

    // Calculate strictly increasing input ranges to prevent Framer Motion duplicate range / NaN bug
    const cardCenterProgress = index / (total - 1);
    const step = 1 / (total - 1);

    let range, scaleRange, opacityRange, rotateYRange, zIndexRange;

    if (index === 0) {
        range = [0, step * 0.75, step * 1.5];
        scaleRange = [1.05, 0.92, 0.84];
        opacityRange = [1, 0.7, 0.4];
        rotateYRange = [0, -8, -16];
        zIndexRange = [20, 8, 1];
    } else if (index === total - 1) {
        range = [1 - step * 1.5, 1 - step * 0.75, 1];
        scaleRange = [0.84, 0.92, 1.05];
        opacityRange = [0.4, 0.7, 1];
        rotateYRange = [16, 8, 0];
        zIndexRange = [1, 8, 20];
    } else {
        const p1 = Math.max(0, cardCenterProgress - step * 0.8);
        const p2 = cardCenterProgress;
        const p3 = Math.min(1, cardCenterProgress + step * 0.8);
        // Guarantee strictly increasing values
        range = [
            p1 >= p2 ? p2 - 0.01 : p1,
            p2,
            p3 <= p2 ? p2 + 0.01 : p3
        ];
        scaleRange = [0.85, 1.05, 0.85];
        opacityRange = [0.45, 1, 0.45];
        rotateYRange = [14, 0, -14];
        zIndexRange = [1, 20, 1];
    }

    const scale = useTransform(smoothProgress, range, scaleRange);
    const opacity = useTransform(smoothProgress, range, opacityRange);
    const rotateY = useTransform(smoothProgress, range, rotateYRange);
    const zIndexVal = useTransform(smoothProgress, range, zIndexRange);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPct = x / rect.width;
        const yPct = y / rect.height;

        setTilt({
            x: (yPct - 0.5) * -16,
            y: (xPct - 0.5) * 16,
            sheenX: xPct * 100,
            sheenY: yPct * 100
        });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTilt({ x: 0, y: 0, sheenX: 50, sheenY: 50 });
    };

    return (
        <motion.div
            className={`chrono-capsule-wrap ${isActive ? 'is-active-capsule' : ''}`}
            style={{
                scale,
                opacity,
                rotateY,
                zIndex: zIndexVal,
            }}
            onClick={() => onSelect(index)}
        >
            <div
                ref={cardRef}
                className="chrono-capsule"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={handleMouseLeave}
                style={{
                    transform: isHovered 
                        ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-8px)`
                        : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
                    borderColor: milestone.accentColor,
                    boxShadow: isHovered 
                        ? `0 20px 45px rgba(0, 0, 0, 0.6), 0 0 35px ${milestone.accentColor}44`
                        : `0 12px 30px rgba(0, 0, 0, 0.45), 0 0 15px ${milestone.accentColor}22`,
                }}
            >
                {/* Holographic Sheen Layer */}
                <div 
                    className="chrono-card-sheen"
                    style={{
                        background: `radial-gradient(circle at ${tilt.sheenX}% ${tilt.sheenY}%, rgba(255, 255, 255, 0.25) 0%, transparent 65%)`,
                        opacity: isHovered ? 1 : 0
                    }}
                />

                {/* Cybernetic Corner Brackets */}
                <div className="chrono-bracket top-left" style={{ borderColor: milestone.accentColor }} />
                <div className="chrono-bracket top-right" style={{ borderColor: milestone.accentColor }} />
                <div className="chrono-bracket bottom-left" style={{ borderColor: milestone.accentColor }} />
                <div className="chrono-bracket bottom-right" style={{ borderColor: milestone.accentColor }} />

                {/* Giant Kanji Watermark */}
                <div className="chrono-kanji-bg" style={{ color: milestone.accentColor }}>
                    {milestone.kanji}
                </div>

                {/* Top Status Bar */}
                <div className="chrono-capsule-header">
                    <div className="chrono-code-pill" style={{ borderColor: milestone.accentColor }}>
                        <FaTerminal className="chrono-term-icon" />
                        <span>{milestone.code}</span>
                    </div>
                    <div className="chrono-threat-pill" style={{ background: milestone.accentColor }}>
                        {milestone.threat}
                    </div>
                </div>

                {/* Core Reactor Icon */}
                <div className="chrono-reactor-wrap">
                    <div 
                        className="chrono-reactor-ring" 
                        style={{ 
                            borderColor: milestone.accentColor,
                            boxShadow: `0 0 20px ${milestone.accentColor}66`
                        }}
                    >
                        <span className="chrono-reactor-icon" style={{ color: milestone.accentColor }}>
                            {getMilestoneIcon(milestone.iconKey)}
                        </span>
                    </div>
                    <div className="chrono-era-tag">{milestone.era}</div>
                </div>

                {/* Title & Japanese Subtitle */}
                <div className="chrono-title-group">
                    <span className="chrono-jp-sub" style={{ color: milestone.accentColor }}>
                        {milestone.jpTitle}
                    </span>
                    <h3 className="chrono-title">{milestone.title}</h3>
                    <div className="chrono-year-stamp">
                        CHAPTER // {milestone.year}
                    </div>
                </div>

                {/* Narrative Log */}
                <p className="chrono-desc">{milestone.description}</p>

                {/* Key Anime Artifact References */}
                {milestone.animeReferences && (
                    <div className="chrono-artifacts-box">
                        <span className="chrono-artifacts-label">
                            <FaFingerprint /> DECODED ARTIFACTS:
                        </span>
                        <div className="chrono-tags-list">
                            {milestone.animeReferences.map((refTitle) => (
                                <span 
                                    key={refTitle} 
                                    className="chrono-artifact-tag"
                                    style={{ borderColor: `${milestone.accentColor}55` }}
                                >
                                    {refTitle}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tech Scanlines Effect */}
                <div className="chrono-scanlines" />
            </div>
        </motion.div>
    );
};

/* ── Main ChronoTimeline Section Component ── */
const ChronoTimeline = () => {
    const containerRef = useRef(null);
    const streamRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const total = journeyMilestones.length;

    // Track dynamic layout measurements for pixel-perfect centering
    const [metrics, setMetrics] = useState({
        startOffset: 80,
        totalTravel: 2400
    });

    useEffect(() => {
        const updateMetrics = () => {
            if (!streamRef.current) return;
            const cards = streamRef.current.querySelectorAll('.chrono-capsule-wrap');
            if (cards.length >= 2) {
                const firstCard = cards[0];
                const secondCard = cards[1];
                const cardWidth = firstCard.offsetWidth;
                const cardGap = secondCard.offsetLeft - (firstCard.offsetLeft + cardWidth);
                const step = cardWidth + cardGap;
                const viewportWidth = window.innerWidth;
                
                // Offset to position Card 0 in the exact horizontal center of the viewport
                const startOffset = Math.max(20, (viewportWidth - cardWidth) / 2);
                // Total distance to shift so Card [last] is centered in the viewport
                const totalTravel = (cards.length - 1) * step;

                setMetrics({
                    startOffset,
                    totalTravel
                });
            }
        };

        updateMetrics();
        const timer1 = setTimeout(updateMetrics, 120);
        const timer2 = setTimeout(updateMetrics, 450);

        window.addEventListener('resize', updateMetrics);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            window.removeEventListener('resize', updateMetrics);
        };
    }, [total]);

    // Scroll progress across the 320vh scrollable track
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    });

    // Spring interpolation for fluid GPU smoothing
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 110,
        damping: 26,
        restDelta: 0.001
    });

    // Horizontal transformation of the timeline rail
    const xTrack = useTransform(
        smoothProgress,
        [0, 1],
        [metrics.startOffset, metrics.startOffset - metrics.totalTravel]
    );

    // Multi-layer background parallax offsets
    const bgGridX = useTransform(smoothProgress, [0, 1], ['0px', '-400px']);
    const bgKanjiX = useTransform(smoothProgress, [0, 1], ['0px', '-650px']);
    const laserFillWidth = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

    // Detect active node on scroll
    useEffect(() => {
        const unsubscribe = scrollYProgress.on('change', (latest) => {
            const rawIndex = Math.round(latest * (total - 1));
            const clamped = Math.max(0, Math.min(total - 1, rawIndex));
            setActiveIndex((prev) => {
                if (clamped !== prev) {
                    animeAudio.playChronoBlip(680 + clamped * 85);
                    return clamped;
                }
                return prev;
            });
        });
        return () => unsubscribe();
    }, [scrollYProgress, total]);

    // Warp scroll to specific milestone index
    const warpToMilestone = useCallback((index) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const containerStart = rect.top + scrollTop;
        const scrollableHeight = containerRef.current.offsetHeight - window.innerHeight;
        
        if (scrollableHeight <= 0) return;

        const targetProgress = index / (total - 1);
        const targetScroll = containerStart + targetProgress * scrollableHeight;

        setActiveIndex(index);
        animeAudio.playKatanaSlash();
        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    }, [total]);

    const nextMilestone = useCallback(() => {
        if (activeIndex < total - 1) warpToMilestone(activeIndex + 1);
    }, [activeIndex, total, warpToMilestone]);

    const prevMilestone = useCallback(() => {
        if (activeIndex > 0) warpToMilestone(activeIndex - 1);
    }, [activeIndex, warpToMilestone]);

    // Keyboard Arrow navigation when timeline is in view
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const isInView = rect.top <= 150 && rect.bottom >= window.innerHeight - 150;
            if (!isInView) return;

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextMilestone();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevMilestone();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextMilestone, prevMilestone]);

    const currentMilestone = journeyMilestones[activeIndex] || journeyMilestones[0];

    return (
        <section ref={containerRef} className="chrono-timeline-section">
            <div className="chrono-sticky-stage">
                {/* ── Background Cyber Parallax Layers ── */}
                <div className="chrono-bg-warpfield">
                    <motion.div 
                        className="chrono-perspective-grid" 
                        style={{ x: bgGridX }} 
                    />
                    <motion.div 
                        className="chrono-floating-kanjis"
                        style={{ x: bgKanjiX }}
                    >
                        {journeyMilestones.map((m, idx) => (
                            <span 
                                key={m.year} 
                                className="chrono-bg-kanji-item"
                                style={{ 
                                    left: `${idx * 280 + 80}px`,
                                    color: m.accentColor
                                }}
                            >
                                {m.kanji}
                            </span>
                        ))}
                    </motion.div>
                    <div className="chrono-vignette-overlay" />
                    <div className="chrono-scanline-ambient" />
                </div>

                {/* ── Top Futuristic HUD Bar ── */}
                <div className="chrono-hud-header">
                    <div className="chrono-hud-left">
                        <div className="chrono-hud-indicator">
                            <SparklesIcon size={14} style={{ color: '#10b981', marginRight: 4 }} />
                            <span className="chrono-beacon-pulse" />
                            <span className="chrono-hud-title">CHRONO-WARP MATRIX</span>
                        </div>
                        <div className="chrono-hud-status">
                            SYSTEM ACTIVE // MATRIX COORD: <strong>{currentMilestone.year} A.D.</strong>
                        </div>
                    </div>

                    <div className="chrono-hud-center">
                        <div className="chrono-milestone-nodes">
                            {journeyMilestones.map((milestone, idx) => (
                                <button
                                    key={milestone.year}
                                    className={`chrono-node-btn ${activeIndex === idx ? 'active-node' : ''}`}
                                    onClick={() => warpToMilestone(idx)}
                                    title={`Warp to Year ${milestone.year}`}
                                >
                                    <span className="chrono-node-dot" style={{ borderColor: milestone.accentColor }} />
                                    <span className="chrono-node-label">{milestone.year}</span>
                                </button>
                            ))}
                        </div>
                        <div className="chrono-scrub-rail">
                            <motion.div 
                                className="chrono-scrub-laser" 
                                style={{ 
                                    width: laserFillWidth,
                                    background: `linear-gradient(90deg, #c28b38, ${currentMilestone.accentColor})` 
                                }}
                            />
                        </div>
                    </div>

                    <div className="chrono-hud-right">
                        <span className="chrono-index-readout">
                            NODE <strong>0{activeIndex + 1}</strong> / 0{total}
                        </span>
                        <div className="chrono-hud-nav">
                            <button 
                                className="chrono-nav-btn" 
                                onClick={prevMilestone}
                                disabled={activeIndex === 0}
                                title="Previous Memory Node (or ← key)"
                            >
                                <FaChevronLeft />
                            </button>
                            <button 
                                className="chrono-nav-btn" 
                                onClick={nextMilestone}
                                disabled={activeIndex === total - 1}
                                title="Next Memory Node (or → key)"
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Transformative 3D Parallax Horizontal Capsule Stream ── */}
                <div className="chrono-viewport-track">
                    <motion.div 
                        ref={streamRef}
                        className="chrono-cards-stream"
                        style={{ x: xTrack }}
                    >
                        {/* Connecting Cybernetic Data Cable */}
                        <div className="chrono-data-cable" />

                        {journeyMilestones.map((milestone, index) => (
                            <ChronoCard
                                key={milestone.year}
                                milestone={milestone}
                                index={index}
                                total={total}
                                smoothProgress={smoothProgress}
                                isActive={activeIndex === index}
                                onSelect={warpToMilestone}
                            />
                        ))}
                    </motion.div>
                </div>

                {/* ── Bottom HUD Footer ── */}
                <div className="chrono-hud-footer">
                    <div className="chrono-scroll-indicator">
                        <span className="chrono-arrow-pulse">▼</span>
                        <span>SCROLL VERTICALLY OR CLICK NODES TO WARP THROUGH TIME // USE ← → KEYS</span>
                    </div>
                    <div className="chrono-current-era-display">
                        <span className="chrono-era-dot" style={{ background: currentMilestone.accentColor }} />
                        <span>CURRENT ERA: <strong>{currentMilestone.era}</strong></span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChronoTimeline;
