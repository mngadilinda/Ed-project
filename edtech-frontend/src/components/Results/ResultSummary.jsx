// src/components/Results/ResultSummary.jsx
const ResultSummary = ({ score, totalQuestions, correctAnswers, passingScore, passed, timeTaken, completedAt }) => {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Assessment Summary</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col items-center mb-6">
            <div className={`h-32 w-32 rounded-full flex items-center justify-center text-4xl font-bold ${
              passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {score}%
            </div>
            <h4 className="mt-4 text-lg font-medium text-gray-900">
              {passed ? 'Congratulations! You passed!' : 'Assessment not passed'}
            </h4>
            <p className="text-gray-500">
              Passing score: {passingScore}%
            </p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Questions</p>
              <p className="text-xl font-semibold text-gray-900">{totalQuestions}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Correct Answers</p>
              <p className="text-xl font-semibold text-gray-900">{correctAnswers}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Time Taken</p>
              <p className="text-xl font-semibold text-gray-900">{timeTaken}</p>
            </div>
          </div>
  
          <div className="mt-6 text-sm text-gray-500">
            Completed on: {completedAt}
          </div>
        </div>
      </div>
    );
  };
  
  export default ResultSummary;