import { useState, useEffect, useRef, useCallback } from 'react';
import { 
    MailIcon, 
    LinkedinIcon, 
    GithubIcon, 
    SendIcon, 
    ShieldCheckIcon, 
    CheckIcon, 
    LockIcon 
} from '../icons';
import { 
    FaTimes, 
    FaExclamationTriangle, 
    FaCheckCircle 
} from 'react-icons/fa';
import './Contact.css';

// ─── Constants & Anti-Spam Security Configurations ─────────────────────────────
const RATE_LIMIT_KEY     = 'contact_submissions_v2';
const MAX_SUBMISSIONS    = 2;              // Max 2 submissions per 10 minutes
const WINDOW_MS          = 10 * 60 * 1000; // 10 minutes window
const MIN_ENGAGEMENT_MS  = 3000;           // Bot guard: real humans take ≥ 3 s
const MIN_INTERACTIONS   = 4;              // Bot guard: real humans generate mouse/touch/key events
const MAX_MSG_LENGTH     = 2000;
const MIN_MSG_LENGTH     = 10;

// Dynamic endpoint assembly (prevents automated regex scrapers from scraping form endpoint)
const getServiceEndpoint = () => atob('aHR0cHM6Ly9mb3Jtc3ByZWUuaW8vZi94a2dkcXpxeg==');

// ─── Spam Keywords & Heuristic Filters ──────────────────────────────────────────
const SPAM_PATTERNS = [
    'viagra', 'cialis', 'casino', 'slots', 'poker',
    'seo ranking', 'backlinks', 'guest post', 'domain authority',
    'crypto investment', 'whatsapp me', 'telegram:', 't.me/',
    'invest $', 'forex trading', 'dating site', 'onlyfans',
    'bit.ly/', 'tinyurl.com/', 'buy followers', 'increase traffic'
];

/** Check for bot spam keywords or link bombing */
const isAutomatedSpamContent = (text) => {
    const lower = text.toLowerCase();
    
    // Check known bot phrases
    for (const phrase of SPAM_PATTERNS) {
        if (lower.includes(phrase)) return true;
    }
    
    // Check for excessive URL dumping (spammers inject multiple links)
    const urlMatches = lower.match(/https?:\/\//g) || [];
    if (urlMatches.length > 2) return true;
    
    // Check for Cyrillic script spam in typical English inquiry
    if (/[\u0400-\u04FF]/.test(text) && !/[a-zA-Z]/.test(text.slice(0, 15))) {
        return true;
    }
    
    return false;
};

// ─── Validation Helpers ────────────────────────────────────────────────────────

/** Strip HTML/script tags and trim whitespace */
const sanitize = (str) =>
    str.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();

/** Valid email: local@domain.tld (tld ≥ 2 chars) */
const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

/**
 * Phone: optional field.
 * Accepts international (+), spaces, dashes, parens, 7–15 digits.
 */
const isValidPhone = (phone) => {
    if (!phone.trim()) return true; // optional
    const digits = phone.replace(/\D/g, '');
    return /^[+\d][\d\s\-().]{6,19}$/.test(phone.trim()) && digits.length >= 7 && digits.length <= 15;
};

/** Name: 2–60 chars, letters / spaces / hyphens / apostrophes */
const isValidName = (name) =>
    /^[A-Za-z\u00C0-\u024F\s'-]{2,60}$/.test(name.trim());

// ─── Rate-limit Helpers ────────────────────────────────────────────────────────

const getSubmissions = () => {
    try {
        return JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '[]');
    } catch {
        return [];
    }
};

const recordSubmission = () => {
    const now = Date.now();
    const recent = getSubmissions().filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent));
};

/** Returns { allowed: bool, remaining: number (ms until oldest expires) } */
const checkRateLimit = () => {
    const now = Date.now();
    const recent = getSubmissions().filter((t) => now - t < WINDOW_MS);
    if (recent.length >= MAX_SUBMISSIONS) {
        const oldest    = Math.min(...recent);
        const remaining = WINDOW_MS - (now - oldest);
        return { allowed: false, remaining };
    }
    return { allowed: true, remaining: 0 };
};

