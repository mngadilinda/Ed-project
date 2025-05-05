// src/pages/AssessmentView.jsx
import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchAssessment, submitAssessment } from '../api/assessments';
import Breadcrumb from '../components/Common/Breadcrumb';
import QuestionCard from '../components/Assessments/QuestionCard';
import Timer from '../components/Assessments/Timer';

const AssessmentView = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadAssessment = async () => {
      try {
        const data = await fetchAssessment(user.token, id);
        setAssessment(data);
        // Initialize answers object
        const initialAnswers = {};
        data.questions.forEach((q, index) => {
          initialAnswers[index] = null;
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [user, navigate, id]);

  const handleAnswerSelect = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await submitAssessment(user.token, id, {
        answers: Object.values(answers)
      });
      navigate(`/results/${id}`, { state: { result } });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumb 
            items={[
              { name: 'Assessments', href: '/assessments' },
              { name: assessment.title }
            ]}
          />
          <div className="mt-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
            {assessment.time_limit && (
              <Timer 
                timeLimit={assessment.time_limit * 60} 
                onTimeUp={handleSubmit}
              />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Question {currentQuestion + 1} of {assessment.questions.length}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  {Math.round(((currentQuestion + 1) / assessment.questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${((currentQuestion + 1) / assessment.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Current Question */}
            {assessment.questions.length > 0 && (
              <QuestionCard
                question={assessment.questions[currentQuestion]}
                questionNumber={currentQuestion + 1}
                selectedAnswer={answers[currentQuestion]}
                onAnswerSelect={(answer) => handleAnswerSelect(currentQuestion, answer)}
              />
            )}

            {/* Navigation */}
            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between">
              <button
                onClick={handlePrev}
                disabled={currentQuestion === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Previous
              </button>
              
              {currentQuestion < assessment.questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Assessment'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssessmentView;