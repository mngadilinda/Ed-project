// UploadHistory.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const UploadHistory = () => {
  const { accessToken } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const response = await axios.get('/api/educator/admin/content-uploads/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        setUploads(response.data);
      } catch (error) {
        console.error('Failed to fetch uploads:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUploads();
  }, [accessToken]);

  if (loading) return <div>Loading upload history...</div>;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Upload History</h3>
      <div className="space-y-4">
        {uploads.map(upload => (
          <div key={upload.id} className="p-4 border rounded-lg">
            <div className="flex justify-between">
              <span className="font-medium">{upload.upload_type}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                upload.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                upload.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {upload.status}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {new Date(upload.created_at).toLocaleString()}
            </div>
            {upload.log && (
              <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                {upload.log}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadHistory;