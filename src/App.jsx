import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import ResumePage from './pages/ResumePage';
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';
import { ProjectProvider } from './context/ProjectContext';

function App() {
  useEffect(() => {
    const saved = localStorage.getItem('portfolio_inverted') === 'true';
    document.body.classList.toggle('portfolio-inverted', saved);
  }, []);

  return (
    <ProjectProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </ProjectProvider>
  );
}

export default App;
