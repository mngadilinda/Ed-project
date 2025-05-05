// src/components/Results/QuestionReview.jsx
const QuestionReview = ({ question, questionNumber, userAnswer, isCorrect }) => {
    return (
      <div className={`border-l-4 ${
        isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
      } p-4 rounded`}>
        <div className="flex justify-between">
          <h4 className="text-lg font-medium text-gray-900">
            Question {questionNumber}: {question.text}
          </h4>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isCorrect ? 'Correct' : 'Incorrect'}
          </span>
        </div>
  
        {question.image_url && (
          <div className="my-3">
            <img 
              src={question.image_url} 
              alt="Question illustration" 
              className="max-w-full h-auto rounded-md"
            />
          </div>
        )}
  
        <div className="mt-3 space-y-2">
          {question.options.map((option, index) => (
            <div 
              key={index}
              className={`p-2 border rounded-md ${
                index === question.correct_answer 
                  ? 'border-green-500 bg-green-100' 
                  : index === userAnswer && !isCorrect 
                    ? 'border-red-500 bg-red-100' 
                    : 'border-gray-200'
              }`}
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${
                  index === question.correct_answer 
                    ? 'border-green-500 bg-green-500 text-white' 
                    : index === userAnswer && !isCorrect 
                      ? 'border-red-500 bg-red-500 text-white' 
                      : 'border-gray-300'
                }`}>
                  {index === question.correct_answer && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {index === userAnswer && !isCorrect && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <p className="text-gray-700">{option}</p>
              </div>
            </div>
          ))}
        </div>
  
        {question.explanation && !isCorrect && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md">
            <h5 className="text-sm font-medium text-blue-800">Explanation</h5>
            <p className="text-sm text-blue-700 mt-1">{question.explanation}</p>
          </div>
        )}
      </div>
    );
  };
  
  export default QuestionReview;