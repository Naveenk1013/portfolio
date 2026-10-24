import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
    FaAnchor, FaBolt, 
    FaExclamation, FaCommentDots, FaSkullCrossbones, FaTimes, 
    FaTv, FaBook, FaShieldAlt, FaFeatherAlt, 
    FaMountain, FaGraduationCap,
    FaQuoteLeft, FaShareAlt, FaCheck
} from 'react-icons/fa';
import { 
    VolumeIcon, 
    CompassIcon, 
    FlameIcon, 
    ZapIcon, 
    SparklesIcon, 
    SearchIcon, 
    RocketIcon, 
    HeartIcon 
} from '../../components/icons';
import { animeStats, animeReviews, hotTakes, journeyMilestones, allGenres } from '../../data/animeData';
import { animeAudio } from '../../utils/animeAudio';
import './AnimeWorld.css';
import AnimeAssessor from './AnimeAssessor';
import ChronoTimeline from './ChronoTimeline';

/* ── Milestone Icon Resolver ── */
const getMilestoneIcon = (iconKey) => {
    switch (iconKey) {
        case 'tv': return <FaTv />;
        case 'book': return <FaBook />;
        case 'bolt': return <ZapIcon size={16} />;
        case 'sword': return <FaShieldAlt />;
        case 'feather': return <FaFeatherAlt />;
        case 'mountain': return <FaMountain />;
        case 'graduate': return <FaGraduationCap />;
        default: return <FlameIcon size={16} />;
    }
};

/* ── Animated Bounty Counter ── */
const AnimatedCounter = ({ target, duration = 2200, prefix = '' }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const start = performance.now();
                    const step = (now) => {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * target));
                        if (progress < 1) requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    return (
        <span ref={ref} className="aw-bounty-text">
            {prefix}{count.toLocaleString()}{target >= 1000 ? '+' : ''}
        </span>
    );
};

/* ── Audio Control Widget (Den-Den Mushi) ── */
const DenDenAudioWidget = () => {
    const [soundOn, setSoundOn] = useState(animeAudio.isEnabled());

    const toggleSound = () => {
        const newState = animeAudio.toggle();
        setSoundOn(newState);
    };

    return (
        <button 
            className={`aw-denden-widget ${soundOn ? 'sound-active' : 'sound-muted'}`}
            onClick={toggleSound}
            title={soundOn ? 'Mute Anime SFX' : 'Enable Anime SFX'}
        >
            <span className="aw-denden-icon">
                <VolumeIcon size={18} isActive={soundOn} className="aw-denden-svg" />
            </span>
            <div className="aw-denden-info">
                <span className="aw-denden-label">COMM LINK</span>
                <span className="aw-denden-status">
                    {soundOn ? 'AUDIO: BROADCASTING' : 'AUDIO: MUTED'}
                </span>
            </div>
            {soundOn && (
                <div className="aw-sound-waves">
                    <span className="wave w1" />
                    <span className="wave w2" />
                    <span className="wave w3" />
                </div>
            )}
        </button>
    );
};

