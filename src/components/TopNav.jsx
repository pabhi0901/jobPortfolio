import { useState } from 'react';
import { FaBars, FaMoon, FaTimes } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const TopNav = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((currentValue) => !currentValue);
  };

  const handleMobileClickMe = () => {
    const nextValue = !document.body.classList.contains('portfolio-inverted');
    document.body.classList.toggle('portfolio-inverted', nextValue);
    localStorage.setItem('portfolio_inverted', String(nextValue));
    setMobileMenuOpen(false);
  };

  return (
    <header className="topnav" id="topnav" role="banner">
      <div className="topnav-inner">
        <Link className="topnav-logo" to="/">
          <img 
            id="logoAvatar" 
            src="https://github.com/pabhi0901.png" 
            alt="Abhishek" 
            className="logo-avatar"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
          />
          <span className="logo-initials-fb" style={{ display: 'none' }}>AP</span>
          <span className="logo-name">Abhishek Pandey</span>
        </Link>

        <nav className="topnav-pills" id="topnavPills">
          <button className="topnav-pill" onClick={() => scrollToSection('about')}>About</button>
          <Link className="topnav-pill" to="/resume">Resume</Link>
          <Link className="topnav-pill" to="/projects">Projects</Link>
          <Link className="topnav-pill" to="/contact">Contact</Link>
        </nav>

        <div className="topnav-controls">
          <button
            className="nav-mischief-btn"
            type="button"
            onClick={handleMobileClickMe}
          >
            Click Me
          </button>
          <button
            className="icon-btn hamburger-btn"
            type="button"
            aria-label="Toggle navigation menu"
            aria-controls="mobileNav"
            aria-expanded={mobileMenuOpen}
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <button className="icon-btn" aria-label="Toggle theme" title="Switch light / dark" onClick={() => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
          }}>
            <FaMoon id="themeIcon" />
          </button>
        </div>
      </div>

      <nav className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`} id="mobileNav" aria-label="Mobile navigation">
        <button className={`mobile-nav-btn ${location.pathname === '/' ? 'active' : ''}`} onClick={() => {
          scrollToSection('about');
          setMobileMenuOpen(false);
        }}>About</button>
        <Link className={`mobile-nav-btn ${location.pathname === '/resume' ? 'active' : ''}`} to="/resume" onClick={() => setMobileMenuOpen(false)}>Resume</Link>
        <Link className={`mobile-nav-btn ${location.pathname === '/projects' ? 'active' : ''}`} to="/projects" onClick={() => setMobileMenuOpen(false)}>Projects</Link>
        <Link className={`mobile-nav-btn ${location.pathname === '/contact' ? 'active' : ''}`} to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
        <button className="mobile-nav-btn" type="button" onClick={handleMobileClickMe}>Click Me</button>
      </nav>
    </header>
  );
};

export default TopNav;
