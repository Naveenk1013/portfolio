import './Skeleton.css';

const AnimeSkeleton = () => {
    return (
        <div className="skeleton-page aw-manga-page">
            <div className="aw-halftone-dots" />
            
            <header className="skeleton-hero">
                <div className="skeleton-box title-box shimmer" />
                <div className="skeleton-box subtitle-box shimmer" />
                <div className="skeleton-stats-grid">
                    <div className="skeleton-box stat-box shimmer" />
                    <div className="skeleton-box stat-box shimmer" />
                    <div className="skeleton-box stat-box shimmer" />
                </div>
            </header>

            <section className="skeleton-section">
                <div className="skeleton-box heading-box shimmer" />
                
                <div className="skeleton-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="skeleton-poster shimmer">
                            <div className="skeleton-poster-img" />
                            <div className="skeleton-poster-text" />
                            <div className="skeleton-poster-text short" />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AnimeSkeleton;
