import { Link } from 'react-router-dom';
import { DocumentPlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function EducatorDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-indigo-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
        <p className="text-gray-600">Manage your courses and track student progress</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Card */}
        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Upload New Content</h3>
              <p className="mt-2 text-sm text-gray-600">
                Share lessons, assignments, and resources with your students
              </p>
            </div>
            <Link
              to="/educator/content/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <DocumentPlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Upload
            </Link>
          </div>
        </div>

        {/* Stats Card */}
        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">View Analytics</h3>
              <p className="mt-2 text-sm text-gray-600">
                Track student engagement and performance
              </p>
            </div>
            <Link
              to="/educator/dashboard/stats"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View Stats
              <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        {/* Activity items would go here */}
      </div>
    </div>
  );
}