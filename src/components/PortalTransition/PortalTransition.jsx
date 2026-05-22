import { useEffect, useRef } from 'react';
import './PortalTransition.css';

const PortalTransition = ({ active, onComplete }) => {
    const overlayRef = useRef(null);
    const hasRun = useRef(false);

    useEffect(() => {
        if (!active || hasRun.current) return;
        hasRun.current = true;

        const overlay = overlayRef.current;
        if (!overlay) return;

        // Lock scroll
        document.body.style.overflow = 'hidden';

        // Phase 1: Show overlay + speed lines immediately
        overlay.classList.add('portal-phase-1');

        // Phase 2: Shake after a beat
        const shakeTimer = setTimeout(() => {
            overlay.classList.add('portal-phase-2');
        }, 200);

        // Phase 3: Show impact text
        const textTimer = setTimeout(() => {
            overlay.classList.add('portal-phase-3');
        }, 400);

        // Phase 4: White flash
        const flashTimer = setTimeout(() => {
            overlay.classList.add('portal-phase-4');
        }, 1000);

        // Phase 5: Navigate
        const navTimer = setTimeout(() => {
            document.body.style.overflow = '';
            window.location.href = '#/anime';
            onComplete?.();
        }, 1400);

        return () => {
            clearTimeout(shakeTimer);
            clearTimeout(textTimer);
            clearTimeout(flashTimer);
            clearTimeout(navTimer);
            document.body.style.overflow = '';
            hasRun.current = false;
        };
    }, [active, onComplete]);

    if (!active) return null;

    // Generate speed lines
    const speedLines = Array.from({ length: 36 }, (_, i) => {
        const angle = i * 10;
        const width = 1.5 + Math.random() * 2.5;
        return (
            <div
                key={i}
                className="portal-speed-line"
                style={{
                    '--angle': `${angle}deg`,
                    '--width': `${width}px`,
                    '--delay': `${i * 15}ms`,
                }}
            />
        );
    });

    return (
        <div ref={overlayRef} className="portal-overlay">
            <div className="portal-lines-container">
                {speedLines}
            </div>
            <div className="portal-impact-text">
                突入!!
            </div>
            <div className="portal-flash" />
        </div>
    );
};

export default PortalTransition;
