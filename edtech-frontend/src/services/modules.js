// src/api/modules.js
const API_URL = 'http://localhost:8000';

export const fetchModule = async (token, programId, moduleId) => {
  const response = await fetch(`${API_URL}/programs/${programId}/modules/${moduleId}/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch module');
  }
  
  return await response.json();
};