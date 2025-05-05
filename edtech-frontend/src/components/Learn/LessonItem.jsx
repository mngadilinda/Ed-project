// src/components/Learn/LessonItem.jsx
const LessonItem = ({ lesson, onClick }) => {
    return (
      <div 
        onClick={onClick}
        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
            {lesson.lesson_type === 'video' ? (
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
            <p className="text-sm text-gray-500">
              {lesson.duration} min · {lesson.lesson_type}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            {lesson.is_completed ? (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Completed
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                Pending
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  export default LessonItem;