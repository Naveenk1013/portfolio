import { useState, useEffect, useCallback, useRef } from 'react';
import { 
    MaximizeIcon, 
    MinimizeIcon, 
    RotateCcwIcon, 
    PaletteIcon, 
    ZapIcon, 
    SparklesIcon, 
    ArrowRightIcon,
    MessageSquareIcon
} from '../icons';
import './ZenPlayground.css';

const COLOR_THEMES = [
    { id: 'rainbow', name: 'Rainbow Neon', color: '#00f7ff' },
    { id: 'cyber',   name: 'Cyber Cyan',  color: '#00d4ff' },
    { id: 'cosmic',  name: 'Cosmic Violet', color: '#b19eef' },
    { id: 'fire',    name: 'Solar Fire',   color: '#ff5533' },
    { id: 'matrix',  name: 'Matrix Green', color: '#00ff88' },
];

const MIRROR_MODES = [
    { id: 'none',       name: 'Off',        icon: null },
    { id: 'horizontal', name: 'Horizontal', icon: '|' },
    { id: 'vertical',   name: 'Vertical',   icon: '---' },
    { id: 'quad',       name: 'Quad',       icon: '+' },
];

const SIGNAGE_PRESETS = [
    { label: '⚡ Cyber Matrix', text: 'CYBER MATRIX' },
    { label: '✨ Welcome Traveler', text: 'WELCOME TRAVELER' },
    { label: '🔥 Beyond Limits', text: 'DESIGN MEETS CODE // BEYOND LIMITS' },
    { label: '🌌 Long Marquee Cosmic', text: 'WELCOME TO THE DIGITAL COSMOS // TOUCH THE FLUID TO SCULPT REALITY // BEYOND THE MATRIX 🚀' },
    { label: '🎮 Level Up', text: 'CREATIVITY IS UNBOUNDED // LEVEL UP YOUR VISION // STAY CURIOUS 💫' },
];

const SIGNAGE_STYLES = [
    { id: 'cyber',   name: 'Cyber Cyan',    color: '#00f7ff', border: 'rgba(0, 247, 255, 0.6)' },
    { id: 'cosmic',  name: 'Cosmic Violet', color: '#c084fc', border: 'rgba(192, 132, 252, 0.6)' },
    { id: 'fire',    name: 'Solar Flame',   color: '#ff5533', border: 'rgba(255, 85, 51, 0.6)' },
    { id: 'matrix',  name: 'Matrix Green',  color: '#00ff88', border: 'rgba(0, 255, 136, 0.6)' },
    { id: 'rainbow', name: 'Rainbow Prism', color: '#f43f5e', border: 'rgba(244, 63, 94, 0.6)' },
];

