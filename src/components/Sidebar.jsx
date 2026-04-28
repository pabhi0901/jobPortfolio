import  { useEffect, useState } from 'react';
import { FaGithub, FaLinkedinIn, FaGlobe, FaMapMarkerAlt, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa';

const Sidebar = () => {
  const [typedRole, setTypedRole] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const roles = ['Backend Developer', 'Software Architect', 'AI Integrator'];
    const type = () => {
      const currentRole = roles[roleIndex];
      if (isDeleting) {
        setTypedRole(currentRole.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      } else {
        setTypedRole(currentRole.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      }

      if (!isDeleting && charIndex === currentRole.length) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      }
    };

    const speed = isDeleting ? 50 : 100;
    const timeout = setTimeout(type, speed);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, roleIndex]);

  return (
    <aside className="sidebar" id="sidebar">
      <div className="profile-wrap">
        <div className="avatar-glow">
          <a href="https://github.com/pabhi0901" target="_blank" rel="noopener noreferrer" className="avatar-link">
            <img 
              id="avatarImg" 
              src="https://github.com/pabhi0901.png" 
              alt="Abhishek Pandey" 
              className="avatar-img" 
              width="96" 
              height="96" 
            />
            <div className="avatar-ring"></div>
          </a>
        </div>
        <h1 className="profile-name" id="profileName">Abhishek Pandey</h1>
        <div className="profile-role">
          <span className="role-prefix">&lt;</span>
          <span id="typedRole">{typedRole}</span>
          <span className="role-suffix">/&gt;</span>
        </div>
        <div className="profile-location" id="profileLocation">
          <FaMapMarkerAlt /> India
        </div>
        <div className="status-pill">
          <span className="status-dot"></span> Open to work
        </div>
      </div>

      <div className="sidebar-divider"></div>

      <nav className="contact-nav" id="contactNav" aria-label="Contact info">
        <a href="mailto:pabhishek7333@gmail.com" className="contact-row">
          <div className="contact-icon"><FaEnvelope /></div>
          <div className="contact-value" style={{ fontSize: '0.75rem' }}>pabhishek7333@gmail.com</div>
        </a>
        <a href="tel:+918340195034" className="contact-row">
          <div className="contact-icon"><FaPhone /></div>
          <div className="contact-value">+91 8340195034</div>
        </a>
        <div className="contact-row no-link">
          <div className="contact-icon"><FaCalendarAlt /></div>
          <div className="contact-value">9 Jan 2006</div>
        </div>
      </nav>

      <div className="sidebar-divider"></div>

      <div className="socials-row" id="socialsRow">
        <a href="https://github.com/pabhi0901" target="_blank" rel="noopener noreferrer" className="social-pill" title="GitHub">
          <FaGithub />
        </a>
        <a href="https://www.linkedin.com/in/abhishek-pandey-45b215296/" target="_blank" rel="noopener noreferrer" className="social-pill" title="LinkedIn">
          <FaLinkedinIn />
        </a>
        {/* <a href="#" target="_blank" rel="noopener noreferrer" className="social-pill" title="Code"> */}
          {/* <FaCode /> */}
        {/* </a> */}
        <a href="#" target="_blank" rel="noopener noreferrer" className="social-pill" title="Website">
          <FaGlobe />
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
