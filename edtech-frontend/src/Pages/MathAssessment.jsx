// src/pages/MathAssessment.jsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { checkMathAnswer } from '../services/mathAssessment';
import MathInput from '../components/MathInput';

const MathAssessment = () => {
  const { id } = useParams();
  const [currentProblem, setCurrentProblem] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  // Sample problems - in a real app, these would come from your backend
  const problems = [
    {
      id: 1,
      question: 'Simplify the expression: $x^2 + 2x + x^2 - 3x$',
      answer: '2*x**2 - x',
      type: 'expression'
    },
    {
      id: 2,
      question: 'Solve for x: $2x + 5 = 15$',
      answer: 'x = 5',
      type: 'equation'
    },
    {
      id: 3,
      question: 'Calculate the value of $\\sqrt{16} + \\frac{10}{2}$',
      answer: '9',
      type: 'numeric',
      tolerance: 0.1
    }
  ];

  const handleSubmitAnswer = async (answer) => {
    setLoading(true);
    const problem = problems[currentProblem];
    
    const result = await checkMathAnswer(
      problem.id,
      answer,
      problem.type,
      problem.answer,
      problem.tolerance
    );
    
    setResults(prev => ({ ...prev, [problem.id]: result }));
    setUserAnswers(prev => ({ ...prev, [problem.id]: answer }));
    setLoading(false);
  };

  const handleNext = () => {
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(currentProblem + 1);
    }
  };

  const handlePrev = () => {
    if (currentProblem > 0) {
      setCurrentProblem(currentProblem - 1);
    }
  };

  const currentProblemData = problems[currentProblem];
  const currentResult = results[currentProblemData.id];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Math Assessment</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Problem {currentProblem + 1}</h2>
        <div className="prose mb-6">
          <p dangerouslySetInnerHTML={{ __html: currentProblemData.question }} />
        </div>
        
        <div className="mb-6">
          <MathInput
            initialValue={userAnswers[currentProblemData.id] || ''}
            onSave={handleSubmitAnswer}
            problemType={currentProblemData.type}
          />
        </div>
        
        {loading && <div className="text-gray-500">Checking your answer...</div>}
        
        {currentResult && (
          <div className={`p-4 rounded-md ${
            currentResult.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {currentResult.correct ? (
              <div>
                <p className="font-bold">Correct!</p>
                <p>Your answer: {userAnswers[currentProblemData.id]}</p>
              </div>
            ) : (
              <div>
                <p className="font-bold">Not quite right.</p>
                <p>Your answer: {userAnswers[currentProblemData.id]}</p>
                <p>Expected answer: {currentResult.expected_answer}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={handlePrev}
          disabled={currentProblem === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        
        {currentProblem < problems.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next Problem
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Finish Assessment
          </button>
        )}
      </div>
    </div>
  );
};

export default MathAssessment;