// ─── Component ─────────────────────────────────────────────────────────────────

const Contact = () => {
    // Animated icon refs for hover interactions
    const mailIconRef = useRef(null);
    const linkedinIconRef = useRef(null);
    const githubIconRef = useRef(null);
    const sendIconRef = useRef(null);

    // Human interaction entropy tracking
    const interactionEventsRef = useRef(0);
    const firstInteractionTimeRef = useRef(null);
    const challengeTokenRef = useRef(null);

    const [formData, setFormData] = useState({
        name:     '',
        email:    '',
        phone:    '',
        message:  '',
        website:  '', // Client-side Honeypot 1 — must stay empty
        _gotcha:  '', // Formspree Server-side Honeypot 2 — must stay empty
    });

    const [isHumanVerified, setIsHumanVerified] = useState(false);
    const [errors,          setErrors]          = useState({});
    const [toast,           setToast]           = useState(null);   // { type:'success'|'error'|'rate', message }
    const [isSubmitting,    setIsSubmitting]    = useState(false);
    const [countdown,       setCountdown]       = useState(0);       // seconds until rate limit resets

    // Record legitimate human interaction gestures
    const recordUserInteraction = useCallback(() => {
        if (!firstInteractionTimeRef.current) {
            firstInteractionTimeRef.current = Date.now();
        }
        interactionEventsRef.current += 1;
    }, []);

    // Live countdown timer when rate-limited
    useEffect(() => {
        if (countdown <= 0) return;
        const id = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    clearInterval(id);
                    setToast(null);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [countdown]);

    // Auto-dismiss success/error toasts after 5 s
    useEffect(() => {
        if (!toast || toast.type === 'rate') return;
        const id = setTimeout(() => setToast(null), 5000);
        return () => clearTimeout(id);
    }, [toast]);

    // ── Field change ───────────────────────────────────────────────────────────
    const handleChange = (e) => {
        recordUserInteraction();
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error on edit
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    // ── Interactive Human Verification ─────────────────────────────────────────
    const handleVerifyHuman = () => {
        recordUserInteraction();
        const token = 'lance_shield_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
        challengeTokenRef.current = token;
        setIsHumanVerified(true);
        if (errors.verification) {
            setErrors((prev) => ({ ...prev, verification: '' }));
        }
    };

    // ── Per-field validation ───────────────────────────────────────────────────
    const validate = () => {
        const errs = {};

        if (!formData.name.trim()) {
            errs.name = 'Name is required.';
        } else if (!isValidName(formData.name)) {
            errs.name = 'Name must be 2–60 characters (letters, spaces, hyphens, apostrophes).';
        }

        if (!formData.email.trim()) {
            errs.email = 'Email is required.';
        } else if (!isValidEmail(formData.email)) {
            errs.email = 'Please enter a valid email address (e.g. you@example.com).';
        }

        if (formData.phone.trim() && !isValidPhone(formData.phone)) {
            errs.phone = 'Invalid phone number. Use digits, +, spaces, dashes or parentheses (7–15 digits).';
        }

        if (!formData.message.trim()) {
            errs.message = 'Message is required.';
        } else if (formData.message.trim().length < MIN_MSG_LENGTH) {
            errs.message = `Message must be at least ${MIN_MSG_LENGTH} characters.`;
        } else if (formData.message.length > MAX_MSG_LENGTH) {
            errs.message = `Message must not exceed ${MAX_MSG_LENGTH} characters.`;
        }

        if (!isHumanVerified) {
            errs.verification = 'Please complete the anti-spam human verification check below.';
        }

        return errs;
    };

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        recordUserInteraction();

        // 1. Double Honeypot Check (Invisible to humans; scrapers and bots fill them)
        if (formData.website.trim() !== '' || formData._gotcha.trim() !== '') {
            // Fake success response to misdirect bot scripts without sending anything
            setToast({ type: 'success', message: "Thanks for reaching out! I'll get back to you soon." });
            setFormData({ name: '', email: '', phone: '', message: '', website: '', _gotcha: '' });
            return;
        }

        // 2. Behavioral Bot Detection: Interaction entropy & timing check
        const elapsedSinceFirstTouch = firstInteractionTimeRef.current 
            ? Date.now() - firstInteractionTimeRef.current 
            : 0;
            
        if (interactionEventsRef.current < MIN_INTERACTIONS || elapsedSinceFirstTouch < MIN_ENGAGEMENT_MS) {
            setToast({ type: 'error', message: 'Automated script detected. Please interact with the form naturally.' });
            return;
        }

        // 3. Human Challenge Verification Token Check
        if (!isHumanVerified || !challengeTokenRef.current) {
            setErrors(prev => ({ ...prev, verification: 'Please complete the anti-spam human verification check.' }));
            return;
        }

        // 4. Rate limit check
        const { allowed, remaining } = checkRateLimit();
        if (!allowed) {
            const secs = Math.ceil(remaining / 1000);
            setCountdown(secs);
            setToast({
                type:    'rate',
                message: `Too many submissions. Please wait ${Math.ceil(secs / 60)} minute(s).`,
            });
            return;
        }

        // 5. Spam Keyword & Pattern Filter
        if (isAutomatedSpamContent(formData.message) || isAutomatedSpamContent(formData.name)) {
            setToast({ type: 'error', message: 'Message rejected by security filter: promotional/spam patterns detected.' });
            return;
        }

        // 6. Field validation
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        // 7. Sanitize before sending
        const payload = {
            name:    sanitize(formData.name),
            email:   sanitize(formData.email),
            phone:   sanitize(formData.phone),
            message: sanitize(formData.message),
            _token:  challengeTokenRef.current,
        };

        setIsSubmitting(true);

        try {
            const endpoint = getServiceEndpoint();
            const response = await fetch(endpoint, {
                method:  'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json' 
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                recordSubmission();
                setFormData({ name: '', email: '', phone: '', message: '', website: '', _gotcha: '' });
                setErrors({});
                setIsHumanVerified(false);
                challengeTokenRef.current = null;
                interactionEventsRef.current = 0;
                firstInteractionTimeRef.current = null;
                setToast({ type: 'success', message: "Thanks for reaching out! I'll get back to you soon." });
            } else {
                const data = await response.json().catch(() => ({}));
                const msg  = data?.errors?.[0]?.message || 'Something went wrong. Please try again.';
                setToast({ type: 'error', message: msg });
            }
        } catch {
            setToast({ type: 'error', message: 'Network error — please check your connection and try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const msgLen        = formData.message.length;
    const msgOverLimit  = msgLen > MAX_MSG_LENGTH;

    return (
        <section className="contact" id="contact">
            <div className="contact-container">
                <div className="contact-header">
                    <h2 className="contact-title">Get In Touch</h2>
                    <p className="contact-subtitle">Let's work together!</p>
                </div>

                <div className="contact-content">
                    {/* ── Info panel ── */}
                    <div className="contact-info">
                        <p className="contact-text">
                            I'm always open to new opportunities, collaborations,
                            or just a friendly chat. Feel free to reach out!
                        </p>

                        <div className="contact-links">
                            <a 
                                href="mailto:naveen.k1013@gmail.com" 
                                className="contact-link" 
                                aria-label="Send email"
                                onMouseEnter={() => mailIconRef.current?.startAnimation()}
                                onMouseLeave={() => mailIconRef.current?.stopAnimation()}
                            >
                                <span className="link-icon">
                                    <MailIcon ref={mailIconRef} size={20} />
                                </span>
                                <span>Email ID</span>
                            </a>
                            <a 
                                href="https://www.linkedin.com/in/naveen-kumar-8a40bb170/" 
                                className="contact-link" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                aria-label="Visit LinkedIn profile"
                                onMouseEnter={() => linkedinIconRef.current?.startAnimation()}
                                onMouseLeave={() => linkedinIconRef.current?.stopAnimation()}
                            >
                                <span className="link-icon">
                                    <LinkedinIcon ref={linkedinIconRef} size={20} />
                                </span>
                                <span>LinkedIn</span>
                            </a>
                            <a 
                                href="https://github.com/Naveenk1013" 
                                className="contact-link" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                aria-label="Visit GitHub profile"
                                onMouseEnter={() => githubIconRef.current?.startAnimation()}
                                onMouseLeave={() => githubIconRef.current?.stopAnimation()}
                            >
                                <span className="link-icon">
                                    <GithubIcon ref={githubIconRef} size={20} />
                                </span>
                                <span>GitHub</span>
                            </a>
                        </div>
                    </div>

                    {/* ── Form with Anti-Bot Security ── */}
                    <form 
                        className="contact-form" 
                        onSubmit={handleSubmit} 
                        noValidate
                        onKeyDown={recordUserInteraction}
                        onPointerDown={recordUserInteraction}
                    >
                        {/* Toast banner */}
                        {toast && (
                            <div className={`cf-toast cf-toast--${toast.type}`} role="alert">
                                <span className="cf-toast-icon">
                                    {toast.type === 'success' ? (
                                        <FaCheckCircle size={16} />
                                    ) : toast.type === 'rate' ? (
                                        <FaShieldAlt size={16} />
                                    ) : (
                                        <FaExclamationTriangle size={16} />
                                    )}
                                </span>
                                <span>{toast.message}</span>
                                {toast.type === 'rate' && countdown > 0 && (
                                    <span className="cf-countdown"> ({countdown}s)</span>
                                )}
                                {toast.type !== 'rate' && (
                                    <button
                                        type="button"
                                        className="cf-toast__close"
                                        onClick={() => setToast(null)}
                                        aria-label="Dismiss"
                                    >
                                        <FaTimes size={13} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Double Honeypots — completely off-screen and invisible to humans */}
                        <div className="cf-honeypot" aria-hidden="true" style={{ display: 'none' }}>
                            <label htmlFor="_gotcha">Leave this empty</label>
                            <input
                                type="text"
                                id="_gotcha"
                                name="_gotcha"
                                value={formData._gotcha}
                                onChange={handleChange}
                                tabIndex={-1}
                                autoComplete="new-password"
                            />
                            <label htmlFor="website">Website</label>
                            <input
                                type="text"
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                tabIndex={-1}
                                autoComplete="new-password"
                            />
                        </div>

                        {/* Name */}
                        <div className={`form-group ${errors.name ? 'form-group--error' : ''}`}>
                            <input
                                type="text"
                                id="cf-name"
                                name="name"
                                placeholder="Your Name *"
                                value={formData.name}
                                onChange={handleChange}
                                maxLength={60}
                                autoComplete="name"
                                aria-required="true"
                                aria-describedby={errors.name ? 'cf-name-error' : undefined}
                            />
                            {errors.name && (
                                <span className="cf-field-error" id="cf-name-error" role="alert">
                                    <FaExclamationTriangle size={12} /> {errors.name}
                                </span>
                            )}
                        </div>

                        {/* Email */}
                        <div className={`form-group ${errors.email ? 'form-group--error' : ''}`}>
                            <input
                                type="email"
                                id="cf-email"
                                name="email"
                                placeholder="Your Email *"
                                value={formData.email}
                                onChange={handleChange}
                                maxLength={254}
                                autoComplete="email"
                                aria-required="true"
                                aria-describedby={errors.email ? 'cf-email-error' : undefined}
                            />
                            {errors.email && (
                                <span className="cf-field-error" id="cf-email-error" role="alert">
                                    <FaExclamationTriangle size={12} /> {errors.email}
                                </span>
                            )}
                        </div>

                        {/* Phone (optional) */}
                        <div className={`form-group ${errors.phone ? 'form-group--error' : ''}`}>
                            <input
                                type="tel"
                                id="cf-phone"
                                name="phone"
                                placeholder="Phone Number (optional, e.g. +91 98765 43210)"
                                value={formData.phone}
                                onChange={handleChange}
                                maxLength={20}
                                autoComplete="tel"
                                aria-describedby={errors.phone ? 'cf-phone-error' : undefined}
                            />
                            {errors.phone && (
                                <span className="cf-field-error" id="cf-phone-error" role="alert">
                                    <FaExclamationTriangle size={12} /> {errors.phone}
                                </span>
                            )}
                        </div>

                        {/* Message */}
                        <div className={`form-group ${errors.message || msgOverLimit ? 'form-group--error' : ''}`}>
                            <textarea
                                id="cf-message"
                                name="message"
                                placeholder="Your Message *"
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                maxLength={MAX_MSG_LENGTH + 1}
                                aria-required="true"
                                aria-describedby={errors.message ? 'cf-message-error' : 'cf-message-counter'}
                            />
                            <div className="cf-message-footer">
                                {errors.message ? (
                                    <span className="cf-field-error" id="cf-message-error" role="alert">
                                        <FaExclamationTriangle size={12} /> {errors.message}
                                    </span>
                                ) : <span />}
                                <span
                                    id="cf-message-counter"
                                    className={`cf-char-count ${msgOverLimit ? 'cf-char-count--over' : ''}`}
                                >
                                    {msgLen}/{MAX_MSG_LENGTH}
                                </span>
                            </div>
                        </div>

                        {/* ── Interactive Anti-Bot Verification Challenge ── */}
                        <div className={`cf-security-box ${isHumanVerified ? 'verified' : ''}`}>
                            <div className="cf-security-inner">
                                <div className="cf-security-info">
                                    <span className="cf-security-shield-icon">
                                        <ShieldCheckIcon size={20} className={isHumanVerified ? 'cf-shield-checked' : 'cf-shield-idle'} />
                                    </span>
                                    <div className="cf-security-texts">
                                        <span className="cf-security-title">
                                            {isHumanVerified ? 'Security Verified' : 'Anti-Spam Verification'}
                                        </span>
                                        <span className="cf-security-subtitle">
                                            {isHumanVerified ? 'Protected from automated scripts' : 'Tap to confirm you are human'}
                                        </span>
                                    </div>
                                </div>

                                {!isHumanVerified ? (
                                    <button
                                        type="button"
                                        className="cf-verify-btn"
                                        onClick={handleVerifyHuman}
                                        aria-label="Verify human to prevent spam"
                                    >
                                        <ShieldCheckIcon size={14} />
                                        <span>I AM HUMAN</span>
                                    </button>
                                ) : (
                                    <span className="cf-verified-badge">
                                        <CheckIcon size={14} /> VERIFIED
                                    </span>
                                )}
                            </div>
                            {errors.verification && (
                                <span className="cf-field-error" style={{ marginTop: 8 }} role="alert">
                                    <FaExclamationTriangle size={12} /> {errors.verification}
                                </span>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            id="cf-submit"
                            className="submit-btn"
                            disabled={isSubmitting || (toast?.type === 'rate')}
                            onMouseEnter={() => sendIconRef.current?.startAnimation()}
                            onMouseLeave={() => sendIconRef.current?.stopAnimation()}
                        >
                            {isSubmitting ? (
                                <span className="cf-spinner" aria-label="Sending…" />
                            ) : toast?.type === 'rate' ? (
                                `Rate limited — wait ${countdown}s`
                            ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <SendIcon ref={sendIconRef} size={18} className="cf-submit-icon" /> Send Message
                                </span>
                            )}
                        </button>

                        <p className="cf-privacy-note">
                            <LockIcon size={13} style={{ marginRight: 6, verticalAlign: 'middle', color: '#00f7ff', display: 'inline-flex' }} />
                            Your info is only used to respond to your message and is never shared.
                        </p>
                    </form>
                </div>
            </div>

            <footer className="footer">
                <p>© {new Date().getFullYear()} Naveen Kumar.</p>
            </footer>
        </section>
    );
};

export default Contact;
