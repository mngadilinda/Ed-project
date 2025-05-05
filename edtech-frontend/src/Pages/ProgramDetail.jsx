// src/pages/ProgramDetail.jsx
import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchProgramDetail } from '../services/programms';
import LessonList from '../components/Programs/LessonList';
import EnrollButton from '../components/Programs/EnrollButton';

const ProgramDetail = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadProgram = async () => {
      try {
        const data = await fetchProgramDetail(user.token, id);
        setProgram(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
  }, [user, navigate, id]);

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
          <button 
            onClick={() => navigate('/programs')}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Programs
          </button>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{program.title}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {program.category}
                </span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {program.difficulty}
                </span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  {program.estimated_duration} hours
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <EnrollButton 
                programId={id} 
                isEnrolled={program.is_enrolled} 
                onEnroll={() => setProgram({...program, is_enrolled: true})}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About This Program</h2>
                <p className="text-gray-700 mb-6">{program.description}</p>
                
                <h2 className="text-xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {program.learning_outcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{outcome}</span>
                    </li>
                  ))}
                </ul>

                <h2 className="text-xl font-bold text-gray-900 mb-4">Prerequisites</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {program.prerequisites.length > 0 ? (
                    <ul className="list-disc pl-5 text-gray-700">
                      {program.prerequisites.map((prereq, index) => (
                        <li key={index}>{prereq}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No prerequisites required</p>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Program Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Instructor</h4>
                      <p className="mt-1 text-sm text-gray-900">{program.instructor}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                      <p className="mt-1 text-sm text-gray-900">{program.estimated_duration} hours</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                      <p className="mt-1 text-sm text-gray-900">{program.updated_at}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Enrollment</h4>
                      <p className="mt-1 text-sm text-gray-900">{program.enrollment_count} students</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Rating</h4>
                      <div className="mt-1 flex items-center">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`h-5 w-5 ${star <= program.average_rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {program.average_rating.toFixed(1)} ({program.review_count} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Curriculum */}
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Curriculum</h2>
              <LessonList 
                lessons={program.lessons} 
                isEnrolled={program.is_enrolled} 
                onSelectLesson={(lessonId) => navigate(`/learn/${id}/${lessonId}`)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProgramDetail;