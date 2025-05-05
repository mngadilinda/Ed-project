import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const stripePromise = loadStripe('your_publishable_key');

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [cardComplete, setCardComplete] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Get plan from URL query
  const queryParams = new URLSearchParams(location.search);
  const plan = queryParams.get('plan') || 'monthly';

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create payment session with backend
      const response = await axios.post('/payments/create-session', {
        plan,
        email,
        userId: currentUser?.uid
      });

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.id
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-primary py-4 px-6">
          <h2 className="text-xl font-bold text-white">Complete your purchase</h2>
          <p className="text-primary-100 mt-1">
            {plan === 'monthly' && 'Monthly Subscription - R150/month'}
            {plan === 'yearly' && 'Yearly Subscription - R1500/year'}
            {plan === 'lifetime' && 'Lifetime Access - R4500'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment details
            </label>
            <div className="border border-gray-300 rounded-md p-3">
              {/* Stripe Elements will be injected here */}
              <div id="card-element" className="p-2"></div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !cardComplete}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
              loading || !cardComplete ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : `Pay ${plan === 'monthly' ? 'R150' : plan === 'yearly' ? 'R1500' : 'R4500'}`}
          </button>

          <div className="mt-4 text-center text-sm text-gray-500">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-primary hover:text-primary-dark">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:text-primary-dark">
              Privacy Policy
            </a>.
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;