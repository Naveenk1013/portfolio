import { motion } from 'motion/react';
import './ProjectCard.css';

const ProjectCard = ({ project, index, onClick }) => {
    // Vary card sizes for masonry effect
    const isLarge = project.featured || index % 5 === 0;

    return (
        <motion.article
            className={`project-card ${isLarge ? 'large' : ''}`}
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={onClick}
        >
            <div className="card-image-wrapper">
                <img 
                    src={project.image} 
                    alt={project.name}
                    className="card-image"
                    loading="lazy"
                />
                <div className="card-overlay">
                    <span className="view-project">View Details</span>
                </div>
            </div>

            <div className="card-content">
                <span className={`card-category ${project.category}`}>
                    {project.category === 'application' ? '🚀 Web App' : '🌐 Website'}
                </span>
                <h3 className="card-title">{project.name}</h3>
                <p className="card-description">{project.description}</p>
                
                <div className="card-tech">
                    {project.techStack.slice(0, 3).map((tech, i) => (
                        <span key={i} className="tech-tag">{tech}</span>
                    ))}
                </div>
            </div>
        </motion.article>
    );
};

export default ProjectCard;
