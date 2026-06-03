import { useEffect, useRef, useState, useCallback } from 'react';
import './IntroLoader.css';

/**
 * IntroLoader — A magnetic particle vortex that coalesces into the "N" logo,
 * pulses with energy, then detonates outward as the page loads.
 *
 * Phases:
 *   0 → SWARM:   Particles drift in chaotic orbital motion
 *   1 → CONVERGE: Particles magnetically pull toward the "N" glyph
 *   2 → HOLD:     Particles lock into the letter, glow intensifies
 *   3 → DETONATE:  Particles explode outward, loader fades away
 */

const PARTICLE_COUNT = 1800;
const CONVERGE_DURATION = 2200;   // ms to pull particles into the N
const HOLD_DURATION = 800;        // ms to hold the formed letter
const DETONATE_DURATION = 1000;   // ms for explosion
const MIN_DISPLAY_TIME = 3200;    // minimum total display time

const IntroLoader = ({ onComplete }) => {
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);
    const [phase, setPhase] = useState('swarm');
    const [exiting, setExiting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [taglineVisible, setTaglineVisible] = useState(false);
    const startTimeRef = useRef(Date.now());
    const phaseStartRef = useRef(null);

    // Precompute the "N" glyph target positions
    const getGlyphPoints = useCallback((width, height) => {
        // Create an offscreen canvas and draw "N"
        const offscreen = document.createElement('canvas');
        const size = Math.min(width, height) * 0.35;
        offscreen.width = width;
        offscreen.height = height;
        const ctx = offscreen.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${size}px "Space Grotesk", "Inter", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('N', width / 2, height / 2);

        // Sample pixel positions where the letter exists
        const imageData = ctx.getImageData(0, 0, width, height);
        const points = [];
        const step = 3; // sampling density

        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const idx = (y * width + x) * 4;
                if (imageData.data[idx + 3] > 128) {
                    points.push({ x, y });
                }
            }
        }
        return points;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let W = window.innerWidth;
        let H = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);

        // Get glyph target positions
        let glyphPoints = getGlyphPoints(W, H);

        // Initialize particles
        const particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Start particles from edges and random positions
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.max(W, H) * (0.3 + Math.random() * 0.7);
            const x = W / 2 + Math.cos(angle) * dist;
            const y = H / 2 + Math.sin(angle) * dist;

            // Assign a glyph target
            const target = glyphPoints.length > 0
                ? glyphPoints[i % glyphPoints.length]
                : { x: W / 2, y: H / 2 };

            particles.push({
                x,
                y,
                originX: x,
                originY: y,
                targetX: target.x,
                targetY: target.y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                size: 1 + Math.random() * 2,
                // Orbital swarm parameters
                orbitRadius: 50 + Math.random() * 300,
                orbitSpeed: 0.0005 + Math.random() * 0.002,
                orbitAngle: Math.random() * Math.PI * 2,
                // Color: cyan-to-purple spectrum
                hue: 180 + Math.random() * 100, // 180 (cyan) to 280 (purple)
                alpha: 0.3 + Math.random() * 0.7,
                // Detonate velocity
                detonateVx: 0,
                detonateVy: 0,
                detonateAlpha: 1,
                // Trail
                trail: [],
            });
        }

        // Connection lines between nearby particles (sparse)
        const MAX_CONNECTIONS = 1200;

        let currentPhase = 'swarm';
        let phaseTime = 0;
        let lastTime = performance.now();
        let globalProgress = 0;

        // Show tagline after a short delay
        setTimeout(() => setTaglineVisible(true), 600);

        const animate = (now) => {
            const dt = Math.min(now - lastTime, 32); // Cap delta time
            lastTime = now;
            phaseTime += dt;
            const elapsed = Date.now() - startTimeRef.current;

            // Phase progression
            if (currentPhase === 'swarm' && elapsed > 800) {
                currentPhase = 'converge';
                phaseStartRef.current = now;
                phaseTime = 0;
                setPhase('converge');
            } else if (currentPhase === 'converge' && phaseTime > CONVERGE_DURATION) {
                currentPhase = 'hold';
                phaseStartRef.current = now;
                phaseTime = 0;
                setPhase('hold');
            } else if (currentPhase === 'hold' && phaseTime > HOLD_DURATION) {
                currentPhase = 'detonate';
                phaseStartRef.current = now;
                phaseTime = 0;
                setPhase('detonate');
                // Assign explosion velocities
                particles.forEach(p => {
                    const angle = Math.atan2(p.y - H / 2, p.x - W / 2);
                    const force = 8 + Math.random() * 16;
                    p.detonateVx = Math.cos(angle) * force;
                    p.detonateVy = Math.sin(angle) * force;
                });
            } else if (currentPhase === 'detonate' && phaseTime > DETONATE_DURATION) {
                // Done
                setExiting(true);
                setTimeout(() => {
                    if (onComplete) onComplete();
                }, 1200);
                return; // Stop animation
            }

            // Update progress
            const totalDuration = 800 + CONVERGE_DURATION + HOLD_DURATION + DETONATE_DURATION;
            globalProgress = Math.min(elapsed / totalDuration, 1);
            setProgress(globalProgress * 100);

            // Clear with slight trail
            ctx.fillStyle = currentPhase === 'detonate'
                ? `rgba(0, 0, 0, ${0.15 + (phaseTime / DETONATE_DURATION) * 0.3})`
                : 'rgba(0, 0, 0, 0.12)';
            ctx.fillRect(0, 0, W, H);

            // Update & draw particles
            const convergeProgress = currentPhase === 'converge'
                ? easeInOutCubic(Math.min(phaseTime / CONVERGE_DURATION, 1))
                : currentPhase === 'hold' || currentPhase === 'detonate' ? 1 : 0;

            let connectionCount = 0;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                if (currentPhase === 'swarm') {
                    // Orbital swarm motion around center
                    p.orbitAngle += p.orbitSpeed * dt;
                    const centerX = W / 2 + Math.sin(now * 0.0003) * 50;
                    const centerY = H / 2 + Math.cos(now * 0.0004) * 30;
                    const targetX = centerX + Math.cos(p.orbitAngle) * p.orbitRadius;
                    const targetY = centerY + Math.sin(p.orbitAngle) * p.orbitRadius;
                    p.vx += (targetX - p.x) * 0.003;
                    p.vy += (targetY - p.y) * 0.003;
                    p.vx *= 0.97;
                    p.vy *= 0.97;
                    p.x += p.vx;
                    p.y += p.vy;
                } else if (currentPhase === 'converge') {
                    // Magnetic pull toward target letter position
                    const tx = p.targetX;
                    const ty = p.targetY;
                    const dx = tx - p.x;
                    const dy = ty - p.y;

                    // Smooth interpolation with overshoot dampening
                    const spring = 0.02 + convergeProgress * 0.08;
                    p.vx += dx * spring;
                    p.vy += dy * spring;
                    p.vx *= 0.88 - convergeProgress * 0.05;
                    p.vy *= 0.88 - convergeProgress * 0.05;
                    p.x += p.vx;
                    p.y += p.vy;
                } else if (currentPhase === 'hold') {
                    // Lock to glyph with micro-vibration
                    const vibrate = (1 - phaseTime / HOLD_DURATION) * 2;
                    p.x = p.targetX + (Math.random() - 0.5) * vibrate;
                    p.y = p.targetY + (Math.random() - 0.5) * vibrate;
                } else if (currentPhase === 'detonate') {
                    // Explosion outward
                    p.x += p.detonateVx;
                    p.y += p.detonateVy;
                    p.detonateVx *= 0.96;
                    p.detonateVy *= 0.96;
                    p.detonateAlpha = Math.max(0, 1 - (phaseTime / DETONATE_DURATION));
                }

                // Store trail
                p.trail.push({ x: p.x, y: p.y });
                if (p.trail.length > 5) p.trail.shift();

                // Draw trail
                if (p.trail.length > 1 && currentPhase !== 'hold') {
                    ctx.beginPath();
                    ctx.moveTo(p.trail[0].x, p.trail[0].y);
                    for (let t = 1; t < p.trail.length; t++) {
                        ctx.lineTo(p.trail[t].x, p.trail[t].y);
                    }
                    const trailAlpha = currentPhase === 'detonate'
                        ? p.detonateAlpha * 0.15
                        : (currentPhase === 'converge' ? convergeProgress * 0.2 : 0.08);
                    ctx.strokeStyle = `hsla(${p.hue}, 100%, 70%, ${trailAlpha})`;
                    ctx.lineWidth = p.size * 0.5;
                    ctx.stroke();
                }

                // Draw particle
                const drawAlpha = currentPhase === 'detonate' ? p.detonateAlpha : p.alpha;
                const glowIntensity = currentPhase === 'hold' ?
                    (0.6 + Math.sin(phaseTime * 0.015 + i * 0.1) * 0.4) : 1;

                // Glow
                if (currentPhase === 'hold' || currentPhase === 'converge') {
                    const glowSize = p.size * (currentPhase === 'hold' ? 4 : 2 + convergeProgress * 2);
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
                    gradient.addColorStop(0, `hsla(${p.hue}, 100%, 75%, ${drawAlpha * glowIntensity * 0.5})`);
                    gradient.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
                    ctx.fillStyle = gradient;
                    ctx.fillRect(p.x - glowSize, p.y - glowSize, glowSize * 2, glowSize * 2);
                }

                // Core dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * (currentPhase === 'hold' ? 1.2 : 1), 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 100%, 80%, ${drawAlpha * glowIntensity})`;
                ctx.fill();

                // Connection lines (only during converge and hold)
                if ((currentPhase === 'converge' || currentPhase === 'hold') && connectionCount < MAX_CONNECTIONS) {
                    for (let j = i + 1; j < Math.min(i + 8, particles.length); j++) {
                        const p2 = particles[j];
                        const distSq = (p.x - p2.x) ** 2 + (p.y - p2.y) ** 2;
                        const maxDist = currentPhase === 'hold' ? 20 : 30;
                        if (distSq < maxDist * maxDist) {
                            const dist = Math.sqrt(distSq);
                            const lineAlpha = (1 - dist / maxDist) * 0.15 * convergeProgress;
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.strokeStyle = `hsla(${(p.hue + p2.hue) / 2}, 100%, 70%, ${lineAlpha})`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                            connectionCount++;
                        }
                    }
                }
            }

            // Central glow during hold
            if (currentPhase === 'hold') {
                const pulse = 0.5 + Math.sin(phaseTime * 0.01) * 0.3;
                const gradient = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 200);
                gradient.addColorStop(0, `rgba(0, 247, 255, ${0.08 * pulse})`);
                gradient.addColorStop(0.5, `rgba(82, 39, 255, ${0.04 * pulse})`);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, W, H);
            }

            // Shockwave ring during detonate
            if (currentPhase === 'detonate') {
                const t = phaseTime / DETONATE_DURATION;
                const ringRadius = t * Math.max(W, H) * 0.8;
                const ringAlpha = (1 - t) * 0.3;
                ctx.beginPath();
                ctx.arc(W / 2, H / 2, ringRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 247, 255, ${ringAlpha})`;
                ctx.lineWidth = 2 + (1 - t) * 4;
                ctx.stroke();

                // Second ring slightly delayed
                if (t > 0.15) {
                    const t2 = (t - 0.15) / 0.85;
                    const ringRadius2 = t2 * Math.max(W, H) * 0.8;
                    const ringAlpha2 = (1 - t2) * 0.15;
                    ctx.beginPath();
                    ctx.arc(W / 2, H / 2, ringRadius2, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(82, 39, 255, ${ringAlpha2})`;
                    ctx.lineWidth = 1 + (1 - t2) * 3;
                    ctx.stroke();
                }
            }

            animFrameRef.current = requestAnimationFrame(animate);
        };

        animFrameRef.current = requestAnimationFrame(animate);

        // Handle resize
        const handleResize = () => {
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            glyphPoints = getGlyphPoints(W, H);
            // Re-assign targets
            particles.forEach((p, i) => {
                if (glyphPoints.length > 0) {
                    const target = glyphPoints[i % glyphPoints.length];
                    p.targetX = target.x;
                    p.targetY = target.y;
                }
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animFrameRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, [getGlyphPoints, onComplete]);

    return (
        <div className={`intro-loader ${exiting ? 'exiting' : ''}`}>
            <canvas ref={canvasRef} />
            <div className="intro-loader__scanlines" />
            <div className="intro-loader__vignette" />
            <div className={`intro-loader__tagline ${taglineVisible ? 'visible' : ''}`}>
                Architecting Digital Experiences
            </div>
            <div className="intro-loader__progress-track">
                <div
                    className="intro-loader__progress-bar"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

function easeInOutCubic(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default IntroLoader;
