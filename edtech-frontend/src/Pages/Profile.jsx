import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/services';
import ProgressChart from '../components/ProgressChart';
import BadgesList from '../components/Profile/BadgesList';

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: ''
  });

  // Load profile data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        const { data } = await profileService.fetch();
        setProfile(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          bio: data.bio || ''
        });
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load profile');
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, navigate, logout]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data } = await profileService.update(formData);
      setProfile(data);
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setUpdating(false);
    }
  };

  // Loading state
  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => {
              setError(null);
              if (error.includes('Authentication')) {
                navigate('/login');
              }
            }}
            className="absolute top-0 right-0 px-3 py-1"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="h-32 w-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold">
                    {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                  </div>
                </div>
                
                {editMode ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        First Name
                      </label>
                      <input
                        name="first_name"
                        type="text"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Last Name
                      </label>
                      <input
                        name="last_name"
                        type="text"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="3"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={updating}
                        className={`px-4 py-2 text-white rounded-md transition ${
                          updating ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {updating ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        disabled={updating}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900 text-center">
                      {profile.first_name} {profile.last_name}
                    </h2>
                    <p className="text-gray-600 text-center mt-1">@{profile.username}</p>
                    <p className="text-gray-700 mt-4">{profile.bio || 'No bio yet.'}</p>
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Badges Section */}
            <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Achievements</h3>
              </div>
              <div className="p-6">
                {profile.badges?.length > 0 ? (
                  <BadgesList badges={profile.badges} />
                ) : (
                  <p className="text-gray-500 text-center">No achievements yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats and Activity */}
          <div className="lg:col-span-2">
            {/* Stats Section */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Your Stats</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{profile.stats?.completed_programs || 0}</p>
                    <p className="text-gray-600">Programs Completed</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{profile.stats?.completed_lessons || 0}</p>
                    <p className="text-gray-600">Lessons Completed</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">{profile.stats?.learning_hours || 0}</p>
                    <p className="text-gray-600">Learning Hours</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-yellow-600">{profile.stats?.assessment_score || 0}%</p>
                    <p className="text-gray-600">Avg. Assessment Score</p>
                  </div>
                </div>

                <h4 className="text-lg font-medium text-gray-900 mb-2">Learning Progress</h4>
                <ProgressChart data={profile.progress_data || []} />
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                {profile.recent_activity?.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {profile.recent_activity.map((activity, index) => (
                      <li key={index} className="py-4">
                        <div className="flex space-x-3">
                          <div className={`flex-shrink-0 rounded-full p-2 ${
                            activity.type === 'completed' ? 'bg-green-100' : 
                            activity.type === 'started' ? 'bg-blue-100' : 'bg-yellow-100'
                          }`}>
                            {/* Activity icons remain the same */}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                            <p className="text-sm text-gray-500">
                              <time dateTime={activity.time}>{new Date(activity.time).toLocaleString()}</time>
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center">No recent activity.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;