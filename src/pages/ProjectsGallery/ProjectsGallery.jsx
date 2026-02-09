import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { projects, categories } from '../../data/projectsData';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import ProjectDetail from '../../components/ProjectDetail/ProjectDetail';
import './ProjectsGallery.css';

const ProjectsGallery = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedProject, setSelectedProject] = useState(null);

    const filteredProjects = activeFilter === 'all' 
        ? projects 
        : projects.filter(p => p.category === activeFilter);

    return (
        <div className="gallery-page">
            {/* Header */}
            <header className="gallery-header">
                <Link to="/" className="back-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Home
                </Link>
                <div className="gallery-title-section">
                    <h1 className="gallery-title">Projects Gallery</h1>
                    <p className="gallery-subtitle">A collection of my work — from client websites to full-stack applications</p>
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="gallery-filters">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`filter-btn ${activeFilter === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveFilter(cat.id)}
                    >
                        {cat.label}
                        <span className="filter-count">
                            {cat.id === 'all' 
                                ? projects.length 
                                : projects.filter(p => p.category === cat.id).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Masonry Grid */}
            <motion.div 
                className="masonry-grid"
                layout
            >
                <AnimatePresence mode="popLayout">
                    {filteredProjects.map((project, index) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            index={index}
                            onClick={() => setSelectedProject(project)}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Project Detail Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <ProjectDetail 
                        project={selectedProject} 
                        onClose={() => setSelectedProject(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectsGallery;
