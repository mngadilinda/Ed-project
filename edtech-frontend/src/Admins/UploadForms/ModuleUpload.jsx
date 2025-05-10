import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleForm from '../../components/educator/ModuleForm';
import useContentUpload from '../../hooks/useContentUpload';

export default function ModuleUploadPage() {
  const navigate = useNavigate();
  const [moduleData, setModuleData] = useState({
    title: '',
    subject: 'math',
    gradeLevel: '10',
    description: ''
  });
  const { uploadModule, isLoading, error } = useContentUpload();

  const handleSubmit = async (formData) => {
    const success = await uploadModule(formData);
    if (success) {
      navigate(`/educator/content/topics?module=${formData.title}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Module</h1>
      <ModuleForm
        data={moduleData}
        onChange={setModuleData}
        onSubmit={handleSubmit}
        error={error}
        loading={isLoading}
      />
    </div>
  );
}