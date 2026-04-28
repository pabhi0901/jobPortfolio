import { useEffect } from 'react';
import { FaDownload, FaHandshake, FaUserAstronaut, FaBullseye, FaCheckCircle, FaServer, FaReact, FaDatabase, FaBrain, FaCube, FaChess } from 'react-icons/fa';

const Hero = () => {
  useEffect(() => {
    // Reveal animations for elements within Hero
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = (i % 4) * 0.08 + 's';
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const revealElements = document.querySelectorAll('.reveal:not(.visible)');
    revealElements.forEach(el => observer.observe(el));

    const hero = document.getElementById('heroBanner');
    const card = document.getElementById('heroCard');
    if (!hero || !card) return;
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

    const handleMouseMove = (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      const inverted = document.body.classList.contains('portfolio-inverted');
      const direction = inverted ? -1 : 1;
      card.style.transform = `perspective(800px) rotateX(${y * -8 * direction}deg) rotateY(${x * 10 * direction}deg) translateZ(18px)`;
    };

    const handleMouseLeave = () => {
      card.style.transition = 'transform .6s ease';
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
      setTimeout(() => (card.style.transition = ''), 600);
    };

    hero.addEventListener('mousemove', handleMouseMove);
    hero.addEventListener('mouseleave', handleMouseLeave);

    // Service cards glow effect
    const serviceCards = document.querySelectorAll('.service-card');
    const handleServiceMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inverted = document.body.classList.contains('portfolio-inverted');
      card.style.setProperty('--gx', (inverted ? rect.width - x : x) + 'px');
      card.style.setProperty('--gy', (inverted ? rect.height - y : y) + 'px');
    };

    serviceCards.forEach(card => {
      card.addEventListener('mousemove', handleServiceMove);
    });

    return () => {
      observer.disconnect();
      if (hero) {
        hero.removeEventListener('mousemove', handleMouseMove);
        hero.removeEventListener('mouseleave', handleMouseLeave);
      }
      serviceCards.forEach(card => {
        card.removeEventListener('mousemove', handleServiceMove);
      });
    };
  }, []);

  return (
    <section className="section active" id="about">
      <div className="hero-banner" id="heroBanner">
        <div className="hero-grid-lines" aria-hidden="true"></div>
        <div className="hero-text">
          <p className="hero-greeting">Hello, I'm Abhishek. Nice to meet you.</p>
          <h2 className="hero-title">I turn ideas into <br /> <span className="gradient-text">full-stack products </span> powered by <span className="gradient-text"> real intelligence</span></h2>
          <p className="hero-sub">Backend Developer · Software Architect · AI Integrator · Problem Solver</p>
          <div className="hero-cta">
            <a href="https://ik.imagekit.io/g6obyrspb/Abhishek_Pandey_Resume.pdf" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Download Resume <FaDownload />
            </a>
            <button className="btn-outline" onClick={() => document.getElementById('contact').scrollIntoView({behavior: 'smooth'})}>
              Hire Me <FaHandshake />
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card-float tilt-target" id="heroCard">
            <div className="code-window">
              <div className="code-dots"><span></span><span></span><span></span></div>
              <pre className="code-body">
                <code>
                  <span className="ct">class</span> <span className="cn">AbhishekPandey</span>:{'\n'}
                  {'  '}<span className="ct">def</span> <span className="cn">__init__</span>(self):{'\n'}
                  {'    '}self.role    = <span className="cs">"Backend Developer"</span>{'\n'}
                  {'    '}self.focus   = <span className="cs">"AI Agents &amp; Architecture"</span>{'\n'}
                  {'    '}self.stack   = [<span className="cs">"Node.js"</span>,{'\n'}
                  {'                    '}<span className="cs">"Python"</span>,{'\n'}
                  {'                    '}<span className="cs">"LangChain"</span>]{'\n'}
                  {'    '}self.skills  = <span className="cs">"APIs, DBs, AI-Integration"</span>{'\n\n'}
                  {'  '}<span className="ct">def</span> <span className="cn">build</span>(self):{'\n'}
                  {'    '}<span className="ct">return</span> <span className="cs">"Scalable, intelligent platforms."</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-row" id="statsRow" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-value-row">
            <span className="stat-num">300</span><span className="stat-plus">+</span>
          </div>
          <span className="stat-label">DSA Problems Solved</span>
        </div>
        <div className="stat-card">
          <div className="stat-value-row">
            <span className="stat-num">3</span><span className="stat-plus">+</span>
          </div>
          <span className="stat-label">Production Projects</span>
        </div>
        <div className="stat-card">
          <div className="stat-value-row">
            <span className="stat-num">2</span><span className="stat-plus">+</span>
          </div>
          <span className="stat-label">Years Experience</span>
        </div>
      </div>

      <div className="two-col-grid">
        <div className="glass-card reveal">
          <div className="card-header-icon"><FaUserAstronaut /></div>
          <h3>Who I Am</h3>
          <p>I'm a backend-focused developer from India. I'm passionate about designing scalable backend architectures and integrating AI agents into web platforms using LangChain and modern technologies.</p>
          <p>Currently working on <strong>AI-Powered Web Applications</strong> — architecting intelligent backend systems that solve real-world problems.</p>
        </div>
        <div className="glass-card reveal">
          <div className="card-header-icon"><FaBullseye /></div>
          <h3>What I'm Focused On</h3>
          <ul className="check-list">
            <li><FaCheckCircle /> Scalable REST APIs &amp; WebSockets</li>
            <li><FaCheckCircle /> Database Design &amp; Optimization</li>
            <li><FaCheckCircle /> AI Agent Integration (LangChain, OpenAI)</li>
            <li><FaCheckCircle /> Backend Architecture &amp; System Design</li>
            <li><FaCheckCircle /> Cloud Deployment &amp; DevOps</li>
          </ul>
        </div>
      </div>

      <div className="section-label">What I Do</div>
      <div className="services-grid" id="servicesGrid">
        <div className="service-card">
          <div className="service-glow"></div>
          <div className="service-icon-wrap"><FaServer /></div>
          <h4>Backend Development</h4>
          <p>Node.js, Express, FastAPI — scalable REST APIs and secure authentication.</p>
        </div>
        <div className="service-card">
          <div className="service-glow"></div>
          <div className="service-icon-wrap"><FaBrain /></div>
          <h4>AI Integration</h4>
          <p>LangChain, OpenAI API, RAG — intelligent workflows and autonomous AI agents.</p>
        </div>
        <div className="service-card">
          <div className="service-glow"></div>
          <div className="service-icon-wrap"><FaDatabase /></div>
          <h4>Database Design</h4>
          <p>MongoDB, PostgreSQL, Redis — optimized data structures and indexing strategies.</p>
        </div>
        <div className="service-card">
          <div className="service-glow"></div>
          <div className="service-icon-wrap"><FaChess /></div>
          <h4>Problem Solving</h4>
          <p>300+ DSA problems solved — strong algorithmic thinking and optimization.</p>
        </div>
        <div className="service-card">
          <div className="service-glow"></div>
          <div className="service-icon-wrap"><FaCube /></div>
          <h4>DevOps &amp; Deployment</h4>
          <p>Docker, CI/CD, AWS — containerization and scalable cloud infrastructure.</p>
        </div>
        <div className="service-card">
          <div className="service-glow"></div>
          <div className="service-icon-wrap"><FaReact /></div>
          <h4>Frontend Integration</h4>
          <p>React.js with Tailwind CSS — ensuring seamless connectivity between backend logic and dynamic user interfaces.</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