const ZenPlayground = ({ 
    settings, 
    onSettingChange, 
    onExit 
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isVortexActive, setIsVortexActive] = useState(false);
    const [isAutoPaintActive, setIsAutoPaintActive] = useState(false);
    const [isSlowMo, setIsSlowMo] = useState(false);
    const [showFunPanel, setShowFunPanel] = useState(false);

    // ======== SIGNAGE & MARQUEE STATE ========
    const [signageText, setSignageText] = useState('');
    const [signageDraft, setSignageDraft] = useState('TOUCH TO PAINT // CYBER REALM');
    const [isSignageVisible, setIsSignageVisible] = useState(false);
    const [showSignageModal, setShowSignageModal] = useState(false);
    const [signageStyle, setSignageStyle] = useState('cyber');
    const [marqueeSpeed, setMarqueeSpeed] = useState('normal'); // 'slow', 'normal', 'fast'
    const modalInputRef = useRef(null);

    // Lock body scroll and pull-to-refresh on mobile while playground is active
    useEffect(() => {
        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalTouchAction = document.body.style.touchAction;

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';

        const handleFullscreenChange = () => {
            const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
            setIsFullscreen(isFs);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        const firstTouch = () => setHasInteracted(true);
        window.addEventListener('pointerdown', firstTouch, { once: true });

        return () => {
            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.body.style.touchAction = originalTouchAction;
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            window.removeEventListener('pointerdown', firstTouch);

            // Stop any running features on unmount
            window.dispatchEvent(new CustomEvent('fluid:vortex:stop'));
            window.dispatchEvent(new CustomEvent('fluid:autopaint:stop'));
            window.dispatchEvent(new CustomEvent('fluid:slowmo:off'));
        };
    }, []);

    // Focus input when modal opens
    useEffect(() => {
        if (showSignageModal) {
            setSignageDraft(signageText);
            setTimeout(() => {
                modalInputRef.current?.focus();
            }, 100);
        }
    }, [showSignageModal, signageText]);

    // Native device fullscreen toggle
    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                const el = document.documentElement;
                if (el.requestFullscreen) {
                    await el.requestFullscreen();
                } else if (el.webkitRequestFullscreen) {
                    await el.webkitRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                }
            }
        } catch (err) {
            console.warn('Fullscreen request failed:', err);
        }
    }, []);

    // Clear canvas
    const handleClear = () => {
        window.dispatchEvent(new CustomEvent('fluid:clear'));
    };

    // Gyroscope toggle
    const handleGyroToggle = async () => {
        const nextVal = !settings.gyro;
        if (nextVal && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const state = await DeviceOrientationEvent.requestPermission();
                if (state === 'granted') {
                    onSettingChange('gyro', true);
                } else {
                    onSettingChange('gyro', false);
                }
            } catch {
                onSettingChange('gyro', true);
            }
        } else {
            onSettingChange('gyro', nextVal);
        }
    };

    // Color theme cycling
    const currentTheme = COLOR_THEMES.find(t => t.id === (settings.colorTheme || 'rainbow')) || COLOR_THEMES[0];
    const cycleTheme = () => {
        const currentIndex = COLOR_THEMES.findIndex(t => t.id === (settings.colorTheme || 'rainbow'));
        const nextIndex = (currentIndex + 1) % COLOR_THEMES.length;
        onSettingChange('colorTheme', COLOR_THEMES[nextIndex].id);
    };

    // ======== FUN FEATURES ========

    // Fireworks
    const triggerFireworks = () => {
        window.dispatchEvent(new CustomEvent('fluid:fireworks', { detail: { count: 20 } }));
    };

    // Mirror mode cycling
    const currentMirror = MIRROR_MODES.find(m => m.id === (settings.mirrorMode || 'none')) || MIRROR_MODES[0];
    const cycleMirror = () => {
        const currentIndex = MIRROR_MODES.findIndex(m => m.id === (settings.mirrorMode || 'none'));
        const nextIndex = (currentIndex + 1) % MIRROR_MODES.length;
        onSettingChange('mirrorMode', MIRROR_MODES[nextIndex].id);
    };

    // Vortex toggle
    const toggleVortex = () => {
        if (isVortexActive) {
            window.dispatchEvent(new CustomEvent('fluid:vortex:stop'));
            setIsVortexActive(false);
        } else {
            window.dispatchEvent(new CustomEvent('fluid:vortex:start'));
            setIsVortexActive(true);
        }
    };

    // Auto-paint toggle
    const toggleAutoPaint = () => {
        if (isAutoPaintActive) {
            window.dispatchEvent(new CustomEvent('fluid:autopaint:stop'));
            setIsAutoPaintActive(false);
        } else {
            window.dispatchEvent(new CustomEvent('fluid:autopaint:start'));
            setIsAutoPaintActive(true);
        }
    };

    // Slow-Mo toggle
    const toggleSlowMo = () => {
        if (isSlowMo) {
            window.dispatchEvent(new CustomEvent('fluid:slowmo:off'));
            setIsSlowMo(false);
        } else {
            window.dispatchEvent(new CustomEvent('fluid:slowmo:on'));
            setIsSlowMo(true);
        }
    };

    // Splat size
    const splatSize = settings.splatSize || 1.0;
    const handleSplatSizeChange = (e) => {
        onSettingChange('splatSize', parseFloat(e.target.value));
    };

    // ======== SIGNAGE & MARQUEE INTERACTION ========

    const activeSignStyle = SIGNAGE_STYLES.find(s => s.id === signageStyle) || SIGNAGE_STYLES[0];
    const cleanSignText = signageText.trim();
    // Marquee threshold: if clean text has > 25 characters, convert into marquee banner!
    const isMarqueeMode = cleanSignText.length > 25;

    // Trigger fluid burst on touching/clicking the signage or marquee
    const handleSignageSplat = (e) => {
        if (e.target && e.target.closest('button')) return;
        const touch = e.touches ? e.touches[0] : e;
        if (touch && touch.clientX !== undefined) {
            window.dispatchEvent(new CustomEvent('fluid:splat-at', {
                detail: { clientX: touch.clientX, clientY: touch.clientY, count: 6 }
            }));
        }
    };

    // Apply draft from modal
    const handleApplySignage = (e) => {
        e?.preventDefault();
        const nextText = signageDraft.trim();
        setSignageText(nextText);
        setIsSignageVisible(true);
        setShowSignageModal(false);
    };

    // Clear signage
    const handleClearSignage = () => {
        setSignageDraft('');
        setSignageText('');
        setIsSignageVisible(false);
        setShowSignageModal(false);
    };

    // Speed class for marquee
    const getMarqueeDuration = () => {
        if (marqueeSpeed === 'fast') return '15s';
        if (marqueeSpeed === 'slow') return '45s';
        return '26s';
    };

    return (
        <div className="zen-playground" aria-label="Fullscreen Fidget Canvas">
            {/* Top Bar Navigation & Controls */}
            <header className="zen-header">
                {/* Exit Canvas Button */}
                <button 
                    className="zen-btn zen-btn--exit"
                    onClick={() => {
                        if (document.fullscreenElement || document.webkitFullscreenElement) {
                            toggleFullscreen();
                        }
                        onExit();
                    }}
                    aria-label="Exit Fidget Canvas"
                >
                    <ArrowRightIcon size={16} className="zen-back-icon" />
                    <span>Exit Canvas</span>
                </button>

                {/* Controls Action Island */}
                <div className="zen-controls-bar">
                    {/* Signage Writer Button */}
                    <button 
                        className={`zen-btn zen-btn--icon zen-btn--signage ${isSignageVisible && cleanSignText ? 'zen-btn--active' : ''}`}
                        onClick={() => setShowSignageModal(true)}
                        title="Signage & Marquee Text"
                        aria-label="Open Signage Text Editor"
                    >
                        <MessageSquareIcon size={15} />
                        <span className="zen-btn-label">Signage</span>
                        {isSignageVisible && cleanSignText && (
                            <span 
                                className="zen-signage-dot" 
                                style={{ background: activeSignStyle.color }}
                            />
                        )}
                    </button>

                    {/* Native Device Fullscreen Toggle */}
                    <button 
                        className={`zen-btn zen-btn--icon ${isFullscreen ? 'zen-btn--active' : ''}`}
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                        aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        {isFullscreen ? <MinimizeIcon size={16} /> : <MaximizeIcon size={16} />}
                        <span className="zen-btn-label">{isFullscreen ? "Windowed" : "Fullscreen"}</span>
                    </button>

                    {/* Color Theme Cycler */}
                    <button 
                        className="zen-btn zen-btn--icon zen-btn--theme"
                        onClick={cycleTheme}
                        title={`Color Theme: ${currentTheme.name}`}
                        aria-label="Switch color theme"
                    >
                        <span 
                            className="zen-theme-dot" 
                            style={{ background: currentTheme.color, boxShadow: `0 0 10px ${currentTheme.color}` }} 
                        />
                        <PaletteIcon size={15} />
                        <span className="zen-btn-label">{currentTheme.name}</span>
                    </button>

                    {/* Gyroscope Gravity Toggle */}
                    <button 
                        className={`zen-btn zen-btn--icon ${settings.gyro ? 'zen-btn--active' : ''}`}
                        onClick={handleGyroToggle}
                        title="Gravity Tilt"
                        aria-label="Toggle device tilt gravity"
                    >
                        <ZapIcon size={15} />
                        <span className="zen-btn-label">Gravity</span>
                    </button>

                    {/* Clear Fluid Canvas */}
                    <button 
                        className="zen-btn zen-btn--icon"
                        onClick={handleClear}
                        title="Clear Canvas"
                        aria-label="Clear Canvas"
                    >
                        <RotateCcwIcon size={14} />
                        <span className="zen-btn-label">Clear</span>
                    </button>

                    {/* Fun Features Toggle */}
                    <button 
                        className={`zen-btn zen-btn--icon zen-btn--fun ${showFunPanel ? 'zen-btn--active' : ''}`}
                        onClick={() => setShowFunPanel(!showFunPanel)}
                        title="Fun Modes"
                        aria-label="Toggle fun features panel"
                    >
                        <SparklesIcon size={15} />
                        <span className="zen-btn-label">Fun</span>
                    </button>
                </div>
            </header>

            {/* ======== ON-CANVAS SIGNAGE DISPLAY ======== */}
            {isSignageVisible && cleanSignText && (
                <>
                    {!isMarqueeMode ? (
                        /* Short Text: Glowing Neon Signage Board */
                        <div 
                            className={`zen-signage-board zen-signage--${signageStyle}`}
                            onPointerDown={handleSignageSplat}
                            title="Tap to spray fluid onto signage"
                        >
                            <div className="zen-signage-corner zen-signage-corner--tl" />
                            <div className="zen-signage-corner zen-signage-corner--tr" />
                            <div className="zen-signage-corner zen-signage-corner--bl" />
                            <div className="zen-signage-corner zen-signage-corner--br" />

                            <div className="zen-signage-header">
                                <span className="zen-signage-badge">
                                    <span className="zen-signage-live-dot" />
                                    DIGITAL SIGNAGE
                                </span>
                                <div className="zen-signage-actions" onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
                                    <button 
                                        className="zen-signage-action-btn"
                                        onClick={() => setShowSignageModal(true)}
                                        title="Edit signage text"
                                    >
                                        ✎ Edit
                                    </button>
                                    <button 
                                        className="zen-signage-action-btn zen-signage-action-btn--close"
                                        onClick={() => setIsSignageVisible(false)}
                                        title="Hide signage"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="zen-signage-text-wrap">
                                <h2 className="zen-signage-title">{cleanSignText}</h2>
                            </div>

                            <div className="zen-signage-footer">
                                <span className="zen-signage-sub">TOUCH / DRAG OVER TEXT TO DISPERSE FLUID</span>
                            </div>
                        </div>
                    ) : (
                        /* Long Text: Infinite Marquee-Style Banner Ribbon */
                        <div 
                            className={`zen-marquee-container zen-marquee--${signageStyle}`}
                            onPointerDown={handleSignageSplat}
                            title="Interactive Marquee Banner • Tap or drag to spray fluid!"
                        >
                            <div className="zen-marquee-scanline" />
                            
                            {/* Controls Tag */}
                            <div className="zen-marquee-tag" onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
                                <span className="zen-marquee-live-dot" />
                                <span className="zen-marquee-tag-text">LIVE MARQUEE</span>
                                <button 
                                    className="zen-marquee-tag-btn"
                                    onClick={() => setShowSignageModal(true)}
                                    title="Edit banner message"
                                >
                                    ✎ Edit
                                </button>
                                <button 
                                    className="zen-marquee-tag-btn"
                                    onClick={() => setIsSignageVisible(false)}
                                    title="Dismiss banner"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Scrolling Track (duplicated content for seamless continuous 60fps loop) */}
                            <div 
                                className="zen-marquee-track"
                                style={{ animationDuration: getMarqueeDuration() }}
                            >
                                <div className="zen-marquee-content">
                                    <span className="zen-marquee-glyph">// ⚡ //</span>
                                    <span className="zen-marquee-text">{cleanSignText}</span>
                                    <span className="zen-marquee-glyph">// 🚀 DIGITAL REALM //</span>
                                    <span className="zen-marquee-text">{cleanSignText}</span>
                                    <span className="zen-marquee-glyph">// 🌌 FLUID BANNER //</span>
                                    <span className="zen-marquee-text">{cleanSignText}</span>
                                </div>
                                <div className="zen-marquee-content" aria-hidden="true">
                                    <span className="zen-marquee-glyph">// ⚡ //</span>
                                    <span className="zen-marquee-text">{cleanSignText}</span>
                                    <span className="zen-marquee-glyph">// 🚀 DIGITAL REALM //</span>
                                    <span className="zen-marquee-text">{cleanSignText}</span>
                                    <span className="zen-marquee-glyph">// 🌌 FLUID BANNER //</span>
                                    <span className="zen-marquee-text">{cleanSignText}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ======== SIGNAGE & MARQUEE INPUT MODAL ======== */}
            {showSignageModal && (
                <div 
                    className="zen-modal-backdrop"
                    onClick={() => setShowSignageModal(false)}
                >
                    <div 
                        className="zen-signage-modal"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="zen-modal-header">
                            <div className="zen-modal-title-group">
                                <MessageSquareIcon size={18} className="zen-modal-icon" />
                                <h3>Digital Signage & Marquee</h3>
                            </div>
                            <button 
                                className="zen-modal-close"
                                onClick={() => setShowSignageModal(false)}
                                aria-label="Close modal"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleApplySignage} className="zen-modal-body">
                            {/* Mode Indicator Pill */}
                            <div className="zen-modal-mode-banner">
                                {signageDraft.trim().length > 25 ? (
                                    <span className="zen-mode-badge zen-mode-badge--marquee">
                                        📜 <strong>Marquee Banner Mode</strong> (Text &gt; 25 chars: Continuous Scrolling Banner)
                                    </span>
                                ) : (
                                    <span className="zen-mode-badge zen-mode-badge--signage">
                                        🏷️ <strong>Compact Signage Mode</strong> (Text &le; 25 chars: Centered Neon Board)
                                    </span>
                                )}
                            </div>

                            {/* Text Input Area */}
                            <div className="zen-input-group">
                                <label htmlFor="signage-text-input">
                                    <span>Your Message</span>
                                    <span className="zen-char-count">{signageDraft.length} characters</span>
                                </label>
                                <textarea
                                    id="signage-text-input"
                                    ref={modalInputRef}
                                    className="zen-signage-input"
                                    rows={3}
                                    placeholder="Enter your message... Type longer text to auto-convert into a Marquee banner!"
                                    value={signageDraft}
                                    onChange={e => setSignageDraft(e.target.value)}
                                    maxLength={250}
                                />
                            </div>

                            {/* Quick Presets */}
                            <div className="zen-presets-section">
                                <span className="zen-section-label">Quick Presets</span>
                                <div className="zen-preset-chips">
                                    {SIGNAGE_PRESETS.map((p, idx) => (
                                        <button
                                            type="button"
                                            key={idx}
                                            className="zen-preset-chip"
                                            onClick={() => setSignageDraft(p.text)}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Style Selector */}
                            <div className="zen-style-section">
                                <span className="zen-section-label">Neon Style Theme</span>
                                <div className="zen-style-grid">
                                    {SIGNAGE_STYLES.map(style => (
                                        <button
                                            type="button"
                                            key={style.id}
                                            className={`zen-style-btn ${signageStyle === style.id ? 'zen-style-btn--active' : ''}`}
                                            onClick={() => setSignageStyle(style.id)}
                                        >
                                            <span 
                                                className="zen-style-preview-dot" 
                                                style={{ background: style.color, boxShadow: `0 0 10px ${style.color}` }}
                                            />
                                            <span>{style.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Marquee Speed (shown when in marquee mode) */}
                            {signageDraft.trim().length > 25 && (
                                <div className="zen-speed-section">
                                    <span className="zen-section-label">Marquee Scroll Speed</span>
                                    <div className="zen-speed-options">
                                        {['slow', 'normal', 'fast'].map(spd => (
                                            <button
                                                type="button"
                                                key={spd}
                                                className={`zen-speed-btn ${marqueeSpeed === spd ? 'zen-speed-btn--active' : ''}`}
                                                onClick={() => setMarqueeSpeed(spd)}
                                            >
                                                {spd.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div className="zen-modal-footer">
                                <button
                                    type="button"
                                    className="zen-modal-btn zen-modal-btn--secondary"
                                    onClick={handleClearSignage}
                                >
                                    Clear & Remove
                                </button>
                                <button
                                    type="submit"
                                    className="zen-modal-btn zen-modal-btn--primary"
                                    disabled={!signageDraft.trim()}
                                >
                                    Project on Canvas
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======== FUN FEATURES PANEL ======== */}
            <div className={`zen-fun-panel ${showFunPanel ? 'zen-fun-panel--visible' : ''}`}>
                <div className="zen-fun-panel-inner">
                    <div className="zen-fun-panel-header">
                        <SparklesIcon size={16} className="zen-fun-header-icon" />
                        <span>Fun Modes</span>
                    </div>

                    {/* Row 1: Fireworks, Vortex, Auto-Paint */}
                    <div className="zen-fun-row">
                        <button
                            className="zen-fun-btn zen-fun-btn--fireworks"
                            onClick={triggerFireworks}
                            title="Launch Fireworks Burst"
                        >
                            <span className="zen-fun-btn-emoji">&#x1F386;</span>
                            <span>Fireworks</span>
                        </button>

                        <button
                            className={`zen-fun-btn ${isVortexActive ? 'zen-fun-btn--active' : ''}`}
                            onClick={toggleVortex}
                            title="Toggle Vortex Spinner"
                        >
                            <span className="zen-fun-btn-emoji">&#x1F300;</span>
                            <span>Vortex</span>
                        </button>

                        <button
                            className={`zen-fun-btn ${isAutoPaintActive ? 'zen-fun-btn--active' : ''}`}
                            onClick={toggleAutoPaint}
                            title="Toggle Auto-Paint Screensaver"
                        >
                            <span className="zen-fun-btn-emoji">&#x1F3A8;</span>
                            <span>Auto-Paint</span>
                        </button>
                    </div>

                    {/* Row 2: Mirror, Slow-Mo */}
                    <div className="zen-fun-row">
                        <button
                            className={`zen-fun-btn ${currentMirror.id !== 'none' ? 'zen-fun-btn--active' : ''}`}
                            onClick={cycleMirror}
                            title={`Mirror Mode: ${currentMirror.name} (Click to cycle)`}
                        >
                            <span className="zen-fun-btn-emoji">&#x1FA9E;</span>
                            <span>Mirror: {currentMirror.name}</span>
                        </button>

                        <button
                            className={`zen-fun-btn ${isSlowMo ? 'zen-fun-btn--active' : ''}`}
                            onClick={toggleSlowMo}
                            title="Toggle Slow-Mo Dreamy Trails"
                        >
                            <span className="zen-fun-btn-emoji">&#x1F311;</span>
                            <span>Slow-Mo</span>
                        </button>

                        <button
                            className="zen-fun-btn"
                            onClick={() => {
                                setShowFunPanel(false);
                                setShowSignageModal(true);
                            }}
                            title="Signage & Marquee Text"
                        >
                            <span className="zen-fun-btn-emoji">💬</span>
                            <span>Signage</span>
                        </button>
                    </div>

                    {/* Splat Size Slider */}
                    <div className="zen-fun-slider-group">
                        <label className="zen-fun-slider-label">
                            <span>Splat Size</span>
                            <span className="zen-fun-slider-value">{splatSize.toFixed(1)}x</span>
                        </label>
                        <input
                            type="range"
                            className="zen-fun-slider"
                            min="0.2"
                            max="4.0"
                            step="0.1"
                            value={splatSize}
                            onChange={handleSplatSizeChange}
                        />
                        <div className="zen-fun-slider-markers">
                            <span>Tiny</span>
                            <span>Massive</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Interaction Guide Toast */}
            <div className={`zen-guide-pill ${hasInteracted ? 'zen-guide-pill--hidden' : ''}`}>
                <SparklesIcon size={15} className="zen-guide-sparkle" />
                <span>Drag anywhere to paint fluid. Tap Signage to write glowing text or a Marquee banner!</span>
            </div>
        </div>
    );
};

export default ZenPlayground;
