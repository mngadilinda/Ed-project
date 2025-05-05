// src/components/Assessments/AssessmentCard.jsx
const AssessmentCard = ({ assessment, onStart, onViewResults }) => {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3 text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <h3 className="text-lg font-medium text-gray-900 truncate">{assessment.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{assessment.description}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {assessment.question_count} questions
            </span>
            {assessment.time_limit && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                {assessment.time_limit} min limit
              </span>
            )}
          </div>
          <div className="mt-4 flex justify-between items-center">
            {assessment.last_attempt ? (
              <div className="flex items-center">
                <span className="text-sm text-gray-600">
                  Last score: {assessment.last_attempt.score}%
                </span>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Not attempted yet</div>
            )}
            <div className="flex space-x-2">
              {assessment.last_attempt ? (
                <button
                  onClick={onViewResults}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                >
                  View Results
                </button>
              ) : (
                <button
                  onClick={onStart}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Start Assessment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default AssessmentCard;