// src/pages/Pricing.jsx
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Pricing = () => {
  const { currentUser } = useAuth();
  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '80',
      displayPrice: 'R80',
      period: 'per month',
      features: [
        'Access to all 8th-12th grade content',
        'Basic assessments',
        'Email support'
      ]
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '800',
      displayPrice: 'R800',
      period: 'per year (save 17%)',
      features: [
        'Everything in Monthly',
        'Advanced analytics',
        'Priority support',
        // 'Certificate of completion'
      ]
    },
    // {
    //   id: 'lifetime',
    //   name: 'Lifetime',
    //   price: '4500',
    //   displayPrice: 'R4500',
    //   period: 'one-time payment',
    //   features: [
    //     'Everything in Yearly',
    //     'Lifetime access to all content',
    //     'University-level courses included',
    //     'Premium support'
    //   ]
    // }
  ];

  const initiatePayment = async (planId) => {
    if (!currentUser) {
      toast.error('Please log in to proceed with payment');
      return;
    }

    try {
      const response = await fetch('/payments/create-payfast-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        },
        body: JSON.stringify({
          plan: planId,
          email: currentUser.email,
          amount: plans.find(p => p.id === planId).price
        })
      });

      const data = await response.json();
      window.location.href = data.payment_url;
    } catch (error) {
      toast.error('Failed to initiate payment');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose the perfect plan for your learning
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Start mastering mathematics today with our comprehensive courses
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-lg shadow-lg overflow-hidden ${
                index === 1 ? 'ring-2 ring-primary transform scale-105' : ''
              }`}
            >
              <div className={`px-6 py-8 ${
                index === 1 ? 'bg-primary text-white' : 'bg-white'
              }`}>
                <h2 className={`text-2xl font-bold ${
                  index === 1 ? 'text-white' : 'text-gray-900'
                }`}>{plan.name}</h2>
                <p className="mt-4">
                  <span className={`text-4xl font-extrabold ${
                    index === 1 ? 'text-white' : 'text-gray-900'
                  }`}>{plan.displayPrice}</span>
                  <span className={`text-base font-medium ${
                    index === 1 ? 'text-white' : 'text-gray-500'
                  }`}> {plan.period}</span>
                </p>
                <button
                  onClick={() => initiatePayment(plan.id)}
                  className={`mt-8 block w-full py-3 px-6 rounded-md text-center font-medium ${
                    index === 1 
                      ? 'bg-white text-primary hover:bg-gray-100' 
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  Choose {plan.name}
                </button>
              </div>
              <div className="px-6 pt-6 pb-8 bg-gray-50">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                  What's included
                </h3>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;