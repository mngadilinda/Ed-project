// TopicUploadPage.jsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopicForm from '../../components/educator/TopicForm';
import useContentUpload from '../../hooks/useContentUpload';

export default function TopicUploadPage() {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const [topicData, setTopicData] = useState({
    title: '',
    order: 0,
    content: ''
  });
  const { uploadTopic, isLoading, error } = useContentUpload();

  const handleSubmit = async (formData) => {
    const response = await uploadTopic(formData);
    if (response) {
      navigate(`/educator/content/modules/${moduleId}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Topic</h1>
      <TopicForm
        data={topicData}
        onChange={setTopicData}
        onSubmit={handleSubmit}
        error={error}
        loading={isLoading}
      />
    </div>
  );
}