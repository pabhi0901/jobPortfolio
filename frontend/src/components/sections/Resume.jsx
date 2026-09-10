import { useEffect, useRef, useState } from 'react';
import { FaGraduationCap, FaDownload } from 'react-icons/fa';
import Skills from './Skills';

const Resume = () => {
  const [countersVisible, setCountersVisible] = useState(false);
  const sectionRef = useRef(null);
  const eduRef = useRef(null);

  useEffect(() => {
    // Reveal animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const revealEls = document.querySelectorAll('#resume .reveal:not(.visible)');
    revealEls.forEach(el => observer.observe(el));

    // Counter animation for score badges
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setCountersVisible(true);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (eduRef.current) {
      counterObserver.observe(eduRef.current);
    }

    return () => {
      observer.disconnect();
      counterObserver.disconnect();
    };
  }, []);



  const education = [
    {
      year: '2023 — 2027',
      degree: 'B.Tech in Computer Science',
      school: 'Quantum University',
      score: '8.0',
      scoreLabel: 'CGPA',
      color: '#c4a882',
    },
    {
      year: '2023',
      degree: '12th Grade (CBSE)',
      school: 'Jawahar Navodaya Vidyalaya, Bhojpur',
      score: '74%',
      scoreLabel: 'Percentage',
      color: '#a88c6a',
    },
    {
      year: '2021',
      degree: '10th Grade (CBSE)',
      school: 'Jawahar Navodaya Vidyalaya, Bhojpur',
      score: '91.8%',
      scoreLabel: 'Percentage',
      color: '#d4b896',
    },
  ];

  return (
    <section className="section active" id="resume" ref={sectionRef}>

      {/* Page Header */}
      <div className="resume-hero reveal">
        <div className="resume-hero-text">
          <span className="resume-tag">// my_resume</span>
          <h2 className="resume-main-title">The <span className="gradient-text">Arsenal</span> & The <span className="gradient-text">Journey</span></h2>
          <p className="resume-subtitle">Technologies I command and the path that shaped me.</p>
        </div>
        <a href="https://ik.imagekit.io/g6obyrspb/resume_updated.pdf" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ alignSelf: 'center' }}>
          Download PDF <FaDownload />
        </a>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <Skills />
      </div>

      {/* ═══ EDUCATION TIMELINE ═══ */}
      <div className="section-label reveal" style={{ marginTop: '2.5rem' }}><FaGraduationCap style={{ marginRight: '0.5rem' }} /> Education</div>
      <div className="edu-timeline reveal" ref={eduRef}>
        <div className="edu-track"></div>
        {education.map((ed, idx) => (
          <div className={`edu-node ${countersVisible ? 'animate-in' : ''}`} key={idx} style={{ animationDelay: `${idx * 0.2}s` }}>
            <div className="edu-dot-wrap">
              <div className="edu-dot" style={{ '--dot-color': ed.color }}></div>
              <div className="edu-pulse" style={{ '--dot-color': ed.color }}></div>
            </div>
            <div className="edu-card">
              <div className="edu-card-inner">
                <span className="edu-year">{ed.year}</span>
                <h4 className="edu-degree">{ed.degree}</h4>
                <p className="edu-school">{ed.school}</p>
              </div>
              <div className="edu-score-badge" style={{ '--badge-color': ed.color }}>
                <span className="edu-score-value">{ed.score}</span>
                <span className="edu-score-label">{ed.scoreLabel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};

export default Resume;
