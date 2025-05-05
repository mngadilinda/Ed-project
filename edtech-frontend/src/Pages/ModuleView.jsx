// src/pages/ModuleView.jsx
import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchModule } from '../api/modules';
import LessonItem from '../components/Learn/LessonItem';
import Breadcrumb from '../components/Common/Breadcrumb';

const ModuleView = () => {
  const { user } = useContext(AuthContext);
  const { programId, moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadModule = async () => {
      try {
        const data = await fetchModule(user.token, programId, moduleId);
        setModule(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadModule();
  }, [user, navigate, programId, moduleId]);

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
              { name: module.program_title, href: `/programs/${programId}` },
              { name: module.title }
            ]}
          />
          <div className="mt-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {module.lessons.length} lessons
              </span>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                {module.total_duration} min
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {/* Module Description */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-2">About This Module</h2>
              <p className="text-gray-700">{module.description}</p>
            </div>

            {/* Learning Objectives */}
            {module.learning_objectives.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-2">What You'll Learn</h2>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {module.learning_objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lessons List */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Lessons</h2>
              <div className="space-y-2">
                {module.lessons.map((lesson) => (
                  <LessonItem 
                    key={lesson.id}
                    lesson={lesson}
                    onClick={() => navigate(`/learn/${programId}/${lesson.id}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModuleView;