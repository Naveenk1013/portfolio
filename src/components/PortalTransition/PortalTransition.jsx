import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { animeAudio } from '../../utils/animeAudio';
import './PortalTransition.css';

const PortalTransition = ({ active, onComplete }) => {
    const navigate = useNavigate();
    const [phase, setPhase] = useState('idle'); // idle | charging | slash | shatter | warp
    const hasTriggered = useRef(false);

    useEffect(() => {
        if (!active || hasTriggered.current) return;
        hasTriggered.current = true;

        // Lock document scroll
        document.body.style.overflow = 'hidden';

        // 1. Charging Phase
        setPhase('charging');
        animeAudio.playHakiCharge(6);

        // 2. Katana Slash at 150ms
        const slashTimer = setTimeout(() => {
            setPhase('slash');
            animeAudio.playKatanaSlash();
            animeAudio.playDonImpact();
        }, 160);

        // 3. Dimensional Shatter at 450ms
        const shatterTimer = setTimeout(() => {
            setPhase('shatter');
        }, 460);

        // 4. Warp & Navigate at 750ms
        const navTimer = setTimeout(() => {
            document.body.style.overflow = '';
            navigate('/anime');
            onComplete?.();
        }, 750);

        return () => {
            clearTimeout(slashTimer);
            clearTimeout(shatterTimer);
            clearTimeout(navTimer);
            document.body.style.overflow = '';
            hasTriggered.current = false;
        };
    }, [active, navigate, onComplete]);

    if (!active) return null;

    return (
        <div className={`portal-manga-overlay phase-${phase}`}>
            {/* Speed lines canvas / SVG */}
            <div className="portal-speedlines" />

            {/* Dimensional Japanese Warning Kanji */}
            <AnimatePresence>
                {phase === 'charging' && (
                    <motion.div 
                        className="portal-warning-box"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                        exit={{ scale: 1.4, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="portal-kanji-alert">覇気覚醒</div>
                        <div className="portal-sub-alert">CONQUEROR'S HAKI OVERDRIVE</div>
                        <div className="portal-warning-status">OPENING DIMENSIONAL RIFT...</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Katana Slash Beam */}
            {phase === 'slash' && (
                <div className="portal-slash-container">
                    <div className="portal-slash-beam" />
                    <div className="portal-slash-impact-text">
                        <span>ズバッ!!</span>
                        <small>ZUBAT!!</small>
                    </div>
                </div>
            )}

            {/* Split Comic Screen Halves (Top-Left and Bottom-Right sliding apart) */}
            {(phase === 'slash' || phase === 'shatter') && (
                <>
                    <div className="portal-split-half portal-half-top" />
                    <div className="portal-split-half portal-half-bottom" />
                </>
            )}

            {/* Flash to White / Gold Manga Gate */}
            {phase === 'shatter' && (
                <motion.div 
                    className="portal-gate-flash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35 }}
                >
                    <div className="portal-manga-gate-text">
                        <span className="gate-jp">偉大なる航路へようこそ</span>
                        <span className="gate-en">ENTERING THE GRAND LINE</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default PortalTransition;
