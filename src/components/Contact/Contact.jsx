import { useState, useEffect, useRef } from 'react';
import './Contact.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const RATE_LIMIT_KEY   = 'contact_submissions';
const MAX_SUBMISSIONS  = 3;
const WINDOW_MS        = 10 * 60 * 1000; // 10 minutes
const MIN_LOAD_TIME_MS = 2000;            // bot guard: must take ≥ 2 s to fill
const MAX_MSG_LENGTH   = 2000;
const MIN_MSG_LENGTH   = 10;

// ─── Validation Helpers ───────────────────────────────────────────────────────

/** Strip every HTML tag and trim whitespace */
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

// ─── Rate-limit Helpers ───────────────────────────────────────────────────────

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
    const oldest   = Math.min(...recent);
    const remaining = WINDOW_MS - (now - oldest);
    return { allowed: false, remaining };
  }
  return { allowed: true, remaining: 0 };
};

// ─── Component ────────────────────────────────────────────────────────────────

const Contact = () => {
  const formLoadTime = useRef(Date.now());

  const [formData, setFormData] = useState({
    name:    '',
    email:   '',
    phone:   '',
    message: '',
    website: '', // honeypot — must stay empty
  });

  const [errors,      setErrors]      = useState({});
  const [toast,       setToast]       = useState(null);   // { type:'success'|'error'|'rate', message }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown,   setCountdown]   = useState(0);       // seconds until rate limit resets

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

  // ── Field change ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on edit
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ── Per-field validation ──────────────────────────────────────────────────
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

    return errs;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Honeypot check (invisible to humans, bots fill it)
    if (formData.website.trim() !== '') return;

    // 2. Timing check — reject instant bot submissions
    if (Date.now() - formLoadTime.current < MIN_LOAD_TIME_MS) {
      setToast({ type: 'error', message: 'Submission too fast — please try again.' });
      return;
    }

    // 3. Rate limit check
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

    // 4. Field validation
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // 5. Sanitize before sending
    const payload = {
      name:    sanitize(formData.name),
      email:   sanitize(formData.email),
      phone:   sanitize(formData.phone),
      message: sanitize(formData.message),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch('https://formspree.io/f/xkgdqzqz', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (response.ok) {
        recordSubmission();
        setFormData({ name: '', email: '', phone: '', message: '', website: '' });
        setErrors({});
        setToast({ type: 'success', message: "Thanks for reaching out! I'll get back to you soon. 🎉" });
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
              <a href="mailto:naveen.k1013@gmail.com" className="contact-link">
                <span className="link-icon">📧</span>
                <span>Email ID</span>
              </a>
              <a href="https://www.linkedin.com/in/naveen-kumar-8a40bb170/" className="contact-link" target="_blank" rel="noopener noreferrer">
                <span className="link-icon">💼</span>
                <span>LinkedIn</span>
              </a>
              <a href="https://github.com/Naveenk1013" className="contact-link" target="_blank" rel="noopener noreferrer">
                <span className="link-icon">🐱</span>
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* ── Form ── */}
          <form className="contact-form" onSubmit={handleSubmit} noValidate>

            {/* Toast banner */}
            {toast && (
              <div className={`cf-toast cf-toast--${toast.type}`} role="alert">
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
                  >✕</button>
                )}
              </div>
            )}

            {/* Honeypot — hidden from real users */}
            <div className="cf-honeypot" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
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
                  {errors.name}
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
                  {errors.email}
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
                  {errors.phone}
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
                    {errors.message}
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

            {/* Submit */}
            <button
              type="submit"
              id="cf-submit"
              className="submit-btn"
              disabled={isSubmitting || (toast?.type === 'rate')}
            >
              {isSubmitting ? (
                <span className="cf-spinner" aria-label="Sending…" />
              ) : toast?.type === 'rate' ? (
                `Rate limited — wait ${countdown}s`
              ) : (
                'Send Message'
              )}
            </button>

            <p className="cf-privacy-note">
              🔒 Your info is only used to respond to your message and is never shared.
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
