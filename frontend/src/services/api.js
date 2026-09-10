const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

/**
 * Admin Login with password
 */
export const loginAdmin = async (password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to authenticate');
  }
  return data;
};

/**
 * Verify Admin JWT Token
 */
export const verifyAdminToken = async (token) => {
  const response = await fetch(`${API_BASE}/auth/verify`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.ok;
};

/**
 * Fetch Pinecone Index Stats
 */
export const getAdminStats = async (token) => {
  const response = await fetch(`${API_BASE}/admin/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch index stats');
  }
  return data;
};

/**
 * Upload Resume (PDF / TXT)
 */
export const uploadResume = async (file, token) => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await fetch(`${API_BASE}/admin/upload-resume`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to upload and vectorize resume');
  }
  return data;
};

/**
 * Ingest Custom Text Details into Pinecone
 */
export const addTextDetails = async ({ title, category, content }, token) => {
  const response = await fetch(`${API_BASE}/admin/add-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, category, content })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to index details');
  }
  return data;
};

/**
 * Fetch all batches stored in Pinecone
 */
export const getAdminBatches = async (token) => {
  const response = await fetch(`${API_BASE}/admin/batches`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch batches');
  }
  return data.batches || [];
};

/**
 * Delete a specific batch and all its vectors from Pinecone
 */
export const deleteAdminBatch = async (batchId, token) => {
  const response = await fetch(`${API_BASE}/admin/batch/${batchId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete batch');
  }
  return data;
};

/**
 * Clear All Vectors in Pinecone
 */
export const clearPineconeIndex = async (token) => {
  const response = await fetch(`${API_BASE}/admin/clear-index`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to clear Pinecone index');
  }
  return data;
};

/**
 * Public AI Chatbot query
 */
export const sendChatMessage = async (message, history = []) => {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to get answer from AI');
  }
  return data;
};
