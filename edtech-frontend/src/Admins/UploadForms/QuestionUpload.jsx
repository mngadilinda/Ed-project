import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../services/api';
import QuestionForm from '../../components/educator/QuestionForm';
import useContentUpload from '../../hooks/useContentUpload';

export default function QuestionUploadPage() {
  const navigate = useNavigate();
  const { assessmentId } = useParams();
  const { uploadQuestion, isLoading, error } = useContentUpload();
  
  // Fetch assessment details for context
  const { data: assessment } = useQuery(
    ['assessment', assessmentId],
    () => api.get(`/assessments/${assessmentId}/`).then(res => res.data),
    { enabled: !!assessmentId }
  );

  const [questionData, setQuestionData] = useState({
    assessmentId: assessmentId,
    question_type: 'MCQ',
    text: '',
    options: ['', ''],
    correct_answer: '',
    difficulty: 1,
    concept_tags: ''
  });

  // Update form when assessment loads
  useEffect(() => {
    if (assessment) {
      setQuestionData(prev => ({
        ...prev,
        assessmentId: assessment.id
      }));
    }
  }, [assessment]);

  const handleSubmit = async (formData) => {
    const response = await uploadQuestion(formData);
    if (response) {
      navigate(`/educator/content/assessments/${assessmentId}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Question</h1>
        {assessment && (
          <p className="text-sm text-gray-500 mt-1">
            For assessment: <span className="font-medium">{assessment.title}</span>
          </p>
        )}
      </div>
      
      <QuestionForm
        data={questionData}
        onChange={setQuestionData}
        onSubmit={handleSubmit}
        error={error}
        loading={isLoading}
      />
    </div>
  );
}