import { useState } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { CalendarCheckIcon } from '../icons';
import CardSwap, { Card } from '../CardSwap/CardSwap';
import './Experience.css';

const experiences = [
    {
        company: 'IIHM Hyderabad',
        role: 'Assistant Professor',
        duration: 'August 2026 - Present',
        description: 'Educating and guiding students in computer fundamentals, modern web technologies, and generative AI. Designing hands-on lab curricula and mentoring technical projects.',
        skills: ['Computer Science', 'AI & Prompt Engineering', 'Web Technologies', 'Curriculum Design', 'Mentorship']
    },
    {
        company: 'Lancealot.in',
        role: 'Frontend Developer',
        duration: '2024 - Present',
        description: 'Developed user interfaces and improved user experience. Collaborated with design team to create beautiful products.',
        skills: ['Vue.js', 'CSS', 'JavaScript', 'Figma']
    },
    {
        company: 'Asia Pacific Institute of Management',
        role: 'Assistant Professor',
        duration: '2023 - 2026',
        description: 'Taught students computer fundamentals, web fundamentals, and emerging AI technologies while guiding academic coursework.',
        skills: ['HTML', 'CSS', 'Prompt Engineering', 'AI', 'Basics of Computers']
    },
    {
        company: 'Freelance',
        role: 'Web Developer & Graphic Designer',
        duration: '2021 - 2022',
        description: 'Created websites and web apps for various clients. Learned to manage projects and communicate with stakeholders.',
        skills: ['HTML', 'CSS', 'JavaScript', 'WordPress']
    }
];

// Modal component for expanded experience view
const ExperienceModal = ({ experience, index, total, onClose, onPrev, onNext }) => {
    if (!experience) return null;

    return (
        <div className="exp-modal-overlay" onClick={onClose}>
            <div className="exp-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="exp-modal-close" onClick={onClose} aria-label="Close details">
                    <FaTimes size={15} />
                </button>

                <div className="exp-modal-card" key={index}>
                    <div className="exp-modal-header">
                        <h3 className="exp-modal-company">
                            {experience.company}
                        </h3>
                        <span className="exp-modal-duration">
                            <CalendarCheckIcon size={14} style={{ marginRight: 6, verticalAlign: 'middle', display: 'inline-flex' }} />
                            {experience.duration}
                        </span>
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
                        aria-label="Previous experience"
                    >
                        <FaChevronLeft size={13} />
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
                        aria-label="Next experience"
                    >
                        <FaChevronRight size={13} />
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
                            cardDistance={42}
                            verticalDistance={52}
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