/* ── Interactive 3D Wanted Poster Card ── */
const WantedPoster = ({ review, onSelect, onTriggerSfx }) => {
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0, sheenX: 50, sheenY: 50 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / rect.width;
        const yPct = mouseY / rect.height;

        // Max tilt +/- 12 degrees
        const tiltX = (yPct - 0.5) * -20;
        const tiltY = (xPct - 0.5) * 20;

        setTilt({
            x: tiltX,
            y: tiltY,
            sheenX: xPct * 100,
            sheenY: yPct * 100
        });
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTilt({ x: 0, y: 0, sheenX: 50, sheenY: 50 });
    };

    const handleClick = (e) => {
        animeAudio.playDonImpact();
        onTriggerSfx(e, 'DON!!', 'ドン!!');
        onSelect(review);
    };

    return (
        <motion.div
            ref={cardRef}
            className="aw-wanted-poster-wrap"
            layout
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20 }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{
                transform: isHovered 
                    ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-8px) scale(1.03)`
                    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
                transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out'
            }}
        >
            <div className="aw-wanted-poster">
                {/* Vintage Paper Texture & Sheen */}
                <div 
                    className="aw-card-sheen"
                    style={{
                        background: `radial-gradient(circle at ${tilt.sheenX}% ${tilt.sheenY}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
                        opacity: isHovered ? 1 : 0
                    }}
                />

                {/* Marine Anchor Crest Watermark */}
                <div className="aw-marine-crest">
                    <FaAnchor className="aw-marine-anchor-icon" /> MARINE ARCHIVE
                </div>

                {/* Header */}
                <div className="aw-wanted-header">WANTED</div>
                <div className="aw-wanted-dead-alive">DEAD OR ALIVE</div>

                {/* Character Image */}
                <div className="aw-wanted-image-wrap">
                    <img 
                        src={review.image} 
                        alt={review.title} 
                        className="aw-wanted-image" 
                        loading="lazy" 
                    />
                    <div className="aw-halftone-screentone" />
                    <span className="aw-poster-threat-tag">{review.threatLevel || 'S-CLASS'}</span>
                </div>

                {/* Title */}
                <h3 className="aw-wanted-name">{review.title.toUpperCase()}</h3>
                <span className="aw-wanted-jp-sub">{review.japaneseTitle}</span>

                {/* Bounty in Berries */}
                <div className="aw-wanted-bounty">
                    <span className="aw-berry-symbol">฿</span>
                    <span className="aw-bounty-figure">{review.bountyFormatted || '3,000,000,000'}</span>
                    <span className="aw-dash-stamp">-</span>
                </div>

                {/* Marine Bottom Stamp */}
                <div className="aw-marine-footer">
                    <span>KONOMISHO WA SEKAI SEIFU</span>
                    <span className="aw-seal-stamp">SEALED</span>
                </div>
            </div>
        </motion.div>
    );
};

