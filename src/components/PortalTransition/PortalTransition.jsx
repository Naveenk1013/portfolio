import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './PortalTransition.css';

const PortalTransition = ({ active, onComplete }) => {
    const hasRun = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!active || hasRun.current) return;
        hasRun.current = true;

        // Lock scroll
        document.body.style.overflow = 'hidden';

        // Fast navigate with minimal delay
        const navTimer = setTimeout(() => {
            document.body.style.overflow = '';
            navigate('/anime');
            onComplete?.();
        }, 300);

        return () => {
            clearTimeout(navTimer);
            document.body.style.overflow = '';
            hasRun.current = false;
        };
    }, [active, onComplete, navigate]);

    if (!active) return null;

    return (
        <div className="anime-loader-overlay">
            <div className="anime-loader-content">
                <div className="anime-spinner"></div>
                <div className="anime-loader-text">Loading Secret World...</div>
            </div>
        </div>
    );
};

export default PortalTransition;
