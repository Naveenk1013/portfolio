import { useState } from 'react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("https://formspree.io/f/xkgdqzqz", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Thanks for reaching out! I\'ll get back to you soon.');
                setFormData({ name: '', email: '', message: '' });
            } else {
                alert('Oops! There was a problem submitting your form');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Oops! There was a problem submitting your form');
        }
    };

    return (
        <section className="contact" id="contact">
            <div className="contact-container">
                <div className="contact-header">
                    <h2 className="contact-title">Get In Touch</h2>
                    <p className="contact-subtitle">Let's work together!</p>
                </div>

                <div className="contact-content">
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

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Your Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <textarea
                                name="message"
                                placeholder="Your Message"
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-btn">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>

            <footer className="footer">
                <p>© 2024 Naveen Kumar.</p>
            </footer>
        </section>
    );
};

export default Contact;
