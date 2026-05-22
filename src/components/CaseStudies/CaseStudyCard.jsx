import { motion } from 'framer-motion';
import './CaseStudyCard.css';

const CaseStudyCard = ({ title, subtitle, icon: Icon, color, onClick, children }) => {
    return (
        <motion.div 
            className="case-study-card"
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{ '--accent-color': color }}
        >
            <div className="card-glass"></div>
            <div className="card-content">
                <div className="card-icon">
                    {children ? children : <Icon />}
                </div>
                <div className="card-info">
                    <h3>{title}</h3>
                    <p>{subtitle}</p>
                </div>
                <div className="card-arrow">
                    →
                </div>
            </div>
            <div className="card-glow" style={{ background: `radial-gradient(circle at center, ${color}33 0%, transparent 70%)` }}></div>
        </motion.div>
    );
};

export default CaseStudyCard;
