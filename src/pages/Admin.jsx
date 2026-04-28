import React, { useState, useContext } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { Link } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaPlus } from 'react-icons/fa';

const Admin = () => {
  const { projects, addProject, deleteProject } = useContext(ProjectContext);
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    image: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image || !formData.description) return;
    
    addProject({
      title: formData.title,
      link: formData.link,
      image: formData.image,
      description: formData.description
    });
    
    setFormData({ title: '', link: '', image: '', description: '' });
  };

  return (
    <div className="page-layout" style={{ display: 'block', maxWidth: '800px', margin: '0 auto', paddingTop: '4rem' }}>
      <Link to="/" className="btn-outline" style={{ display: 'inline-flex', marginBottom: '2rem' }}>
        <FaArrowLeft style={{ marginRight: '0.5rem' }} /> Back to Portfolio
      </Link>
      
      <div className="glass-card reveal">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Add New Project</h2>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. My Awesome App" />
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input type="url" name="image" value={formData.image} onChange={handleChange} required placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Live Link (Optional)</label>
            <input type="url" name="link" value={formData.link} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" placeholder="Brief description of the project..."></textarea>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            <FaPlus style={{ marginRight: '0.5rem' }} /> Add Project
          </button>
        </form>
      </div>

      <div className="glass-card reveal" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Manage Projects</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {projects.map(proj => (
            <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--glass)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div>
                <h4 style={{ color: 'var(--text-1)', marginBottom: '0.2rem' }}>{proj.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{proj.link || 'No link provided'}</p>
              </div>
              <button onClick={() => deleteProject(proj.id)} className="icon-btn" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                <FaTrash />
              </button>
            </div>
          ))}
          {projects.length === 0 && <p>No projects available.</p>}
        </div>
      </div>
    </div>
  );
};

export default Admin;
