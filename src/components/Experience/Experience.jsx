import { useState } from 'react';
import CardSwap, { Card } from '../CardSwap/CardSwap';
import './Experience.css';

const experiences = [

    {
        company: 'Startup Inc',
        role: 'Frontend Developer at Lancealot.in',
        duration: '2024 - Present',
        description: 'Developed user interfaces and improved user experience. Collaborated with design team to create beautiful products.',
        skills: ['Vue.js', 'CSS', 'JavaScript', 'Figma']
    },
    {
        company: 'Freelance',
        role: 'Web Developer and Graphic designer',
        duration: '2021 - 2022',
        description: 'Created websites and web apps for various clients. Learned to manage projects and communicate with stakeholders.',
        skills: ['HTML', 'CSS', 'JavaScript', 'WordPress']
    },

    {
        company: 'Assistant professor',
        role: 'Assistant professor at Asia pacific Institute of Management',
        duration: '2023 - Present',
        description: 'Teaching students and guiding them in their studies.',
        skills: ['HTML', 'CSS', 'Prompt Engineering', 'AI', 'basics of computers']
    }
];

// Modal component for expanded experience view
const ExperienceModal = ({ experience, index, total, onClose, onPrev, onNext }) => {
    if (!experience) return null;

    return (
        <div className="exp-modal-overlay" onClick={onClose}>
            <div className="exp-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="exp-modal-close" onClick={onClose}>×</button>

                <div className="exp-modal-card" key={index}>
                    <div className="exp-modal-header">
                        <h3 className="exp-modal-company">{experience.company}</h3>
                        <span className="exp-modal-duration">{experience.duration}</span>
                    </div>
                    <p className="exp-modal-role">{experience.role}</p>
                    <p className="exp-modal-description">{experience.description}</p>
                    <div className="exp-modal-skills">
                        {experience.skills.map((skill, i) => (
                            <span key={i} className="exp-modal-skill-tag">{skill}</span>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="exp-modal-nav">
                    <button
                        className="exp-modal-nav-btn exp-modal-prev"
                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                        disabled={index === 0}
                    >
                        ‹
                    </button>
                    <div className="exp-modal-indicators">
                        {Array.from({ length: total }).map((_, i) => (
                            <span
                                key={i}
                                className={`exp-modal-dot ${i === index ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                    <button
                        className="exp-modal-nav-btn exp-modal-next"
                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                        disabled={index === total - 1}
                    >
                        ›
                    </button>
                </div>
            </div>
        </div>
    );
};

const Experience = () => {
    const [expandedIndex, setExpandedIndex] = useState(-1);

    const handleCardClick = (index) => {
        setExpandedIndex(index);
    };

    const handleCloseModal = () => {
        setExpandedIndex(-1);
    };

    const handlePrev = () => {
        if (expandedIndex > 0) {
            setExpandedIndex(expandedIndex - 1);
        }
    };

    const handleNext = () => {
        if (expandedIndex < experiences.length - 1) {
            setExpandedIndex(expandedIndex + 1);
        }
    };

    return (
        <section className="experience" id="experience">
            <div className="experience-container">
                <div className="experience-header">
                    <h2 className="experience-title">Experience</h2>
                    <p className="experience-subtitle">Click to expand</p>
                </div>

                <div className="experience-content">
                    <div className="experience-cards">
                        <CardSwap
                            width={420}
                            height={320}
                            cardDistance={50}
                            verticalDistance={60}
                            delay={4000}
                            pauseOnHover={true}
                            skewAmount={4}
                            easing="elastic"
                            onCardClick={handleCardClick}
                        >
                            {experiences.map((exp, index) => (
                                <Card key={index}>
                                    <div className="exp-card-header">
                                        <h3 className="exp-card-company">{exp.company}</h3>
                                        <span className="exp-card-duration">{exp.duration}</span>
                                    </div>
                                    <p className="exp-card-role">{exp.role}</p>
                                    <p className="exp-card-description">{exp.description}</p>
                                    <div className="exp-card-skills">
                                        {exp.skills.map((skill, i) => (
                                            <span key={i} className="exp-skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </Card>
                            ))}
                        </CardSwap>
                    </div>
                </div>
            </div>

            {/* Modal for expanded view */}
            {expandedIndex >= 0 && (
                <ExperienceModal
                    experience={experiences[expandedIndex]}
                    index={expandedIndex}
                    total={experiences.length}
                    onClose={handleCloseModal}
                    onPrev={handlePrev}
                    onNext={handleNext}
                />
            )}
        </section>
    );
};

export default Experience;

