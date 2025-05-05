// src/pages/ResultsView.jsx
import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchAssessmentResult } from '../api/assessments';
import Breadcrumb from '../components/Common/Breadcrumb';
import ResultSummary from '../components/Results/ResultSummary';
import QuestionReview from '../components/Results/QuestionReview';

const ResultsView = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // If result was passed in state, we don't need to fetch it
    if (location.state?.result) return;

    const loadResult = async () => {
      try {
        const data = await fetchAssessmentResult(user.token, id);
        setResult(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [user, navigate, id, location.state]);

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
              { name: result.assessment_title, href: `/assessments/${id}` },
              { name: 'Results' }
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Assessment Results</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Result Summary */}
        <div className="mb-8">
          <ResultSummary 
            score={result.score}
            totalQuestions={result.total_questions}
            correctAnswers={result.correct_answers}
            passingScore={result.passing_score}
            passed={result.passed}
            timeTaken={result.time_taken}
            completedAt={result.completed_at}
          />
        </div>

        {/* Question Review */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Question Review</h3>
            <p className="mt-1 text-sm text-gray-500">
              Review your answers and see the correct solutions
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-8">
              {result.questions.map((question, index) => (
                <QuestionReview
                  key={index}
                  question={question}
                  questionNumber={index + 1}
                  userAnswer={result.user_answers[index]}
                  isCorrect={result.correct_answers.includes(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate('/assessments')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Back to Assessments
          </button>
        </div>
      </main>
    </div>
  );
};

export default ResultsView;