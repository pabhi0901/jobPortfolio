import React, { createContext, useState, useEffect } from 'react';

export const ProjectContext = createContext();

const defaultProjects = [
  {
    id: 1,
    title: 'Park-Intel — Intelligent GeoSpatial Parking',
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1000',
    link: 'https://park-intel.vercel.app/',
    description: 'Real-time smart parking backend with transactional slot management, OCR vehicle detection, Redis GeoSpatial indexing.'
  },
  {
    id: 2,
    title: 'WeCare — AI-Powered Care Service',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000',
    link: 'https://we-caree.vercel.app/',
    description: 'Full-stack care service platform for seniors and differently-abled users with role-based dashboards.'
  }
];

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('abhishek_projects');
    if (saved) {
      setProjects(JSON.parse(saved));
    } else {
      setProjects(defaultProjects);
      localStorage.setItem('abhishek_projects', JSON.stringify(defaultProjects));
    }
  }, []);

  const addProject = (project) => {
    const newProject = { ...project, id: Date.now() };
    const updated = [newProject, ...projects];
    setProjects(updated);
    localStorage.setItem('abhishek_projects', JSON.stringify(updated));
  };

  const deleteProject = (id) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('abhishek_projects', JSON.stringify(updated));
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
};
