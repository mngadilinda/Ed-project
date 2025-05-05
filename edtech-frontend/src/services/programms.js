const API_URL = 'http://localhost:8000';

export const fetchPrograms = async (token) => {
  const response = await fetch(`${API_URL}/programs/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch programs');
  }
  
  return await response.json();
};

export const fetchProgramDetail = async (token, programId) => {
  const response = await fetch(`${API_URL}/programs/${programId}/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch program details');
  }
  
  return await response.json();
};

export const enrollInProgram = async (token, programId) => {
  const response = await fetch(`${API_URL}/programs/${programId}/enroll/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to enroll in program');
  }
  
  return await response.json();
};