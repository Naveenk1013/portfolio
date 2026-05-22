import { motion, AnimatePresence } from 'motion/react';
import './CaseStudyModal.css';

const CaseStudyModal = ({ isOpen, onClose, study, onViewDashboard }) => {
    if (!study) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" onClick={onClose}>
                    <motion.div 
                        className="modal-content"
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="modal-close" onClick={onClose}>&times;</button>
                        
                        <div className="modal-header">
                            <span className="modal-icon" style={{ '--accent-color': study.color }}>
                                <study.icon />
                            </span>
                            <div className="modal-title-group">
                                <h2>{study.title}</h2>
                                <p>{study.subtitle}</p>
                            </div>
                        </div>

                        <div className="modal-body">
                            <h3>Project Overview</h3>
                            <p>This is a state-of-the-art implementation of {study.title}, focusing on {study.subtitle.toLowerCase()}.</p>
                            
                            <div className="modal-tech-stack">
                                <span>React 19</span>
                                <span>Three.js</span>
                                <span>Anime.js</span>
                                <span>Framer Motion</span>
                            </div>

                            <div className="modal-action">
                                <button className="btn-primary" onClick={onViewDashboard}>View Detailed Case Study</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CaseStudyModal;
