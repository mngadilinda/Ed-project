// src/components/Programs/ProgramCard.jsx
const ProgramCard = ({ program, onSelect }) => {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3 text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <h3 className="text-lg font-medium text-gray-900 truncate">{program.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{program.short_description}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              program.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
              program.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {program.difficulty}
            </span>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {program.category}
            </span>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 text-sm text-gray-600">
                {program.average_rating.toFixed(1)} ({program.enrollment_count})
              </span>
            </div>
            <button
              onClick={onSelect}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ProgramCard;