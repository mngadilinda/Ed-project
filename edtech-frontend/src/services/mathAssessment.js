// src/services/mathAssessment.js
import axios from 'axios';

export const checkMathAnswer = async (problemId, userAnswer, problemType, correctAnswer, tolerance = 0.01) => {
  try {
    const response = await axios.post('/check-math/', {
      user_answer: userAnswer,
      problem_type: problemType,
      correct_answer: correctAnswer,
      tolerance: tolerance
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error checking math answer:', error);
    return { error: error.response?.data?.error || 'Failed to check answer' };
  }
};