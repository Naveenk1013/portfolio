import './Skeleton.css';

const ProjectsSkeleton = () => {
    return (
        <div className="skeleton-page pg-container">
            <header className="skeleton-hero">
                <div className="skeleton-box title-box shimmer" />
                <div className="skeleton-box subtitle-box shimmer" />
            </header>
            
            <div className="skeleton-filters shimmer" />

            <section className="skeleton-section">
                <div className="skeleton-grid projects-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="skeleton-project-card shimmer"></div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ProjectsSkeleton;
