// src/pages/PaymentSuccess.jsx
import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const PaymentSuccess = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    toast.success('Payment successful! Your account has been upgraded.');
    
    // You might want to verify the payment with your backend here
    const verifyPayment = async () => {
      try {
        const response = await fetch('/payments/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await currentUser.getIdToken()}`
          }
        });
        const data = await response.json();
        if (!data.verified) {
          toast.error('Payment verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
      }
    };
    
    if (currentUser) {
      verifyPayment();
    }
  }, [currentUser]);

  // Get plan from URL query
  const queryParams = new URLSearchParams(location.search);
  const plan = queryParams.get('plan') || 'premium';

  const getPlanDetails = () => {
    switch (plan) {
      case 'monthly':
        return { name: 'Monthly Plan', expiry: '30 days' };
      case 'yearly':
        return { name: 'Yearly Plan', expiry: '1 year' };
      case 'lifetime':
        return { name: 'Lifetime Access', expiry: 'Never' };
      default:
        return { name: 'Premium Plan', expiry: '' };
    }
  };

  const { name, expiry } = getPlanDetails();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden text-center">
        <div className="bg-green-50 py-8 px-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-3 text-xl font-bold text-gray-900">Payment Successful!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for your purchase, {currentUser?.displayName || currentUser?.email || ''}
          </p>
        </div>

        <div className="px-6 py-8">
          <h3 className="text-lg font-medium text-gray-900">{name}</h3>
          {expiry && (
            <p className="mt-1 text-sm text-gray-500">
              Your subscription will expire in {expiry}
            </p>
          )}

          <div className="mt-8">
            <Link
              to="/learn"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Start Learning Now
            </Link>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Need help?{' '}
              <a href="mailto:support@edumaster.com" className="text-primary hover:text-primary-dark">
                Contact our support team
              </a>
            </p>
            <p className="mt-2">
              <Link to="/profile" className="text-primary hover:text-primary-dark">
                View your account
              </Link>{' '}
              to manage your subscription
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;