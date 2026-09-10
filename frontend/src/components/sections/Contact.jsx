import { useMemo, useState } from 'react';
import {
  FaEnvelope,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaPaperPlane,
  FaPhone,
} from 'react-icons/fa';

const recipientEmail = 'pabhishek7333@gmail.com';

const contactItems = [
  {
    label: 'Gmail',
    value: recipientEmail,
    href: `mailto:${recipientEmail}`,
    icon: <FaEnvelope />,
  },
  {
    label: 'LinkedIn',
    value: 'Abhishek Pandey',
    href: 'https://www.linkedin.com/in/abhishek-pandey-45b215296/',
    icon: <FaLinkedinIn />,
  },
  {
    label: 'Phone',
    value: '+91 8340195034',
    href: 'tel:+918340195034',
    icon: <FaPhone />,
  },
  {
    label: 'GitHub',
    value: 'pabhi0901',
    href: 'https://github.com/pabhi0901',
    icon: <FaGithub />,
  },
  {
    label: 'Instagram',
    value: '__abhishekpandey_',
    href: 'https://www.instagram.com/__abhishekpandey_/',
    icon: <FaInstagram />,
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: '',
  });

  const gmailComposeUrl = useMemo(() => {
    const subject = encodeURIComponent(formData.subject.trim());
    const body = encodeURIComponent(
      `From: ${formData.email.trim()}\n\n${formData.message.trim()}`
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${subject}&body=${body}`;
  }, [formData.email, formData.message, formData.subject]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      return;
    }

    window.open(gmailComposeUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="section active contact-page-section" id="contact">
      <div className="section-label reveal visible">Contact</div>

      <div className="contact-layout contact-page-layout reveal visible">
        <div className="glass-card contact-info-card">
          <div className="contact-card-head">
            <div>
              <div className="contact-card-title">Profiles</div>
              <div className="contact-card-subtitle">Open any link in one click</div>
            </div>
            <div className="contact-card-badge">Socials</div>
          </div>
          <div className="contact-links-list">
            {contactItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="contact-link-row"
              >
                <div className="ci-icon">{item.icon}</div>
                <div className="contact-link-copy">
                  <span className="ci-label">{item.label}</span>
                  <span className="ci-value">{item.value}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        <form className="glass-card contact-info-card contact-form-card" onSubmit={handleSubmit}>
          <div className="contact-card-head">
            <div>
              <div className="contact-card-title">Message directly</div>
              <div className="contact-card-subtitle">Gmail draft opens with your text ready</div>
            </div>
            <div className="contact-card-badge">Mail</div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Your mail id</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Project idea, collaboration, etc."
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              required
            />
          </div>

          <div className="contact-form-footer">
            <div className="contact-form-note">
              Sends to <strong>{recipientEmail}</strong> through Gmail.
            </div>
            <button className="proj-btn demo contact-send-btn" type="submit">
              <FaPaperPlane size={14} /> <span>Send via Gmail</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
