// src/components/Assessments/QuestionCard.jsx
const QuestionCard = ({ question, questionNumber, selectedAnswer, onAnswerSelect }) => {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Question {questionNumber}: {question.text}
        </h3>
        
        {question.image_url && (
          <div className="mb-4">
            <img 
              src={question.image_url} 
              alt="Question illustration" 
              className="max-w-full h-auto rounded-md"
            />
          </div>
        )}
  
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <div 
              key={index}
              onClick={() => onAnswerSelect(index)}
              className={`p-3 border rounded-md cursor-pointer transition ${
                selectedAnswer === index 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${
                  selectedAnswer === index 
                    ? 'border-blue-500 bg-blue-500 text-white' 
                    : 'border-gray-300'
                }`}>
                  {selectedAnswer === index && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <p className="text-gray-700">{option}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default QuestionCard;