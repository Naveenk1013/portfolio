import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { animeStats, animeReviews, hotTakes, journeyMilestones, allGenres } from '../../data/animeData';
import './AnimeWorld.css';

/* ── Animated Counter ── */
const AnimatedCounter = ({ target, duration = 2500 }) => {
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
                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * target));
                        if (progress < 1) requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                }
            },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    return <span ref={ref} className="aw-bounty-text">{count.toLocaleString()}{target >= 1000 ? '+' : ''}</span>;
};

/* ── Narrator Box (Storytelling Typewriter) ── */
const NarratorBox = ({ text }) => {
    const words = text.split(' ');
    return (
        <motion.div 
            className="aw-narrator-box"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                    opacity: 1, y: 0,
                    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
                }
            }}
        >
            <div className="aw-narrator-label">NARRATOR</div>
            <p className="aw-narrator-text">
                {words.map((word, i) => (
                    <motion.span 
                        key={i} 
                        style={{ display: "inline-block", marginRight: "0.25em" }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1 }
                        }}
                    >
                        {word}
                    </motion.span>
                ))}
            </p>
        </motion.div>
    );
};

/* ── "DON!!" Manga Sound Effect Easter Egg ── */
const MangaSfx = ({ x, y, active }) => (
    <AnimatePresence>
        {active && (
            <motion.div
                className="aw-manga-sfx"
                initial={{ scale: 0, opacity: 1, rotate: Math.random() * 40 - 20, x: -50, y: -50 }}
                animate={{ scale: [0, 1.5, 1], opacity: [1, 1, 0] }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ left: x, top: y, position: 'absolute' }}
            >
                <div className="aw-sfx-text">ドン!!</div>
                <div className="aw-sfx-subtext">DON!!</div>
            </motion.div>
        )}
    </AnimatePresence>
);

