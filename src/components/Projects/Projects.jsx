import { Link } from 'react-router-dom';
import { projects } from '../../data/projectsData';
import './Projects.css';

const featuredProjects = projects.filter(p => p.featured).slice(0, 3);

const Projects = () => {
    return (
        <section className="projects" id="projects">
            <div className="projects-container">
                <div className="projects-header">
                    <h2 className="projects-title">Featured Projects</h2>
                    <p className="projects-subtitle">A glimpse of what I've built</p>
                </div>

                {/* Featured Projects Grid */}
                <div className="featured-grid">
                    {featuredProjects.map((project, index) => (
                        <motion.a
                            key={project.id}
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="featured-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="featured-image-wrapper">
                                <img 
                                    src={project.image} 
                                    alt={project.name}
                                    className="featured-image"
                                />
                            </div>
                            <div className="featured-content">
                                <span className={`featured-category ${project.category}`}>
                                    {project.category === 'application' ? '🚀 Web App' : '🌐 Website'}
                                </span>
                                <h3 className="featured-title">{project.name}</h3>
                                <p className="featured-description">{project.description}</p>
                                <div className="featured-tech">
                                    {project.techStack.slice(0, 2).map((tech, i) => (
                                        <span key={i} className="tech-badge">{tech}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </div>

                {/* View All CTA */}
                <div className="projects-cta">
                    <Link to="/projects" className="view-all-btn">
                        <span>View All Projects</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </Link>
                    <p className="projects-count">{projects.length} projects in the gallery</p>
                </div>
            </div>
        </section>
    );
};

export default Projects;
