import { FaMoon } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const TopNav = () => {
  const location = useLocation();

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

        <div className="mobile-two-pills" id="mobileTwoPills">
          <button className="m2-pill active" onClick={() => scrollToSection('about')}>About</button>
          <Link className="m2-pill" to="/projects">Projects</Link>
          <Link className="m2-pill" to="/contact">Contact</Link>
        </div>

        <div className="topnav-controls">
          <button
            className="nav-mischief-btn"
            type="button"
            onClick={() => {
              const nextValue = !document.body.classList.contains('portfolio-inverted');
              document.body.classList.toggle('portfolio-inverted', nextValue);
              localStorage.setItem('portfolio_inverted', String(nextValue));
            }}
          >
            Click Me
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
    </header>
  );
};

export default TopNav;