/* ── Main Page ── */
const AnimeWorld = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [selectedReview, setSelectedReview] = useState(null);
    const [sfxList, setSfxList] = useState([]);

    // Filter reviews
    const filteredReviews = animeReviews.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = selectedGenre === 'All' || r.genre.includes(selectedGenre);
        return matchesSearch && matchesGenre;
    });

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const triggerDonSfx = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const newSfx = {
            id: Date.now(),
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        setSfxList(prev => [...prev, newSfx]);
        setTimeout(() => {
            setSfxList(prev => prev.filter(s => s.id !== newSfx.id));
        }, 800);
    };

    return (
        <div className="aw-manga-page">
            {/* ── Manga Halftone Overlay ── */}
            <div className="aw-halftone-dots" />
            <div className="aw-speed-lines" />

            {/* ── HERO PANEL ── */}
            <header className="aw-manga-hero">
                <div className="aw-hero-inner">
                    <motion.div
                        className="aw-hero-badge"
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                    >
                        CHAPTER 1: THE SECRET LEVEL
                    </motion.div>

                    <motion.h1
                        className="aw-manga-title"
                        initial={{ y: 60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <span className="aw-title-jp">偉大なる航路</span>
                        <span className="aw-title-en">GRAND LINE</span>
                    </motion.h1>

                    <motion.p
                        className="aw-manga-subtitle"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        Welcome to my otaku dimension. Set sail for adventure!
                    </motion.p>

                    {/* Hidden Jolly Roger Easter Egg */}
                    <motion.div 
                        className="aw-jolly-roger-egg"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        onClick={triggerDonSfx}
                    >
                        ☠️
                        {sfxList.map(sfx => (
                            <MangaSfx key={sfx.id} x={sfx.x} y={sfx.y} active={true} />
                        ))}
                    </motion.div>

                    {/* ── Action Stats ── */}
                    <div className="aw-bounty-grid">
                        <motion.div className="aw-bounty-card"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.5 }}>
                            <span className="aw-bounty-label">ANIME WATCHED</span>
                            <AnimatedCounter target={animeStats.animeWatched} />
                        </motion.div>
                        <motion.div className="aw-bounty-card"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.6 }}>
                            <span className="aw-bounty-label">MANGA CHAPTERS</span>
                            <AnimatedCounter target={animeStats.mangaChapters} />
                        </motion.div>
                        <motion.div className="aw-bounty-card"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.7 }}>
                            <span className="aw-bounty-label">HOURS LOGGED</span>
                            <AnimatedCounter target={animeStats.hoursWatched} />
                        </motion.div>
                    </div>
                </div>
            </header>

            <NarratorBox text="The Grand Line is treacherous... countless anime and manga await out there in the vast ocean of content. Here is the crew of targets I've encountered so far..." />

            {/* ── WANTED POSTERS SECTION ── */}
            <section className="aw-section aw-wanted-section">
                <div className="aw-manga-header">
                    <h2 className="aw-manga-heading">WANTED CREW</h2>
                    <div className="aw-ink-slash" />
                </div>

                <div className="aw-filters manga-filters">
                    <div className="aw-search-box">
                        <input
                            type="text"
                            placeholder="Find target..."
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
                                onClick={() => setSelectedGenre(genre)}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>

                <motion.div className="aw-wanted-grid" layout>
                    <AnimatePresence mode="popLayout">
                        {filteredReviews.map((review, index) => (
                            <motion.div
                                key={review.id}
                                className="aw-wanted-poster"
                                layout
                                initial={{ opacity: 0, scale: 0.8, rotate: Math.random() * 10 - 5 }}
                                animate={{ opacity: 1, scale: 1, rotate: Math.random() * 6 - 3 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ delay: index * 0.1, type: "spring" }}
                                onClick={() => setSelectedReview(review)}
                                whileHover={{ scale: 1.05, zIndex: 10, rotate: 0 }}
                            >
                                <div className="aw-wanted-header">WANTED</div>
                                <div className="aw-wanted-dead-alive">DEAD OR ALIVE</div>
                                <div className="aw-wanted-image-wrap">
                                    <img src={review.image} alt={review.title} className="aw-wanted-image" loading="lazy" />
                                </div>
                                <h3 className="aw-wanted-name">{review.title.toUpperCase()}</h3>
                                <div className="aw-wanted-bounty aw-power-level">
                                    PWR: {review.rating}/10
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </section>

            {/* ── Review Detail Modal (Manga Panel Style) ── */}
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
                            initial={{ scale: 0.8, rotate: 10, y: 100 }}
                            animate={{ scale: 1, rotate: 0, y: 0 }}
                            exit={{ scale: 0.8, rotate: -10, y: 100 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="aw-modal-panel-layout">
                                <button className="aw-modal-close" onClick={() => setSelectedReview(null)}>✕</button>
                                <div className="aw-modal-panel aw-panel-image">
                                    <img src={selectedReview.image} alt={selectedReview.title} />
                                    <div className="aw-manga-overlay" />
                                </div>
                                <div className="aw-modal-panel aw-panel-info">
                                    <h2>{selectedReview.title}</h2>
                                    <p className="aw-jp-text">{selectedReview.japaneseTitle}</p>
                                    <div className="aw-bounty-stamp aw-power-stamp">THREAT LEVEL: {selectedReview.rating >= 9 ? 'S-CLASS' : selectedReview.rating >= 8 ? 'A-CLASS' : 'B-CLASS'}</div>
                                    <div className="aw-modal-genres">
                                        {selectedReview.genre.map(g => (
                                            <span key={g} className="aw-genre-ink">{g}</span>
                                        ))}
                                    </div>
                                    <p className="aw-synopsis">{selectedReview.synopsis}</p>
                                </div>
                                <div className="aw-modal-panel aw-panel-review">
                                    <h4>MY LOG POSE READING:</h4>
                                    <p>{selectedReview.review}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <NarratorBox text="Not everyone agrees with my Log Pose readings... but out here on the open seas, a pirate stands by his hot takes!" />

            {/* ── HOT TAKES (Speech Bubbles) ── */}
            <section className="aw-section aw-speech-section">
                <div className="aw-manga-header">
                    <h2 className="aw-manga-heading">LOUD THOUGHTS</h2>
                    <div className="aw-ink-slash" />
                </div>

                <div className="aw-speech-grid">
                    {hotTakes.map((take, index) => (
                        <motion.div
                            key={take.id}
                            className={`aw-speech-bubble ${index % 2 === 0 ? 'bubble-left' : 'bubble-right'}`}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ type: 'spring', bounce: 0.5, delay: index * 0.1 }}
                        >
                            <span className="aw-mood-tag">[{take.mood}]</span>
                            <p className="aw-speech-text">"{take.take}"</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <NarratorBox text="Every pirate has an origin story... a timeline of arcs that shaped them into who they are today. This is the story of my Otaku Journey." />

            {/* ── OTAKU JOURNEY (Manga Pages) ── */}
            <section className="aw-section aw-journey-pages">
                <div className="aw-manga-header">
                    <h2 className="aw-manga-heading">MY STORY ARC</h2>
                    <div className="aw-ink-slash" />
                </div>

                <div className="aw-comic-page">
                    {journeyMilestones.map((milestone, index) => (
                        <motion.div
                            key={milestone.year}
                            className={`aw-comic-panel panel-type-${(index % 3) + 1}`}
                            initial={{ opacity: 0, filter: 'blur(10px)' }}
                            whileInView={{ opacity: 1, filter: 'blur(0px)' }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="aw-panel-content">
                                <span className="aw-panel-icon">{milestone.icon}</span>
                                <span className="aw-panel-year">ARC {milestone.year}</span>
                                <h3 className="aw-panel-title">{milestone.title}</h3>
                                <p className="aw-panel-desc">{milestone.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── GOMU GOMU EXIT PORTAL ── */}
            <section className="aw-section aw-exit-section">
                <motion.div
                    className="aw-gomu-container"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <p className="aw-manga-text">To be continued...</p>
                    <Link to="/" className="aw-gomu-btn">
                        <span className="aw-gomu-inner">GOMU GOMU NO RETURN!</span>
                    </Link>
                </motion.div>
            </section>
        </div>
    );
};

export default AnimeWorld;
