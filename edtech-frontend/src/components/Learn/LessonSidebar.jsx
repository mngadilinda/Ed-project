// src/components/Learn/LessonSidebar.jsx
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { modulesService } from '../../services/services';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const LessonSidebar = ({ programId, currentLessonId }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const loadModules = async () => {
      try {
        const data = await modulesService(currentUser.token, programId);
        setModules(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, [currentUser, navigate, programId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50">
        Error loading modules: {error}
      </div>
    );
  }

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-20">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-md bg-white shadow-md"
        >
          {mobileSidebarOpen ? (
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-10 w-64 bg-white shadow-lg transform ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Course Content
            </h2>
            <p className="text-sm text-gray-500">
              {modules.length} modules
            </p>
          </div>

          {/* Modules list */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {modules.map((module) => (
                <div key={module.id} className="mb-6">
                  <h3 className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded-md">
                    Module {module.order}: {module.title}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <Link
                          to={`/learn/${programId}/${lesson.id}`}
                          onClick={() => setMobileSidebarOpen(false)}
                          className={`flex items-center px-3 py-2 text-sm rounded-md ${
                            lesson.id === currentLessonId
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span className="truncate">
                            {lesson.order}. {lesson.title}
                          </span>
                          {lesson.completed && (
                            <span className="ml-auto">
                              <svg
                                className="h-4 w-4 text-green-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => navigate(`/programs/${programId}`)}
              className="w-full px-4 py-2 text-sm font-medium text-center text-blue-600 hover:text-blue-800"
            >
              Back to Program Overview
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-0 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default LessonSidebar;