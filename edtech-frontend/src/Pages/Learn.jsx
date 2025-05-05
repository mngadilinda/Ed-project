// src/pages/Learn.jsx
import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { learnService } from '../services/services';
import LessonSidebar from '../components/Learn/LessonSidebar';
import LessonContent from '../components/Learn/LessonContent';
import { Button } from '../components/ui/Button'

const Learn = () => {
  const { user } = useContext(AuthContext);
  const { programId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check for valid parameters
    if (!programId || !lessonId) {
      setError('Invalid program or lesson ID');
      setLoading(false);
      return;
    }

    const loadLesson = async () => {
      try {
        const { data } = await learnService.fetchLesson(programId, lessonId);
        setLesson(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('No content available yet');
        } else {
          setError(err.message || 'Failed to load lesson');
        }
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [user, navigate, programId, lessonId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Content Not Available</h2>
          <p className="text-gray-600 mb-6">
            {error === 'No content available yet'
              ? 'This learning program is still being developed. Please check back later!'
              : error}
          </p>
          <Button 
            onClick={() => navigate('/programs')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Browse Available Programs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <LessonSidebar programId={programId} currentLessonId={lessonId} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              {lesson?.program_title || 'Learning'}
            </h1>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Complete Lesson
              </button>
            </div>
          </div>
        </header>

        {/* Lesson Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <LessonContent lesson={lesson} />
        </main>

        {/* Navigation Footer */}
        <footer className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-7xl mx-auto flex justify-between">
            <button 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition disabled:opacity-50"
              disabled={!lesson?.previous_lesson}
              onClick={() => navigate(`/learn/${programId}/${lesson?.previous_lesson}`)}
            >
              Previous
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              disabled={!lesson?.next_lesson}
              onClick={() => navigate(`/learn/${programId}/${lesson?.next_lesson}`)}
            >
              Next Lesson
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Learn;