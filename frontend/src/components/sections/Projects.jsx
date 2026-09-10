import { useEffect, useRef, useState } from 'react';
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa';

const projectsData = [
  {
    id: 1,
    title: 'SwasthyaLink',
    description: 'Built a full-stack healthcare platform with a multi-role RBAC system (Admin, Doctor, Nurse, Customer) using JWT-secured routing and isolated workflows. Developed a LangGraph-based AI agent for symptom analysis, service recommendations, and automated end-to-end bookings. Implemented a real-time nurse allocation engine handling availability, leaves, and scheduling conflicts. Integrated video consultations via Agora SDK with prescription management, along with Socket.io-based real-time chat and automated leave approval propagation into the scheduling system.',
    image: 'https://ik.imagekit.io/g6obyrspb/portfolio/swas.JPG',
    liveLink: 'https://swasthyalink-two.vercel.app/',
    githubLink: 'https://github.com/pabhi0901/SwasthyaLink'
  },
  {
    id: 2,
    title: 'Ai Chat App',
    description: 'Developed a production-grade AI chat application using Gemini API with a dual-memory architecture—short-term memory (recent context) and long-term memory via Pinecone embeddings for contextual recall. Enabled real-time bidirectional messaging using Socket.io with low-latency streaming. Secured APIs with JWT-based authentication and scalable session handling. Added features like AI-powered MCQ generation and a privacy-focused Incognito Mode supporting limited, non-persistent anonymous sessions.',
    image: 'https://ik.imagekit.io/g6obyrspb/portfolio/ais.JPG',
    liveLink: 'https://ai-app-qctp.vercel.app/',
    githubLink: 'https://github.com/pabhi0901/Ai_App.git'
  },
  {
    id: 3,
    title: 'Marketplace Backend – Scalable Microservices Architecture',
    description: 'Designed and developed a full backend for a marketplace using a microservices architecture, where core services like authentication, product, cart, order, payment, and AI assistant operate independently and can be deployed separately. Implemented inter-service communication using Axios, enabling loosely coupled and scalable system interactions. Built an AI-powered “AIBuddy” service that processes user queries, retrieves relevant products from the database, and autonomously adds them to the cart. Structured the system for high scalability, maintainability, and independent service management in a production-ready environment.',
    image:"https://img.freepik.com/free-vector/data-economy-isometric-composition-with-flowchart-connected-platforms-with-human-characters-computer-folders-blocks-vector-illustration_1284-79926.jpg",
    liveLink: '',
    githubLink: 'https://github.com/pabhi0901/Marketplace-Backend'
  },
   {
    id: 7,
    title: 'WeWork – On-Demand Home Services Platform',
    description: 'Built a production-ready platform connecting customers with location-based service providers for tasks like plumbing, painting, and household maintenance. Implemented a worker onboarding system with detailed profiles and police verification to ensure trust and safety. Enabled users to discover and book services based on location and requirements, delivering a seamless and reliable service experience in a live startup environment.',
    image: 'https://ik.imagekit.io/g6obyrspb/portfolio/11.JPG',
    liveLink: '',
    githubLink: 'https://github.com/pabhi0901/WeWork'
  },
  {
    id: 4,
    title: 'Expenza',
    description: 'Built a full-stack expense management system featuring one-click e-commerce expense synchronization and OCR-based bill scanning for automatic expense tracking from images. Implemented monthly budget monitoring with real-time alerts via email and in-app notifications when spending limits are exceeded. Secured third-party integrations using OAuth, ensuring safe and seamless account connectivity.',
    image: 'https://ik.imagekit.io/g6obyrspb/portfolio/eee.JPG?updatedAt=1777359862495',
    liveLink: '',
    githubLink: 'https://github.com/pabhi0901/Expenza'
  },
  {
    id: 5,
    title: 'Browser Based OS',
    description: 'Developed a browser-based OS simulation replicating core desktop functionalities within a single-page application. Implemented draggable and resizable windows with functional controls (minimize, maximize, close) and a custom context menu system. Built an in-browser file explorer, notes app, and image viewer to simulate real OS interactions, delivering a lightweight and immersive desktop-like experience directly in the browser.',
    image: 'https://ik.imagekit.io/g6obyrspb/portfolio/bb.JPG',
    liveLink: 'https://pabhi0901.github.io/Browser-Based-OS/',
    githubLink: 'https://github.com/pabhi0901/Browser-Based-OS'
  },
  {
    id: 6,
    title: 'Productivity Dashboard',
    description: 'Developed a unified productivity dashboard combining multiple utility tools into a single interface, including to-do list, daily planner, Pomodoro timer, goal tracking, motivational widgets, and real-time date, time, and weather updates. Implemented multi-theme support for customizable user experience and leveraged localStorage for persistent state management, ensuring user data and progress are retained seamlessly across sessions.',
    image: 'https://ik.imagekit.io/g6obyrspb/portfolio/mmm.JPG',
    liveLink: 'https://pabhi0901.github.io/Productivity-DashBoard/',
    githubLink: 'https://github.com/pabhi0901/Productivity-DashBoard'
  },
  {
    id: 8,
    title: 'Moody Player',
    description:"Developed an AI-powered music player that detects user mood in real time through camera input and recommends songs accordingly. Implemented emotion recognition using computer vision to classify facial expressions and map them to predefined mood categories. Integrated a pre-stored music library to deliver instant, context-aware song suggestions, creating a personalized and adaptive listening experience.",
    image:"https://ik.imagekit.io/g6obyrspb/portfolio/mooda.JPG",
    livelink:"",
    githubLink: 'https://github.com/pabhi0901/Moody-Player'
  },
  {
    id:10,
    title:"Food Recipe",
    description:"Developed a responsive frontend web application for creating, viewing, and updating food recipes with an intuitive and user-friendly interface. Implemented dynamic UI components for recipe management, enabling smooth interaction and seamless navigation. Focused on clean design, state handling, and efficient rendering to deliver an engaging user experience.",
    liveLink:"https://food-recipe-eight-gray.vercel.app/",
    githubLink:"https://github.com/pabhi0901/FoodRecipe",
    image:"https://ik.imagekit.io/g6obyrspb/portfolio/food.JPG?updatedAt=1777372788249"
  }

];

