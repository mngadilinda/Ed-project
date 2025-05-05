// src/Admins/EducatorUpload.jsx
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ContentUploadForm from './ContentploadForm';

export default function EducatorUpload({ mode = 'create' }) {
  const { id } = useParams();
  
  // In edit mode, fetch the existing content data
  useEffect(() => {
    if (mode === 'edit' && id) {
      // Fetch content data for editing
      console.log(`Fetching content with ID: ${id} for editing`);
    }
  }, [mode, id]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {mode === 'create' ? 'Upload New Content' : 'Edit Content'}
      </h2>
      <ContentUploadForm mode={mode} contentId={mode === 'edit' ? id : null} />
    </div>
  );
}