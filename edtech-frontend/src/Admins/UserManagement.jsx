import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  BanIcon,
  PencilIcon,
  SearchIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function UserManagement() {
  const { api } = useAuth(); // Get the axios instance from your AuthContext
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Using your existing api axios instance
        const response = await api.get('/admin/educators/', {
          params: {
            page: currentPage,
            search: searchTerm
          }
        });
        
        setUsers(response.data.results || response.data);
        setTotalPages(response.data.total_pages || 1);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
        console.error('User fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, searchTerm, api]);

  const handleApproveEducator = async (userId) => {
    try {
      const response = await api.patch(`/admin/educators/${userId}/approve/`);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_approved: response.data.is_approved } : u
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve educator');
      console.error('Approval error:', err);
    }
  };

  const handleToggleBan = async (userId, isBanned) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/`, {
        is_banned: !isBanned
      });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_banned: response.data.is_banned } : u
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
      console.error('Ban error:', err);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 mx-4 my-6">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="mt-2 inline-flex items-center rounded-md bg-red-100 px-2.5 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <UserIcon className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.role === 'EDUCATOR' ? (
                        <AcademicCapIcon className="h-5 w-5 text-indigo-500 mr-2" />
                      ) : user.role === 'ADMIN' ? (
                        <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-gray-500 mr-2" />
                      )}
                      <span className="capitalize">{user.role.toLowerCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_banned ? 'bg-red-100 text-red-800' :
                      user.is_active ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.is_banned ? 'Banned' : user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {user.role === 'EDUCATOR' && (
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {user.role === 'EDUCATOR' && !user.is_approved && (
                        <button
                          onClick={() => handleApproveEducator(user.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve Educator"
                        >
                          <AcademicCapIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleBan(user.id, user.is_banned)}
                        className={user.is_banned ? "text-green-600 hover:text-green-900" : "text-red-600 hover:text-red-900"}
                        title={user.is_banned ? "Unban User" : "Ban User"}
                      >
                        <BanIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}