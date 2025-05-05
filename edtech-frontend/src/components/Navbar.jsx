import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, MenuButton, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { Fragment, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, isLoading, authChecked, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Debugging effect
  useEffect(() => {
    console.log('Navbar auth state:', {
      user,
      isAuthenticated,
      isLoading,
      authChecked
    });
  }, [user, isAuthenticated, isLoading, authChecked]);

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Successfully signed out');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Error signing out');
    }
  };

  const navLinks = [
    { name: 'Learn', path: '/learn', protected: true },
    { name: 'Pricing', path: '/pricing', protected: false },
    { name: 'Dashboard', path: '/dashboard', protected: true },
  ];

  // Don't show anything until initial auth check is complete
  if (!authChecked || isLoading) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">
                EM
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                Ed-Master
              </span>
            </Link>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => {
                if (link.protected && !isAuthenticated) return null;
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) => 
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive 
                          ? 'border-primary text-gray-900' 
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                );
              })}
              {/* Educator Dashboard Link - Desktop */}
              {isAuthenticated && user?.role === 'EDUCATOR' && user?.is_approved && (
                <NavLink
                  to="/educator/dashboard"
                  className={({ isActive }) => 
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive 
                        ? 'border-primary text-gray-900' 
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  <AcademicCapIcon className="h-5 w-5 mr-1" />
                  Educator
                </NavLink>
              )}
            </div>
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <Menu as="div" className="ml-3 relative">
                <div>
                  <MenuButton className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                      {user?.initials || '?'}
                    </div>
                  </MenuButton>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`block px-4 py-2 text-sm text-gray-700 ${
                            active ? 'bg-gray-100' : ''
                          }`}
                        >
                          Your Profile
                        </Link>
                      )}
                    </Menu.Item>
                    {/* Educator Dashboard Link - Dropdown */}
                    {user?.role === 'EDUCATOR' && user?.is_approved && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/educator/dashboard"
                            className={`block px-4 py-2 text-sm text-gray-700 ${
                              active ? 'bg-gray-100' : ''
                            }`}
                          >
                            Educator Dashboard
                          </Link>
                        )}
                      </Menu.Item>
                    )}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleSignOut}
                          className={`w-full text-left px-4 py-2 text-sm text-gray-700 ${
                            active ? 'bg-gray-100' : ''
                          }`}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              if (link.protected && !isAuthenticated) return null;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) => 
                    `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive 
                        ? 'bg-primary-50 border-primary text-primary' 
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </NavLink>
              );
            })}
            {/* Educator Dashboard Link - Mobile */}
            {isAuthenticated && user?.role === 'EDUCATOR' && user?.is_approved && (
              <NavLink
                to="/educator/dashboard"
                className={({ isActive }) => 
                  `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive 
                      ? 'bg-primary-50 border-primary text-primary' 
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  Educator Dashboard
                </div>
              </NavLink>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                      {user?.initials || '?'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user?.email || 'User'}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/login"
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;