const Projects = () => {
  const sectionRef = useRef(null);
  const [previewProject, setPreviewProject] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewStyle, setPreviewStyle] = useState({});
  const hideTimer = useRef(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const revealEls = document.querySelectorAll('#projects .reveal:not(.visible)');
    revealEls.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handlePreviewEnter = (proj, e) => {
    if (!proj || !proj.liveLink) return;
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    // prefer a moderate preview size to avoid jumping far across the screen
    const overlayW = Math.max(300, Math.min(420, Math.floor(window.innerWidth * 0.45)));
    const overlayH = Math.max(220, Math.min(340, Math.floor(window.innerHeight * 0.45)));
    const margin = 8; // small gap; we'll slightly overlap to avoid cursor gap

    // center overlay vertically on the card
    let top = Math.round(rect.top + rect.height / 2 - overlayH / 2);
    if (top < margin) top = margin;
    if (top + overlayH + margin > window.innerHeight) top = Math.max(margin, window.innerHeight - overlayH - margin);

    let left;
    if (rect.right + overlayW + margin < window.innerWidth) {
      // place to the right of the card (slight overlap so there's no pointer gap)
      left = Math.max(margin, rect.right - 8);
    } else if (rect.left - overlayW - margin > 0) {
      // place to the left of the card (slight overlap)
      left = Math.max(margin, rect.left - overlayW + 8);
    } else {
      // fallback near right edge
      left = Math.max(margin, window.innerWidth - overlayW - margin);
    }

    // position relative to the projects grid container (absolute)
    const grid = document.getElementById('myProjectsGrid');
    const gridRect = grid ? grid.getBoundingClientRect() : { left: 0, top: 0 };
    const relTop = top - gridRect.top;
    const relLeft = left - gridRect.left;

    // small delay to avoid flicker when moving fast between cards
    setTimeout(() => {
      setPreviewStyle({ position: 'absolute', top: `${relTop}px`, left: `${relLeft}px`, width: `${overlayW}px`, height: `${overlayH}px` });
      setPreviewProject(proj);
      setPreviewVisible(true);
    }, 80);
  };

  const closePreview = () => {
    setPreviewVisible(false);
    setPreviewProject(null);
  };

  // Close preview when clicking outside the overlay
  useEffect(() => {
    if (!previewVisible) return;
    const onDocClick = (ev) => {
      const overlay = document.querySelector('.proj-preview-overlay');
      if (!overlay) return;
      if (!overlay.contains(ev.target)) {
        closePreview();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [previewVisible]);

  // Drag handlers
  const startDrag = (e) => {
    e.stopPropagation();
    isDragging.current = true;
    const rect = e.currentTarget.closest('.proj-preview-overlay').getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
  };

  const onDrag = (e) => {
    if (!isDragging.current) return;
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    const overlayW = parseInt(previewStyle.width || 400, 10);
    const overlayH = parseInt(previewStyle.height || 300, 10);
    const margin = 8;

    // constrain movement inside the projects grid
    const grid = document.getElementById('myProjectsGrid');
    const gridRect = grid ? grid.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

    let left = e.clientX - gridRect.left - dragOffset.current.x;
    let top = e.clientY - gridRect.top - dragOffset.current.y;
    if (left < margin) left = margin;
    if (top < margin) top = margin;
    if (left + overlayW + margin > gridRect.width) left = gridRect.width - overlayW - margin;
    if (top + overlayH + margin > gridRect.height) top = gridRect.height - overlayH - margin;
    setPreviewStyle((s) => ({ ...s, left: `${left}px`, top: `${top}px` }));
  };

  const endDrag = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
  };

  const handlePreviewLeave = () => {
    // delay hide so quick mouse moves don't close it immediately
    hideTimer.current = setTimeout(() => {
      setPreviewVisible(false);
        setPreviewProject(null);
    }, 400);
  };

  return (
    <section className="section active" id="projects" ref={sectionRef}>
      <div className="section-label reveal">Projects</div>
      <div className="projects-grid" id="myProjectsGrid">
        {projectsData.map((proj) => (
          <div
            className="glass-card proj-card reveal"
            key={proj.id}
            onClick={(e) => proj.liveLink && handlePreviewEnter(proj, e)}
          >
            <div className="proj-thumb">
              <img src={proj.image} alt={proj.title} className="proj-img" />
            </div>
            <div className="proj-body">
              <h4 className="proj-name">{proj.title}</h4>
              <p className="proj-desc">{proj.description}</p>
              <div className="proj-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                {proj.githubLink && (
                  <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" className="proj-btn github-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-1)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.3s ease', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <FaGithub size={16} /> <span>Source Code</span>
                  </a>
                )}
                {proj.liveLink && (
                  <a href={proj.liveLink} target="_blank" rel="noopener noreferrer" className="proj-btn live-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--accent)', color: '#000', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(196, 168, 130, 0.3)' }}>
                    <FaExternalLinkAlt size={14} /> <span>Try it live</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        {/* Floating preview overlay (image + title + open button) */}
        {previewVisible && previewProject && (
          <div
            className="proj-preview-overlay"
            style={previewStyle}
            onClick={() => {
              // don't open while dragging
              if (isDragging.current) return;
              window.open(previewProject.liveLink, '_blank');
            }}
            onMouseEnter={() => {
              if (hideTimer.current) {
                clearTimeout(hideTimer.current);
                hideTimer.current = null;
              }
            }}
            onMouseLeave={handlePreviewLeave}
            role="button"
            tabIndex={0}
          >
            <div className="proj-preview-inner">
              <div className="proj-preview-header" onMouseDown={startDrag} onClick={(ev) => ev.stopPropagation()}>
                <span>{previewProject.title} — Preview</span>
                <button
                  className="proj-preview-close"
                  aria-label="Close preview"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setPreviewVisible(false);
                    setPreviewProject(null);
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="proj-preview-body">
                <img src={previewProject.image} alt={previewProject.title} className="proj-preview-image" />
                <div className="proj-preview-actions">
                  <a href={previewProject.liveLink} target="_blank" rel="noopener noreferrer" className="proj-btn live-btn" onClick={(e) => e.stopPropagation()}>
                    <FaExternalLinkAlt size={14} /> <span>Open live site</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
