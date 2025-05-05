// src/pages/PaymentFailed.jsx
import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const PaymentFailed = () => {
  const location = useLocation();

  useEffect(() => {
    toast.error('Payment processing failed');
  }, []);

  // Get error message from URL query
  const queryParams = new URLSearchParams(location.search);
  const error = queryParams.get('error') || 'Payment could not be processed';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden text-center">
        <div className="bg-red-50 py-8 px-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-3 text-xl font-bold text-gray-900">Payment Failed</h2>
          <p className="mt-2 text-sm text-gray-600">
            {error}
          </p>
        </div>

        <div className="px-6 py-8">
          <div className="space-y-4">
            <Link
              to="/pricing"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Try Again
            </Link>

            <Link
              to="/pricing"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Choose Different Plan
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
              Having payment issues? Try these alternative methods:
            </p>
            <div className="mt-2 flex justify-center space-x-4">
              <a href="https://www.snapscan.co.za" className="text-primary hover:text-primary-dark">
                SnapScan
              </a>
              <a href="https://www.ozow.com" className="text-primary hover:text-primary-dark">
                Ozow
              </a>
              <a href="https://www.instanteft.co.za" className="text-primary hover:text-primary-dark">
                Instant EFT
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;