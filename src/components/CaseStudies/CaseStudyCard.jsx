import { motion } from 'motion/react';
import { ArrowRightIcon } from '../icons';
import './CaseStudyCard.css';

const CaseStudyCard = ({ title, subtitle, icon: Icon, color, tag, tech = [], onClick }) => {
    return (
        <motion.div 
            className="case-study-card"
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{ '--accent-color': color }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
            aria-label={`${title} - ${subtitle}`}
        >
            {/* Ambient Accent Glow */}
            <div 
                className="card-glow" 
                style={{ background: `radial-gradient(circle at 25% 25%, ${color}35 0%, transparent 70%)` }}
            />
            <div className="card-glass" />

            {/* Giant watermark brand emblem in the background */}
            {Icon && (
                <div className="card-watermark" aria-hidden="true">
                    <Icon />
                </div>
            )}

            <div className="card-content">
                {/* Top Row: Brand Logo Badge + Category Tag */}
                <div className="card-top-row">
                    <div className="card-logo-badge">
                        {Icon && <Icon className="card-brand-icon" />}
                    </div>
                    {tag && <span className="card-tag-pill">{tag}</span>}
                </div>

                {/* Bottom Row: Title, Subtitle, Tech Badges, Explore CTA */}
                <div className="card-bottom">
                    <div className="card-info">
                        <h3 className="card-title">{title}</h3>
                        <p className="card-subtitle">{subtitle}</p>
                    </div>

                    {tech && tech.length > 0 && (
                        <div className="card-tech-chips">
                            {tech.slice(0, 3).map((item, idx) => (
                                <span key={idx} className="card-tech-chip">{item}</span>
                            ))}
                        </div>
                    )}

                    <div className="card-action-row">
                        <span className="card-explore-text">Explore Case Study</span>
                        <div className="card-arrow-circle" aria-label="Open case study">
                            <ArrowRightIcon size={14} />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CaseStudyCard;

