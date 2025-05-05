import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';

export default function EducatorContent() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/educator/content');
        setContent(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleDelete = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    
    try {
      await api.delete(`/educator/content/${contentId}`);
      setContent(content.filter(item => item.id !== contentId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete content');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Educational Content</h2>
        <Link
          to="/educator/content/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create New Content
        </Link>
      </div>

      {content.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">You haven't created any content yet.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {content.map((item) => (
              <li key={item.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {item.type === 'video' ? (
                        <VideoCameraIcon className="h-10 w-10 text-indigo-500" />
                      ) : item.type === 'document' ? (
                        <DocumentTextIcon className="h-10 w-10 text-indigo-500" />
                      ) : (
                        <PhotoIcon className="h-10 w-10 text-indigo-500" />
                      )}
                      <div className="ml-4">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.subject} • Grade {item.gradeLevel}
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex space-x-2">
                      <Link
                        to={`/content/${item.id}`}
                        className="text-gray-400 hover:text-gray-500"
                        title="Preview"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link
                        to={`/educator/content/${item.id}/edit`}
                        className="text-gray-400 hover:text-gray-500"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-500"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {item.status === 'published' ? 'Published' : 'Draft'}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Created on{' '}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}