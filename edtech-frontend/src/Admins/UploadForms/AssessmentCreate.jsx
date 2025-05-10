import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssessmentForm from '../../components/educator/AssessmentForm';
import useContentUpload from '../../hooks/useContentUpload';

export default function AssessmentUploadPage() {
  const navigate = useNavigate();
  const { moduleId, topicId } = useParams();
  const [assessmentData, setAssessmentData] = useState({
    title: '',
    description: '',
    passing_score: 70,
    is_proctored: false
  });
  const { uploadAssessment, isLoading, error } = useContentUpload();

  const handleSubmit = async (formData) => {
    const response = await uploadAssessment({
      ...formData,
      moduleId: moduleId || formData.moduleId,
      topicId: topicId || formData.topicId
    });
    
    if (response) {
      const redirectPath = topicId 
        ? `/educator/content/topics/${topicId}`
        : `/educator/content/modules/${moduleId}`;
      navigate(redirectPath);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Assessment</h1>
        <p className="text-sm text-gray-500 mt-1">
          {topicId ? 'Topic Assessment' : 'Module Assessment'}
        </p>
      </div>
      
      <AssessmentForm
        data={assessmentData}
        onChange={setAssessmentData}
        onSubmit={handleSubmit}
        error={error}
        loading={isLoading}
      />
    </div>
  );
}