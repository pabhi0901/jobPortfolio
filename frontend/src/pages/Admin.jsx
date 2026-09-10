import React, { useState, useEffect, useContext, useRef } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { Link } from 'react-router-dom';
import { 
  FaTrash, 
  FaArrowLeft, 
  FaPlus, 
  FaLock, 
  FaFileUpload, 
  FaDatabase, 
  FaSignOutAlt, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaSyncAlt, 
  FaFilePdf, 
  FaLayerGroup, 
  FaRobot, 
  FaKey,
  FaSpinner,
  FaFileAlt,
  FaCalendarAlt,
  FaInfoCircle
} from 'react-icons/fa';
import { 
  loginAdmin, 
  verifyAdminToken, 
  uploadResume, 
  addTextDetails, 
  getAdminStats, 
  clearPineconeIndex,
  getAdminBatches,
  deleteAdminBatch
} from '../services/api';

const Admin = () => {
  const { projects, addProject, deleteProject } = useContext(ProjectContext);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('portfolio_admin_token') || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('knowledge'); // 'knowledge' | 'projects'

  // Resume Upload State
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeResult, setResumeResult] = useState(null);
  const fileInputRef = useRef(null);

  // Text Ingestion State
  const [textData, setTextData] = useState({
    title: '',
    category: 'Bio',
    content: ''
  });
  const [submittingText, setSubmittingText] = useState(false);
  const [textResult, setTextResult] = useState(null);

  // Pinecone Stats State
  const [pineconeStats, setPineconeStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Batches state (stored and retrieved directly from Pinecone without SQL/Mongo)
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [deletingBatchId, setDeletingBatchId] = useState(null);

  // Project Form State (Existing feature)
  const [projectForm, setProjectForm] = useState({
    title: '',
    link: '',
    image: '',
    description: ''
  });

  // Verify existing token on mount
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      try {
        const valid = await verifyAdminToken(token);
        if (valid) {
          setIsAuthenticated(true);
          fetchStats(token);
          fetchBatches(token);
        } else {
          localStorage.removeItem('portfolio_admin_token');
          setToken('');
          setIsAuthenticated(false);
        }
      } catch (err) {
        localStorage.removeItem('portfolio_admin_token');
        setToken('');
        setIsAuthenticated(false);
      }
    };
    checkToken();
  }, [token]);

  // Fetch Pinecone Stats
  const fetchStats = async (activeToken = token) => {
    if (!activeToken) return;
    setStatsLoading(true);
    try {
      const stats = await getAdminStats(activeToken);
      setPineconeStats(stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Batches from Pinecone Catalog
  const fetchBatches = async (activeToken = token) => {
    if (!activeToken) return;
    setLoadingBatches(true);
    try {
      const list = await getAdminBatches(activeToken);
      setBatches(list || []);
    } catch (err) {
      console.error('Failed to load batches from Pinecone:', err);
    } finally {
      setLoadingBatches(false);
    }
  };

  // Delete Batch from Pinecone
  const handleDeleteBatch = async (batchId, batchName) => {
    if (!window.confirm(`Are you sure you want to delete batch "${batchName}"? All associated vectors will be permanently removed from Pinecone so outdated information won't be used by the chatbot.`)) {
      return;
    }

    setDeletingBatchId(batchId);
    try {
      await deleteAdminBatch(batchId, token);
      await fetchBatches(token);
      await fetchStats(token);
    } catch (err) {
      alert('Error deleting batch: ' + err.message);
    } finally {
      setDeletingBatchId(null);
    }
  };

  // Handle Login Submission
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await loginAdmin(passwordInput.trim());
      if (res.token) {
        localStorage.setItem('portfolio_admin_token', res.token);
        setToken(res.token);
        setIsAuthenticated(true);
        setPasswordInput('');
        fetchStats(res.token);
        fetchBatches(res.token);
      }
    } catch (err) {
      setAuthError(err.message || 'Incorrect password. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('portfolio_admin_token');
    setToken('');
    setIsAuthenticated(false);
    setResumeResult(null);
    setTextResult(null);
    setPineconeStats(null);
    setBatches([]);
  };

  // Handle Resume File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setResumeResult(null);
    }
  };

  // Handle Resume Upload & Vectorization
  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile || !token) return;

    setUploadingResume(true);
    setResumeResult(null);

    try {
      const res = await uploadResume(resumeFile, token);
      setResumeResult({
        type: 'success',
        message: res.message || 'Resume successfully indexed to Pinecone!',
        chunks: res.chunksCount
      });
      setResumeFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchStats(token);
      fetchBatches(token);
    } catch (err) {
      setResumeResult({
        type: 'error',
        message: err.message || 'Failed to upload and vectorize resume'
      });
    } finally {
      setUploadingResume(false);
    }
  };

  // Handle Text Details Ingestion
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textData.content.trim() || !token) return;

    setSubmittingText(true);
    setTextResult(null);

    try {
      const res = await addTextDetails(textData, token);
      setTextResult({
        type: 'success',
        message: res.message || 'Details successfully chunked and indexed!',
        chunks: res.chunksCount
      });
      setTextData({ title: '', category: 'Bio', content: '' });
      fetchStats(token);
      fetchBatches(token);
    } catch (err) {
      setTextResult({
        type: 'error',
        message: err.message || 'Failed to index text details'
      });
    } finally {
      setSubmittingText(false);
    }
  };

  // Handle Clear Pinecone Index
  const handleClearIndex = async () => {
    if (!window.confirm('Are you sure you want to clear all vectors from Pinecone? The chatbot will lose all indexed knowledge until you upload it again.')) {
      return;
    }

    try {
      await clearPineconeIndex(token);
      alert('All vectors cleared successfully.');
      fetchStats(token);
      fetchBatches(token);
    } catch (err) {
      alert('Error clearing index: ' + err.message);
    }
  };

  // Handle Project Submission (Existing feature)
  const handleProjectSubmit = (e) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.image || !projectForm.description) return;
    
    addProject({
      title: projectForm.title,
      link: projectForm.link,
      image: projectForm.image,
      description: projectForm.description
    });
    
    setProjectForm({ title: '', link: '', image: '', description: '' });
  };

  // -------------------------------------------------------------
  // LOGIN SCREEN (If not authenticated)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="page-layout" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div className="glass-card reveal visible" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: 'var(--accent-glow)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem',
            color: 'var(--accent)',
            fontSize: '1.75rem',
            border: '1px solid var(--border-h)'
          }}>
            <FaLock />
          </div>

          <h2 style={{ color: 'var(--text-1)', marginBottom: '0.5rem', fontSize: '1.6rem' }}>Admin Access</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Enter your secret admin password to manage the vector knowledge base and portfolio projects.
          </p>

          {authError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaExclamationTriangle /> {authError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-1)' }}>
                <FaKey /> Admin Password
              </label>
              <input 
                type="password" 
                placeholder="Enter password..."
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
                required 
                autoFocus
                style={{ width: '100%' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={authLoading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
            >
              {authLoading ? (
                <>
                  <FaSpinner className="spin" style={{ marginRight: '0.5rem' }} /> Verifying...
                </>
              ) : (
                'Unlock Admin Portal'
              )}
            </button>
          </form>

          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <Link to="/" style={{ color: 'var(--text-2)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaArrowLeft /> Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="page-layout" style={{ display: 'block', maxWidth: '980px', margin: '0 auto', paddingTop: '3rem', paddingBottom: '5rem' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/" className="btn-outline" style={{ display: 'inline-flex', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <FaArrowLeft style={{ marginRight: '0.5rem' }} /> View Portfolio
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ 
            fontSize: '0.8rem', 
            color: 'var(--text-2)', 
            background: 'var(--glass)', 
            padding: '0.4rem 0.8rem', 
            borderRadius: '20px', 
            border: '1px solid var(--border)' 
          }}>
            🔒 Authenticated (JWT)
          </span>
          <button 
            onClick={handleLogout} 
            className="btn-outline" 
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-1)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>
          Admin <span className="gradient-text">Control Center</span>
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.95rem' }}>
          Manage your AI Vector Knowledge Base (Pinecone &amp; Gemini RAG) and Portfolio Projects.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <button 
          onClick={() => setActiveTab('knowledge')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: activeTab === 'knowledge' ? 'var(--grad)' : 'var(--glass)',
            color: activeTab === 'knowledge' ? '#fff' : 'var(--text-1)',
            fontWeight: activeTab === 'knowledge' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <FaDatabase /> AI Knowledge Base &amp; RAG
        </button>
        <button 
          onClick={() => setActiveTab('projects')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: activeTab === 'projects' ? 'var(--grad)' : 'var(--glass)',
            color: activeTab === 'projects' ? '#fff' : 'var(--text-1)',
            fontWeight: activeTab === 'projects' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <FaLayerGroup /> Portfolio Projects
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: AI KNOWLEDGE BASE (RESUME & TEXT INGESTION)           */}
      {/* ============================================================ */}
      {activeTab === 'knowledge' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Pinecone Vector Index Overview Card */}
          <div className="glass-card reveal visible" style={{ padding: '1.5rem', background: 'var(--glass-b)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ color: 'var(--accent)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <FaDatabase /> Pinecone Index Status
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
                  Index: <strong style={{ color: 'var(--text-1)' }}>{pineconeStats?.indexName || 'portfolio'}</strong> · 
                  Dimension: <strong style={{ color: 'var(--text-1)' }}>{pineconeStats?.dimension || 1024}</strong> · 
                  Total Vectors: <strong style={{ color: 'var(--accent)' }}>{pineconeStats?.totalRecordCount ?? '0'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => fetchStats()} 
                  className="btn-outline" 
                  disabled={statsLoading}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <FaSyncAlt className={statsLoading ? 'spin' : ''} /> Refresh Stats
                </button>
                <button 
                  onClick={handleClearIndex} 
                  className="btn-outline" 
                  style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  title="Wipe all vectors from Pinecone"
                >
                  Clear All Vectors
                </button>
              </div>
            </div>
          </div>

          {/* Ingestion Grid: Two Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
            
            {/* Card 1: Resume File Uploader */}
            <div className="glass-card reveal visible">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--accent-glow)', padding: '0.6rem', borderRadius: '10px', color: 'var(--accent)' }}>
                  <FaFilePdf style={{ fontSize: '1.2rem' }} />
                </div>
                <div>
                  <h3 style={{ color: 'var(--text-1)', fontSize: '1.15rem' }}>Upload Resume</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>Auto-chunks &amp; uploads vectors to Pinecone</p>
                </div>
              </div>

              {resumeResult && (
                <div style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: resumeResult.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: resumeResult.type === 'success' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                  color: resumeResult.type === 'success' ? '#4ade80' : '#f87171'
                }}>
                  {resumeResult.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  <div>
                    <div>{resumeResult.message}</div>
                    {resumeResult.chunks && <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Generated {resumeResult.chunks} vector chunks</div>}
                  </div>
                </div>
              )}

              <form onSubmit={handleResumeUpload}>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border-h)',
                    borderRadius: '12px',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'var(--glass)',
                    transition: 'border-color 0.2s ease',
                    marginBottom: '1rem'
                  }}
                >
                  <FaFileUpload style={{ fontSize: '2rem', color: 'var(--accent)', marginBottom: '0.75rem' }} />
                  <div style={{ color: 'var(--text-1)', fontWeight: '500', marginBottom: '0.25rem' }}>
                    {resumeFile ? resumeFile.name : 'Click to select Resume (PDF or TXT)'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>
                    {resumeFile ? `${(resumeFile.size / 1024).toFixed(1)} KB` : 'Supports .pdf and .txt up to 10MB'}
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".pdf,.txt,application/pdf,text/plain" 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={!resumeFile || uploadingResume}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {uploadingResume ? (
                    <>
                      <FaSpinner className="spin" style={{ marginRight: '0.5rem' }} /> Processing &amp; Vectorizing...
                    </>
                  ) : (
                    <>
                      <FaRobot style={{ marginRight: '0.5rem' }} /> Vectorize Resume to Pinecone
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Card 2: Custom Text Ingestion */}
            <div className="glass-card reveal visible">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--accent-glow)', padding: '0.6rem', borderRadius: '10px', color: 'var(--accent)' }}>
                  <FaDatabase style={{ fontSize: '1.2rem' }} />
                </div>
                <div>
                  <h3 style={{ color: 'var(--text-1)', fontSize: '1.15rem' }}>Add Custom Profile Details</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>Add bio, experience, projects, or Q&amp;A directly</p>
                </div>
              </div>

              {textResult && (
                <div style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: textResult.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: textResult.type === 'success' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                  color: textResult.type === 'success' ? '#4ade80' : '#f87171'
                }}>
                  {textResult.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  <div>
                    <div>{textResult.message}</div>
                    {textResult.chunks && <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Generated {textResult.chunks} vector chunks</div>}
                  </div>
                </div>
              )}

              <form onSubmit={handleTextSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem' }}>Category</label>
                    <select 
                      value={textData.category}
                      onChange={(e) => setTextData({ ...textData, category: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '0.6rem', 
                        borderRadius: '8px', 
                        background: 'var(--bg-2)', 
                        color: 'var(--text-1)', 
                        border: '1px solid var(--border)' 
                      }}
                    >
                      <option value="Bio">Bio &amp; Summary</option>
                      <option value="Experience">Work Experience</option>
                      <option value="Skills">Technical Skills</option>
                      <option value="Projects">Project Details</option>
                      <option value="Education">Education &amp; Certifications</option>
                      <option value="QA">Custom Q&amp;A</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem' }}>Section Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Backend Experience"
                      value={textData.title}
                      onChange={(e) => setTextData({ ...textData, title: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem' }}>Content Details</label>
                  <textarea 
                    rows="5"
                    placeholder="Write or paste your details here... e.g. 'I architected a microservices backend with Node.js and Redis that served 50k users...'"
                    value={textData.content}
                    onChange={(e) => setTextData({ ...textData, content: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={submittingText || !textData.content.trim()}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {submittingText ? (
                    <>
                      <FaSpinner className="spin" style={{ marginRight: '0.5rem' }} /> Chunking &amp; Upserting...
                    </>
                  ) : (
                    <>
                      <FaPlus style={{ marginRight: '0.5rem' }} /> Vectorize &amp; Save to Pinecone
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

          {/* Card 3: Manage Uploaded Vector Batches (No External DB Needed!) */}
          <div className="glass-card reveal visible">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: 'var(--accent-glow)', padding: '0.6rem', borderRadius: '10px', color: 'var(--accent)' }}>
                  <FaLayerGroup style={{ fontSize: '1.2rem' }} />
                </div>
                <div>
                  <h3 style={{ color: 'var(--text-1)', fontSize: '1.15rem' }}>Active Knowledge Batches in Pinecone</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>Tracked entirely inside Pinecone — delete outdated resumes or data anytime</p>
                </div>
              </div>

              <button 
                onClick={() => fetchBatches()} 
                className="btn-outline" 
                disabled={loadingBatches}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <FaSyncAlt className={loadingBatches ? 'spin' : ''} /> Refresh Batches
              </button>
            </div>

            {loadingBatches && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-2)', fontSize: '0.9rem' }}>
                <FaSpinner className="spin" style={{ marginRight: '0.5rem' }} /> Loading batches from Pinecone...
              </div>
            )}

            {!loadingBatches && batches.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '2.5rem 1.5rem',
                background: 'var(--glass)',
                borderRadius: '12px',
                border: '1px dashed var(--border)'
              }}>
                <FaInfoCircle style={{ fontSize: '1.8rem', color: 'var(--text-3)', marginBottom: '0.5rem' }} />
                <p style={{ color: 'var(--text-1)', fontWeight: '500', marginBottom: '0.25rem' }}>No Vector Batches Found</p>
                <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>
                  Upload a PDF resume or enter profile details above. Each upload is cataloged directly in Pinecone with its own unique Batch ID.
                </p>
              </div>
            )}

            {!loadingBatches && batches.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {batches.map((batch) => (
                  <div
                    key={batch.batchId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem 1.25rem',
                      background: 'var(--glass)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: batch.category === 'resume' ? 'rgba(239, 68, 68, 0.15)' : 'var(--accent-glow)',
                        color: batch.category === 'resume' ? '#ef4444' : 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        flexShrink: 0
                      }}>
                        {batch.category === 'resume' ? <FaFilePdf /> : <FaFileAlt />}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <h4 style={{ color: 'var(--text-1)', fontSize: '0.95rem', margin: 0 }}>
                            {batch.name}
                          </h4>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: 'var(--glass-b)',
                            border: '1px solid var(--border)',
                            color: 'var(--accent)',
                            fontWeight: '600'
                          }}>
                            {batch.category}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-2)', flexWrap: 'wrap' }}>
                          <span><strong>{batch.chunkCount}</strong> chunks</span>
                          <span>•</span>
                          <span><FaCalendarAlt style={{ marginRight: '3px' }} /> {new Date(batch.uploadedAt).toLocaleString()}</span>
                          <span>•</span>
                          <span style={{ fontFamily: 'monospace', color: 'var(--text-3)' }}>ID: {batch.batchId}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteBatch(batch.batchId, batch.name)}
                      disabled={deletingBatchId === batch.batchId}
                      className="icon-btn"
                      style={{
                        color: '#ef4444',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        padding: '0.6rem 0.85rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.8rem',
                        borderRadius: '8px'
                      }}
                      title="Delete all vectors in this batch from Pinecone"
                    >
                      {deletingBatchId === batch.batchId ? (
                        <FaSpinner className="spin" />
                      ) : (
                        <>
                          <FaTrash /> Delete Batch
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MANAGE PORTFOLIO PROJECTS                             */}
      {/* ============================================================ */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-card reveal visible">
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Add New Project</h2>
            <form className="contact-form" onSubmit={handleProjectSubmit}>
              <div className="form-group">
                <label>Project Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={projectForm.title} 
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} 
                  required 
                  placeholder="e.g. AI Portfolio Assistant" 
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input 
                  type="url" 
                  name="image" 
                  value={projectForm.image} 
                  onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })} 
                  required 
                  placeholder="https://..." 
                />
              </div>
              <div className="form-group">
                <label>Live Link (Optional)</label>
                <input 
                  type="url" 
                  name="link" 
                  value={projectForm.link} 
                  onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })} 
                  placeholder="https://..." 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={projectForm.description} 
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} 
                  required 
                  rows="4" 
                  placeholder="Brief description of the project..."
                ></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                <FaPlus style={{ marginRight: '0.5rem' }} /> Add Project
              </button>
            </form>
          </div>

          <div className="glass-card reveal visible">
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Manage Existing Projects</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {projects.map(proj => (
                <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--glass)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div>
                    <h4 style={{ color: 'var(--text-1)', marginBottom: '0.2rem' }}>{proj.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{proj.link || 'No link provided'}</p>
                  </div>
                  <button onClick={() => deleteProject(proj.id)} className="icon-btn" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }} title="Delete Project">
                    <FaTrash />
                  </button>
                </div>
              ))}
              {projects.length === 0 && <p style={{ color: 'var(--text-2)' }}>No projects available.</p>}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Admin;
