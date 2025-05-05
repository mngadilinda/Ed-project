// src/pages/AdminEducatorApproval.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services';

const AdminEducatorApproval = () => {
  const { user } = useAuth();
  const [pendingEducators, setPendingEducators] = useState([]);

  useEffect(() => {
    const fetchPendingEducators = async () => {
      try {
        const response = await api.get('/educators/');
        setPendingEducators(response.data.filter(e => !e.is_approved));
      } catch (error) {
        console.error('Failed to fetch educators:', error);
      }
    };
    fetchPendingEducators();
  }, []);

  const handleApprove = async (educatorId) => {
    try {
      await api.post(`/educators/${educatorId}/approve/`);
      setPendingEducators(pendingEducators.filter(e => e.id !== educatorId));
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  if (user?.role !== 'ADMIN') return <div>Access Denied</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pending Educator Approvals</h2>
      {pendingEducators.length === 0 ? (
        <p>No pending approvals</p>
      ) : (
        <ul className="space-y-4">
          {pendingEducators.map(educator => (
            <li key={educator.id} className="p-4 border rounded-lg flex justify-between">
              <div>
                <p>{educator.email}</p>
                <p className="text-sm text-gray-600">
                  Registered: {new Date(educator.date_joined).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleApprove(educator.id)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Approve
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};