import { motion } from 'motion/react';
import './ProjectDetail.css';

const ProjectDetail = ({ project, onClose }) => {
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <motion.div 
            className="detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
        >
            <motion.div 
                className="detail-modal"
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                {/* Close Button */}
                <button className="detail-close" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>

                {/* Image */}
                <div className="detail-image-wrapper">
                    <img 
                        src={project.image} 
                        alt={project.name}
                        className="detail-image"
                    />
                    <span className={`detail-category ${project.category}`}>
                        {project.category === 'application' ? '🚀 Web Application' : '🌐 Client Website'}
                    </span>
                </div>

                {/* Content */}
                <div className="detail-content">
                    <h2 className="detail-title">{project.name}</h2>
                    <p className="detail-description">{project.description}</p>

                    {/* Tech Stack */}
                    <div className="detail-section">
                        <h4 className="detail-section-title">Tech Stack</h4>
                        <div className="detail-tech">
                            {project.techStack.map((tech, i) => (
                                <span key={i} className="detail-tech-tag">{tech}</span>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="detail-actions">
                        <a 
                            href={project.liveUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="detail-btn primary"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                            Visit Live Site
                        </a>
                        <button className="detail-btn secondary" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProjectDetail;