/* ── Interactive Hot Takes Card ── */
const InteractiveHotTake = ({ take, index, onTriggerSfx }) => {
    const storageKey = `hot-take-votes-${take.id}`;
    const [votes, setVotes] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : { agree: 14 + index * 7, nani: 9 + index * 4, baka: 4 + index * 2 };
        } catch {
            return { agree: 14, nani: 9, baka: 4 };
        }
    });
    const [userVoteChoice, setUserVoteChoice] = useState(() => {
        try {
            return localStorage.getItem(`hot-take-choice-${take.id}`) || null;
        } catch {
            return null;
        }
    });
    const [copied, setCopied] = useState(false);
    const [localBursts, setLocalBursts] = useState([]);

    const handleVote = (e, type) => {
        e.stopPropagation();
        
        // Distinctive sound effect per reaction
        if (type === 'agree') {
            animeAudio.playHakiCharge(3);
        } else if (type === 'nani') {
            animeAudio.playKatanaSlash();
        } else {
            animeAudio.playDonImpact();
        }
        
        const label = type === 'agree' ? 'AGREE!!' : type === 'nani' ? 'NANI?!' : 'OBJECTION!!';
        const jpSfx = type === 'agree' ? '同感!!' : type === 'nani' ? '何?!' : '異議あり!!';
        onTriggerSfx(e, label, jpSfx);
        
        // Trigger local mini-burst feedback
        const burstId = Date.now() + Math.random();
        setLocalBursts(prev => [...prev, { id: burstId, text: jpSfx }]);
        setTimeout(() => {
            setLocalBursts(prev => prev.filter(b => b.id !== burstId));
        }, 1200);

        setVotes(prev => {
            const updated = { ...prev, [type]: prev[type] + 1 };
            try {
                localStorage.setItem(storageKey, JSON.stringify(updated));
                localStorage.setItem(`hot-take-choice-${take.id}`, type);
            } catch {}
            return updated;
        });
        setUserVoteChoice(type);
    };

    const handleCopyTake = (e) => {
        e.stopPropagation();
        const quoteText = `"${take.take}" — ${take.anime} [Lancealot Anime Archives]`;
        navigator.clipboard?.writeText(quoteText);
        setCopied(true);
        animeAudio.playDenDenMushi();
        onTriggerSfx(e, 'LOGGED!', '記録完了!!');
        setTimeout(() => setCopied(false), 2400);
    };

    return (
        <motion.div
            className={`aw-speech-bubble ${index % 2 === 0 ? 'bubble-left' : 'bubble-right'}`}
            initial={{ opacity: 0, scale: 0.92, y: 35 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', bounce: 0.35, delay: index * 0.08 }}
        >
            {/* Manga Anime Visual Header Banner */}
            <div className="aw-take-banner">
                <img 
                    src={take.image} 
                    alt={take.anime} 
                    className="aw-take-banner-img" 
                    loading="lazy" 
                />
                <div className="aw-take-screentone" />
                <div className="aw-take-banner-vignette" />
                
                {/* Banner Top Bar */}
                <div className="aw-banner-top-bar">
                    <span className="aw-mood-tag">{take.category}</span>
                    <div className="aw-banner-actions">
                        <span className="aw-sfx-stamp">{take.japaneseSfx}</span>
                        <button 
                            className={`aw-take-copy-btn ${copied ? 'copied' : ''}`}
                            onClick={handleCopyTake}
                            title="Copy Hot Take Quote"
                        >
                            {copied ? <FaCheck size={11} /> : <FaShareAlt size={11} />}
                            <span>{copied ? 'LOGGED' : 'SHARE'}</span>
                        </button>
                    </div>
                </div>

                {/* Banner Bottom Bar */}
                <div className="aw-banner-bottom-bar">
                    <div className="aw-take-anime-info">
                        <span className="aw-take-anime-name">{take.anime}</span>
                        <span className="aw-take-jp-title">{take.japaneseTitle}</span>
                    </div>
                    <span className="aw-take-log-id">LOG #{String(take.id).padStart(2, '0')}</span>
                </div>
            </div>

            {/* Micro-Element: Controversy Heat Gauge */}
            <div className="aw-take-spice-meter">
                <div className="aw-spice-header">
                    <div className="aw-spice-label">
                        <FlameIcon size={14} className="aw-spice-flame-icon" />
                        <span>HEAT: <strong>{take.heatLevel}%</strong> • {take.heatLabel}</span>
                    </div>
                    <span className="aw-verdict-badge">{take.verdictTag}</span>
                </div>
                <div className="aw-spice-track">
                    <motion.div 
                        className="aw-spice-bar"
                        style={{ width: `${take.heatLevel}%` }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${take.heatLevel}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.2 + index * 0.05, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Speech Content Body */}
            <div className="aw-take-body">
                <FaQuoteLeft className="aw-quote-glyph" />
                <p className="aw-speech-text">"{take.take}"</p>
                <div className="aw-take-footer-meta">
                    <span className="aw-sfx-roman-badge">SFX: {take.sfxRoman}</span>
                    <span className="aw-total-clashes">
                        {votes.agree + votes.nani + votes.baka} DEBATES RECORDED
                    </span>
                </div>
            </div>

            {/* Manga Speech Bubble Tail */}
            <div className="aw-bubble-tail" />

            {/* Interactive Tactile Reaction Buttons */}
            <div className="aw-take-actions">
                <button 
                    className={`aw-vote-btn aw-btn-agree ${userVoteChoice === 'agree' ? 'active-voted' : ''}`}
                    onClick={(e) => handleVote(e, 'agree')}
                >
                    <HeartIcon size={15} className="aw-vote-icon" />
                    <span className="aw-btn-label">AGREE <small className="aw-jp-sub">同感</small></span>
                    <span className="aw-vote-count count-agree">{votes.agree}</span>
                </button>
                <button 
                    className={`aw-vote-btn aw-btn-nani ${userVoteChoice === 'nani' ? 'active-voted' : ''}`}
                    onClick={(e) => handleVote(e, 'nani')}
                >
                    <ZapIcon size={15} className="aw-vote-icon" />
                    <span className="aw-btn-label">NANI?! <small className="aw-jp-sub">何?!</small></span>
                    <span className="aw-vote-count count-nani">{votes.nani}</span>
                </button>
                <button 
                    className={`aw-vote-btn aw-btn-debate ${userVoteChoice === 'baka' ? 'active-voted' : ''}`}
                    onClick={(e) => handleVote(e, 'baka')}
                >
                    <FaCommentDots className="aw-vote-icon" />
                    <span className="aw-btn-label">DEBATE <small className="aw-jp-sub">異議あり</small></span>
                    <span className="aw-vote-count count-debate">{votes.baka}</span>
                </button>
            </div>

            {/* Local Animated SFX Burst on Vote */}
            <AnimatePresence>
                {localBursts.map(burst => (
                    <motion.div
                        key={burst.id}
                        className="aw-local-burst"
                        initial={{ opacity: 0, scale: 0.5, y: 0 }}
                        animate={{ opacity: 1, scale: 1.25, y: -28 }}
                        exit={{ opacity: 0, scale: 1.6, y: -45 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        {burst.text}
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
};

/* ── Main Anime World Page ── */
const AnimeWorld = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [selectedReview, setSelectedReview] = useState(null);
    const [sfxList, setSfxList] = useState([]);
    const [isExiting, setIsExiting] = useState(false);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Filter reviews
    const filteredReviews = animeReviews.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = selectedGenre === 'All' || r.genre.includes(selectedGenre);
        return matchesSearch && matchesGenre;
    });

    // Spawn Japanese Manga sound effect sticker at click position
    const triggerMangaSfx = (e, enText = 'DON!!', jpText = 'ドン!!') => {
        const newSfx = {
            id: Date.now() + Math.random(),
            x: e.clientX,
            y: e.clientY + window.scrollY,
            en: enText,
            jp: jpText,
            rot: (Math.random() * 30 - 15).toFixed(1)
        };
        setSfxList(prev => [...prev.slice(-8), newSfx]);
        setTimeout(() => {
            setSfxList(prev => prev.filter(s => s.id !== newSfx.id));
        }, 900);
    };

    const handleJollyRogerClick = (e) => {
        animeAudio.playDonImpact();
        animeAudio.playKatanaSlash();
        triggerMangaSfx(e, 'KING OF PIRATES!!', '海賊王に俺はなる!!');
    };

    // Exit back to real world with Rubber snap effect
    const handleGomuGomuReturn = () => {
        setIsExiting(true);
        animeAudio.playRubberSnap();
        setTimeout(() => {
            navigate('/');
        }, 600);
    };

    return (
        <div className={`aw-manga-page ${isExiting ? 'aw-gomu-warp-exit' : ''}`}>
            {/* Audio Toggle Floating Widget */}
            <DenDenAudioWidget />

            {/* Manga Halftone Overlay & Speedlines */}
            <div className="aw-halftone-dots" />
            <div className="aw-speed-lines" />

            {/* Dynamic Japanese Sound Effect Burst Layer */}
            <AnimatePresence>
                {sfxList.map(sfx => (
                    <motion.div
                        key={sfx.id}
                        className="aw-dynamic-sfx"
                        initial={{ scale: 0, opacity: 1, rotate: sfx.rot }}
                        animate={{ scale: [0, 1.4, 1.1], opacity: [1, 1, 0] }}
                        transition={{ duration: 0.85, ease: 'easeOut' }}
                        style={{ left: sfx.x, top: sfx.y }}
                    >
                        <span className="aw-sfx-kanji">{sfx.jp}</span>
                        <span className="aw-sfx-roman">{sfx.en}</span>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* ── HERO PANEL ── */}
            <header className="aw-manga-hero">
                <div className="aw-hero-inner">
                    <motion.div
                        className="aw-hero-badge"
                        initial={{ scale: 0, rotate: -8 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 220, delay: 0.2 }}
                    >
                        <SparklesIcon size={14} style={{ marginRight: 6 }} /> CHAPTER 1: THE SECRET REALM
                    </motion.div>

                    <motion.h1
                        className="aw-manga-title"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <span className="aw-title-jp">偉大なる航路</span>
                        <span className="aw-title-en">GRAND LINE</span>
                    </motion.h1>

                    <motion.p
                        className="aw-manga-subtitle"
                        initial={{ y: 25, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        Welcome to my Otaku Dimension. Sail through my highest-rated anime & manga logs!
                    </motion.p>

                    {/* Jolly Roger Easter Egg */}
                    <motion.div 
                        className="aw-jolly-roger-egg"
                        whileHover={{ scale: 1.15, rotate: 12 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleJollyRogerClick}
                        title="Click to unleash Conqueror's Haki!"
                    >
                        <FaSkullCrossbones className="aw-jolly-roger-svg" />
                    </motion.div>

                    {/* Action Stats / Bounties */}
                    <div className="aw-bounty-grid">
                        <motion.div 
                            className="aw-bounty-card"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.4 }}
                        >
                            <span className="aw-bounty-label">ANIME ARCHIVED</span>
                            <AnimatedCounter target={animeStats.animeWatched} prefix="฿ " />
                        </motion.div>
                        <motion.div 
                            className="aw-bounty-card"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.5 }}
                        >
                            <span className="aw-bounty-label">MANGA CHAPTERS</span>
                            <AnimatedCounter target={animeStats.mangaChapters} prefix="฿ " />
                        </motion.div>
                        <motion.div 
                            className="aw-bounty-card"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.6 }}
                        >
                            <span className="aw-bounty-label">HOURS LOGGED</span>
                            <AnimatedCounter target={animeStats.hoursWatched} prefix="฿ " />
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* Narrator Intro */}
            <div className="aw-narrator-box">
                <div className="aw-narrator-label">NARRATOR</div>
                <p className="aw-narrator-text">
                    "The sea is boundless, and so is the pursuit of legendary stories. Inspect the Marine Wanted posters below to view my verified ratings and character logs."
                </p>
            </div>

            {/* ── WANTED POSTERS SECTION ── */}
            <section className="aw-section aw-wanted-section">
                <div className="aw-manga-header">
                    <h2 className="aw-manga-heading">WANTED TARGETS</h2>
                    <div className="aw-ink-slash" />
                </div>

                {/* Filters */}
                <div className="aw-filters manga-filters">
                    <div className="aw-search-box">
                        <SearchIcon size={20} className="aw-search-svg-icon" />
                        <input
                            type="text"
                            placeholder="Search anime targets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="aw-search-input"
                        />
                    </div>
                    <div className="aw-genre-tags">
                        {allGenres.map(genre => (
                            <button
                                key={genre}
                                className={`aw-genre-tag ${selectedGenre === genre ? 'active' : ''}`}
                                onClick={() => {
                                    animeAudio.playDenDenMushi();
                                    setSelectedGenre(genre);
                                }}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Wanted Posters Grid */}
                <motion.div className="aw-wanted-grid" layout>
                    <AnimatePresence mode="popLayout">
                        {filteredReviews.map((review) => (
                            <WantedPoster
                                key={review.id}
                                review={review}
                                onSelect={setSelectedReview}
                                onTriggerSfx={triggerMangaSfx}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            </section>

            {/* ── MANGA MODAL: Log Pose Reading ── */}
            <AnimatePresence>
                {selectedReview && (
                    <motion.div
                        className="aw-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedReview(null)}
                    >
                        <motion.div
                            className="aw-manga-modal"
                            initial={{ scale: 0.8, rotate: 6, y: 80 }}
                            animate={{ scale: 1, rotate: 0, y: 0 }}
                            exit={{ scale: 0.8, rotate: -6, y: 80 }}
                            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="aw-modal-panel-layout">
                                <button 
                                    className="aw-modal-close" 
                                    onClick={() => setSelectedReview(null)}
                                    title="Close Archive"
                                >
                                    <FaTimes />
                                </button>
                                
                                <div className="aw-modal-panel aw-panel-image">
                                    <img src={selectedReview.image} alt={selectedReview.title} />
                                    <div className="aw-manga-overlay" />
                                    <div className="aw-bounty-ribbon">
                                        ฿ {selectedReview.bountyFormatted}
                                    </div>
                                </div>

                                <div className="aw-modal-panel aw-panel-info">
                                    <h2>{selectedReview.title}</h2>
                                    <p className="aw-jp-text">{selectedReview.japaneseTitle}</p>
                                    
                                    <div className="aw-bounty-stamp aw-power-stamp">
                                        {selectedReview.threatLevel || 'S-CLASS THREAT'} • PWR: {selectedReview.rating}/10
                                    </div>

                                    <div className="aw-modal-genres">
                                        {selectedReview.genre.map(g => (
                                            <span key={g} className="aw-genre-ink">{g}</span>
                                        ))}
                                    </div>

                                    <p className="aw-synopsis">{selectedReview.synopsis}</p>

                                    {selectedReview.favoriteCharacter && (
                                        <div className="aw-favorite-char">
                                            <strong>MVP CHARACTER:</strong> {selectedReview.favoriteCharacter}
                                        </div>
                                    )}
                                </div>

                                <div className="aw-modal-panel aw-panel-review">
                                    <h4>MY LOG POSE READING:</h4>
                                    <p className="aw-review-quote">"{selectedReview.review}"</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Narrator Divider */}
            <div className="aw-narrator-box">
                <div className="aw-narrator-label">NARRATOR</div>
                <p className="aw-narrator-text">
                    "A pirate speaks his mind without fear of the World Government. These are my unfiltered anime hot takes. Vote on whether you stand with me or prepare to duel!"
                </p>
            </div>

            {/* ── HOT TAKES SECTION ── */}
            <section className="aw-section aw-speech-section">
                <div className="aw-manga-header">
                    <h2 className="aw-manga-heading">LOUD THOUGHTS</h2>
                    <div className="aw-ink-slash" />
                </div>

                <div className="aw-speech-grid">
                    {hotTakes.map((take, index) => (
                        <InteractiveHotTake
                            key={take.id}
                            take={take}
                            index={index}
                            onTriggerSfx={triggerMangaSfx}
                        />
                    ))}
                </div>
            </section>

            {/* Narrator Divider */}
            <div className="aw-narrator-box">
                <div className="aw-narrator-label">NARRATOR</div>
                <p className="aw-narrator-text">
                    "Every legend has an origin story. From CRT televisions watching Goku power up to building modern web applications. Here is my Otaku Timeline."
                </p>
            </div>

            {/* ── FUTURISTIC 3D PARALLAX STORY ARC ── */}
            <div className="aw-story-arc-wrapper">
                <div className="aw-manga-header" style={{ marginBottom: '16px' }}>
                    <div className="aw-cyber-badge">時空回廊 // CHRONO-WARP MATRIX</div>
                    <h2 className="aw-manga-heading">MY STORY ARC</h2>
                    <div className="aw-ink-slash" />
                    <p className="aw-story-arc-sub">
                        Scroll vertically to initiate temporal hyper-drive across 19+ years of Otaku evolution
                    </p>
                </div>
                <ChronoTimeline />
            </div>

            {/* Narrator Divider */}
            <div className="aw-narrator-box">
                <div className="aw-narrator-label">NARRATOR</div>
                <p className="aw-narrator-text">
                    "Enough of my stories. Are you worthy to enter the New World? Search and log your completed anime below, and let the Elders assess your soul and issue your personal Marine Bounty!"
                </p>
            </div>

            {/* ── TASTE ASSESSOR SECTION ── */}
            <AnimeAssessor onTriggerSfx={triggerMangaSfx} />

            {/* ── GOMU GOMU EXIT PORTAL ── */}
            <section className="aw-section aw-exit-section">
                <motion.div
                    className="aw-gomu-container"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <p className="aw-manga-text">To be continued in the primary dimension...</p>
                    <button 
                        onClick={handleGomuGomuReturn} 
                        className="aw-gomu-btn"
                        title="Return to main portfolio"
                    >
                        <span className="aw-gomu-inner">
                            <CompassIcon size={22} className="aw-return-icon" /> RETURN TO PORTFOLIO
                        </span>
                    </button>
                </motion.div>
            </section>
        </div>
    );
};

export default AnimeWorld;
