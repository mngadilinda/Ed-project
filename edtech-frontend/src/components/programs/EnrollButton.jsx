// src/components/Programs/EnrollButton.jsx
import { useState } from 'react';
import { enrollInProgram } from '../../services/programms';

const EnrollButton = ({ programId, isEnrolled, onEnroll }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEnroll = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call your API to enroll
      await enrollInProgram(programId);
      onEnroll();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {isEnrolled ? (
        <button
          disabled
          className="px-6 py-3 bg-green-100 text-green-800 rounded-md font-medium"
        >
          Enrolled
        </button>
      ) : (
        <button
          onClick={handleEnroll}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50"
        >
          {loading ? 'Enrolling...' : 'Enroll Now'}
        </button>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default EnrollButton;