// src/pages/PendingApproval.jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PendingApproval() {
  const { state } = useLocation();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Check if user got approved while on this page
  useEffect(() => {
    if (user?.isApprovedEducator) {
      navigate(state?.returnTo || '/educator-dashboard');
    }
  }, [user, navigate, state]);

  // Add automatic refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUser();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshUser]);

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">
        Account Pending Approval
      </h1>
      <p className="mb-6">
        {state?.message || "Your educator account is pending admin approval."}
        <br />
        You'll receive an email when your account is approved.
      </p>
      
      <button 
        onClick={refreshUser}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Check Approval Status
      </button>
    </div>
  );
}