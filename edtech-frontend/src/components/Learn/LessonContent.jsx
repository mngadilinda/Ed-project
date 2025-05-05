// src/components/Learn/LessonContent.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { completeLesson } from '../../services/learn';
import VideoPlayer from './VideoPlayer';
import MarkdownContent from './MarkdownContent';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';

const LessonContent = ({ lesson }) => {
  const { currentUser } = useAuth();
  const { programId } = useParams();
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(lesson.is_completed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCompleteLesson = async () => {
    setLoading(true);
    try {
      await completeLesson(currentUser.token, programId, lesson.id);
      setIsCompleted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLesson = (lessonId) => {
    navigate(`/learn/${programId}/${lessonId}`);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Lesson header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
          <div className="flex items-center text-sm text-gray-500">
            <span>Module {lesson.module_order}: {lesson.module_title}</span>
            <span className="mx-2">•</span>
            <span>{lesson.duration} min</span>
            {isCompleted && (
              <>
                <span className="mx-2">•</span>
                <span className="flex items-center text-green-600">
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Completed
                </span>
              </>
            )}
          </div>
        </div>

        {/* Media content */}
        {lesson.media_url && (
          <div className="mb-8 rounded-lg overflow-hidden bg-black">
            <VideoPlayer url={lesson.media_url} />
          </div>
        )}

        {/* Lesson content */}
        <div className="prose max-w-none mb-8">
          <MarkdownContent content={lesson.content} />
        </div>

        {/* Attachments */}
        {lesson.attachments?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Resources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lesson.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-shrink-0 bg-gray-100 p-2 rounded-md">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4 overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                    <p className="text-xs text-gray-500">{attachment.type} • {attachment.size}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Navigation and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-8 border-t border-gray-200">
          <div className="flex-1 w-full">
            {lesson.previous_lesson && (
              <button
                onClick={() => navigateToLesson(lesson.previous_lesson)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Previous Lesson
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isCompleted && (
              <button
                onClick={handleCompleteLesson}
                disabled={loading}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Marking...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Mark as Complete
                  </>
                )}
              </button>
            )}

            {lesson.next_lesson ? (
              <button
                onClick={() => navigateToLesson(lesson.next_lesson)}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Next Lesson
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={() => navigate(`/programs/${programId}`)}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Finish Module
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonContent;