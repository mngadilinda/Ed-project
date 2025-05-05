import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpenIcon, 
  DocumentPlusIcon, 
  ChartBarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function EducatorAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Redirect unapproved educators
  if (user?.role === 'EDUCATOR' && !user?.is_approved) {
    navigate('/educator/pending');
    return null;
  }

  // Get active tab from URL
  const activeTab = location.pathname.split('/').pop() || 'dashboard';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
            Educator Portal
          </h1>
        </header>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => navigate('/educator/dashboard')}
              className={`${activeTab === 'dashboard' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <BookOpenIcon className="h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => navigate('/educator/content/list')}
              className={`${activeTab === 'content' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <DocumentPlusIcon className="h-5 w-5" />
              My Content
            </button>
            <button
              onClick={() => navigate('/educator/analytics')}
              className={`${activeTab === 'analytics' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <ChartBarIcon className="h-5 w-5" />
              Analytics
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}