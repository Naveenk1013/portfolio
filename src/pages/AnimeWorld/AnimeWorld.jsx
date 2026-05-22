import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { animeStats, animeReviews, hotTakes, journeyMilestones, allGenres } from '../../data/animeData';
import './AnimeWorld.css';

/* ── Animated Counter ── */
const AnimatedCounter = ({ target, duration = 2000, suffix = '' }) => {
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

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ── Star Rating ── */
const StarRating = ({ rating }) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
        <div className="aw-stars">
            {Array.from({ length: full }, (_, i) => (
                <span key={`f-${i}`} className="aw-star filled">★</span>
            ))}
            {half && <span className="aw-star half">★</span>}
            {Array.from({ length: 10 - full - (half ? 1 : 0) }, (_, i) => (
                <span key={`e-${i}`} className="aw-star empty">☆</span>
            ))}
        </div>
    );
};

/* ── Main Page ── */
const AnimeWorld = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [selectedReview, setSelectedReview] = useState(null);

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

    return (
        <div className="aw-page">
            {/* ── Halftone overlay ── */}
            <div className="aw-halftone-overlay" />

            {/* ── HERO PANEL ── */}
            <header className="aw-hero">
                <div className="aw-hero-inner">
                    <motion.div
                        className="aw-hero-badge"
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
                    >
                        SECRET LEVEL
                    </motion.div>

                    <motion.h1
                        className="aw-hero-title"
                        initial={{ y: 60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <span className="aw-hero-jp">俺のアニメの世界</span>
                        <span className="aw-hero-en">MY ANIME WORLD</span>
                    </motion.h1>

                    <motion.p
                        className="aw-hero-subtitle"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        You found the hidden portal. Welcome to my otaku dimension.
                    </motion.p>

                    {/* ── Stats Grid ── */}
                    <div className="aw-stats-grid">
                        <motion.div className="aw-stat-card"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.5 }}>
                            <span className="aw-stat-number">
                                <AnimatedCounter target={animeStats.animeWatched} suffix="+" />
                            </span>
                            <span className="aw-stat-label">Anime Watched</span>
                        </motion.div>
                        <motion.div className="aw-stat-card"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.6 }}>
                            <span className="aw-stat-number">
                                <AnimatedCounter target={animeStats.mangaChapters} suffix="+" />
                            </span>
                            <span className="aw-stat-label">Manga Chapters</span>
                        </motion.div>
                        <motion.div className="aw-stat-card"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.7 }}>
                            <span className="aw-stat-number">
                                <AnimatedCounter target={animeStats.hoursWatched} suffix="+" />
                            </span>
                            <span className="aw-stat-label">Hours Watched</span>
                        </motion.div>
                        <motion.div className="aw-stat-card"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.8 }}>
                            <span className="aw-stat-icon">🎯</span>
                            <span className="aw-stat-label">Fav: {animeStats.favoriteGenre}</span>
                        </motion.div>
                    </div>
                </div>

                {/* Decorative action lines */}
                <div className="aw-action-lines aw-action-lines-left" />
                <div className="aw-action-lines aw-action-lines-right" />
            </header>

            {/* ── REVIEWS SECTION ── */}
            <section className="aw-section aw-reviews-section">
                <div className="aw-section-header">
                    <h2 className="aw-section-title">
                        <span className="aw-title-jp">レビュー</span>
                        REVIEWS
                    </h2>
                    <div className="aw-panel-border" />
                </div>

                {/* Search & Filter */}
                <div className="aw-filters">
                    <div className="aw-search-box">
                        <span className="aw-search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search anime..."
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

                {/* Reviews Grid */}
                <motion.div className="aw-reviews-grid" layout>
                    <AnimatePresence mode="popLayout">
                        {filteredReviews.map((review, index) => (
                            <motion.div
                                key={review.id}
                                className="aw-review-card"
                                layout
                                initial={{ opacity: 0, y: 40, rotate: -2 }}
                                animate={{ opacity: 1, y: 0, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedReview(review)}
                                whileHover={{ scale: 1.03, rotate: 1 }}
                            >
                                <div className="aw-review-image-wrap">
                                    <img src={review.image} alt={review.title} className="aw-review-image" loading="lazy" />
                                    <div className="aw-review-rating-badge">{review.rating}/10</div>
                                </div>
                                <div className="aw-review-info">
                                    <h3 className="aw-review-title">{review.title}</h3>
                                    <p className="aw-review-jp-title">{review.japaneseTitle}</p>
                                    <div className="aw-review-genres">
                                        {review.genre.slice(0, 2).map(g => (
                                            <span key={g} className="aw-review-genre-chip">{g}</span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredReviews.length === 0 && (
                    <div className="aw-no-results">
                        <span className="aw-no-results-emoji">😿</span>
                        <p>No anime found. Try a different search or filter!</p>
                    </div>
                )}
            </section>

            {/* ── Review Detail Modal ── */}
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
                            className="aw-modal-content"
                            initial={{ scale: 0.7, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.7, y: 50 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className="aw-modal-close" onClick={() => setSelectedReview(null)}>✕</button>
                            <div className="aw-modal-header">
                                <img src={selectedReview.image} alt={selectedReview.title} className="aw-modal-image" />
                                <div className="aw-modal-title-block">
                                    <h2>{selectedReview.title}</h2>
                                    <p className="aw-modal-jp">{selectedReview.japaneseTitle}</p>
                                    <StarRating rating={selectedReview.rating} />
                                    <div className="aw-modal-genres">
                                        {selectedReview.genre.map(g => (
                                            <span key={g} className="aw-review-genre-chip">{g}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="aw-modal-body">
                                <div className="aw-modal-section">
                                    <h4>Synopsis</h4>
                                    <p>{selectedReview.synopsis}</p>
                                </div>
                                <div className="aw-modal-section">
                                    <h4>My Review</h4>
                                    <p className="aw-modal-review-text">{selectedReview.review}</p>
                                </div>
                                <div className="aw-modal-meta">
                                    <span>❤️ Fav Character: <strong>{selectedReview.favoriteCharacter}</strong></span>
                                    <span>📅 Watched: <strong>{selectedReview.watchedYear}</strong></span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── HOT TAKES ── */}
            <section className="aw-section aw-hottakes-section">
                <div className="aw-section-header">
                    <h2 className="aw-section-title">
                        <span className="aw-title-jp">意見</span>
                        HOT TAKES
                    </h2>
                    <div className="aw-panel-border" />
                </div>

                <div className="aw-hottakes-grid">
                    {hotTakes.map((take, index) => (
                        <motion.div
                            key={take.id}
                            className="aw-hottake-bubble"
                            initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40, rotate: index % 2 === 0 ? -5 : 5 }}
                            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ delay: index * 0.1, type: 'spring' }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <span className="aw-hottake-mood">{take.mood}</span>
                            <p className="aw-hottake-text">{take.take}</p>
                            <div className="aw-bubble-tail" />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── OTAKU JOURNEY ── */}
            <section className="aw-section aw-journey-section">
                <div className="aw-section-header">
                    <h2 className="aw-section-title">
                        <span className="aw-title-jp">旅</span>
                        OTAKU JOURNEY
                    </h2>
                    <div className="aw-panel-border" />
                </div>

                <div className="aw-timeline">
                    <div className="aw-timeline-line" />
                    {journeyMilestones.map((milestone, index) => (
                        <motion.div
                            key={milestone.year}
                            className={`aw-timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="aw-timeline-dot">
                                <span>{milestone.icon}</span>
                            </div>
                            <div className="aw-timeline-card">
                                <span className="aw-timeline-year">{milestone.year}</span>
                                <h3 className="aw-timeline-title">{milestone.title}</h3>
                                <p className="aw-timeline-desc">{milestone.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── EXIT PORTAL ── */}
            <section className="aw-section aw-exit-section">
                <motion.div
                    className="aw-exit-container"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <p className="aw-exit-text">Ready to return to reality?</p>
                    <Link to="/" className="aw-exit-btn">
                        <span className="aw-exit-jp">戻る</span>
                        <span>Return to Reality</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </Link>
                </motion.div>
            </section>
        </div>
    );
};

export default AnimeWorld;
