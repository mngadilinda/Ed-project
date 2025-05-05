// src/components/RecentActivity.jsx
const RecentActivity = ({ activities }) => {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="bg-white overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-full p-2 ${activity.type === 'completed' ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {activity.type === 'completed' ? (
                        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-sm text-gray-500">
                        <time dateTime={activity.time}>{activity.time}</time>
                      </p>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 sm:px-6">
                <p className="text-sm text-gray-500">No recent activity</p>
              </li>
            )}
          </ul>
        </div>
      </div>
    );
  };
  
  export default RecentActivity;