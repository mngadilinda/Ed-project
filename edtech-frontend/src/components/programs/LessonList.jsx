// src/components/Programs/LessonList.jsx
const LessonList = ({ lessons, isEnrolled, onSelectLesson }) => {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {lessons.map((module, moduleIndex) => (
          <div key={moduleIndex} className="border-b border-gray-200 last:border-b-0">
            <div className="bg-gray-50 px-4 py-3">
              <h3 className="text-lg font-medium text-gray-900">
                Module {moduleIndex + 1}: {module.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{module.description}</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {module.lessons.map((lesson, lessonIndex) => (
                <li key={lesson.id} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                      <span className="text-gray-500">{lessonIndex + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {lesson.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {lesson.duration} min · {lesson.lesson_type}
                      </p>
                    </div>
                    <div>
                      {isEnrolled ? (
                        <button
                          onClick={() => onSelectLesson(lesson.id)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                          Start
                        </button>
                      ) : (
                        <span className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };
  
  export default LessonList;