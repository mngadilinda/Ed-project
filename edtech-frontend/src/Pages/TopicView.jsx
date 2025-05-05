// src/pages/TopicView.jsx
import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchTopic, completeTopic } from '../api/learn';
import Breadcrumb from '../components/Common/Breadcrumb';
import VideoPlayer from '../components/Learn/VideoPlayer';
import MarkdownContent from '../components/Learn/MarkdownContent';

const TopicView = () => {
  const { user } = useContext(AuthContext);
  const { programId, topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadTopic = async () => {
      try {
        const data = await fetchTopic(user.token, programId, topicId);
        setTopic(data);
        setIsCompleted(data.is_completed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTopic();
  }, [user, navigate, programId, topicId]);

  const handleComplete = async () => {
    try {
      await completeTopic(user.token, programId, topicId);
      setIsCompleted(true);
    } catch (err) {
      console.error('Error completing topic:', err);
    }
  };

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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumb 
            items={[
              { name: 'Programs', href: '/programs' },
              { name: topic.program_title, href: `/programs/${programId}` },
              { name: topic.module_title, href: `/programs/${programId}/modules/${topic.module_id}` },
              { name: topic.title }
            ]}
          />
          <div className="mt-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{topic.title}</h1>
            <div className="flex items-center space-x-4">
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {topic.duration} min
              </span>
              {isCompleted && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {/* Video or Media Content */}
          {topic.media_url && (
            <div className="bg-black">
              <VideoPlayer url={topic.media_url} />
            </div>
          )}

          {/* Lesson Content */}
          <div className="px-4 py-5 sm:p-6">
            <MarkdownContent content={topic.content} />

            {/* Actions */}
            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between">
              {topic.previous_lesson && (
                <button
                  onClick={() => navigate(`/learn/${programId}/${topic.previous_lesson}`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Previous Lesson
                </button>
              )}
              
              <div className="flex space-x-3">
                {!isCompleted && (
                  <button
                    onClick={handleComplete}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Mark as Complete
                  </button>
                )}
                
                {topic.next_lesson ? (
                  <button
                    onClick={() => navigate(`/learn/${programId}/${topic.next_lesson}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Next Lesson
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/programs/${programId}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Back to Program
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TopicView;