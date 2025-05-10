import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { Button } from './components/ui/Button';
import { 
  PrivateRoute, 
  EducatorRoute, 
  StudentRoute, 
  VerifiedEmailRoute,
  AdminRoute 
} from './components/PrivateRoute';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Layout Components
const Navbar = lazy(() => import('./components/Navbar'));
const Footer = lazy(() => import('./components/Footer'));

// Lazy-loaded pages
const Home = lazy(() => import('./Pages/Home'));
const Login = lazy(() => import('./Authentication/Login'));
const Register = lazy(() => import('./Authentication/Register'));
const ForgotPassword = lazy(() => import('./Authentication/ForgotPassword'));
const Pricing = lazy(() => import('./payments/Pricing'));
const Checkout = lazy(() => import('./payments/Checkout'));
const PaymentSuccess = lazy(() => import('./payments/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./payments/PaymentFailed'));
const Programs = lazy(() => import('./pages/Programs'));
const ProgramDetail = lazy(() => import('./pages/ProgramDetail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Learn = lazy(() => import('./pages/Learn'));

// Educator Components
const EducatorAdmin = lazy(() => import('./Admins/EducatorAdmin'));
const EducatorDashboard = lazy(() => import('./Admins/EducatorDashboard'));
const EducatorPendingApproval = lazy(() => import('./pages/PendingApproval'));
const EducatorAnalytics = lazy(() => import('./Admins/EducatorAnalytics'));
const EducatorSettings = lazy(() => import('./Admins/EducatorSettings'));
const ContentList = lazy(() => import('./Admins/ContentList'));
const ContentStats = lazy(() => import('./Admins/ContentStats'));

// New Content Upload Flow
const ModuleUploadPage = lazy(() => import('./Admins/ModuleUpload'));
const TopicManagementPage = lazy(() => import('./Admins/TopicManagement'));
const AssessmentCreationPage = lazy(() => import('./Admins/AssessmentCreate'));

// Admin Components
const AdminEducatorApproval = lazy(() => import('./pages/AdminEdApproval'));

function AppContent() {
  const { authChecked } = useAuth();

  if (!authChecked) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner fullPage />}>
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/pricing" element={<Pricing />} />
            
            {/* Course Routes */}
            <Route path="/programs" element={<Programs />} />
            <Route path="/programs/:id" element={<ProgramDetail />} />
            
            {/* Payment Routes */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/learn" element={<Learn />} />
            </Route>

            {/* Educator Routes */}
            <Route element={<EducatorRoute />}>
              <Route path="/educator" element={<EducatorAdmin />}>
                {/* Dashboard */}
                <Route index element={<EducatorDashboard />} />
                <Route path="dashboard" element={<EducatorDashboard />} />
                
                {/* New Content Upload Flow */}
                <Route path="content/upload" element={<ModuleUploadPage />} />
                <Route path="content/upload/topics" element={<TopicManagementPage />} />
                <Route path="content/upload/assessments" element={<AssessmentCreationPage />} />
                
                {/* Content Management */}
                <Route path="content/list" element={<ContentList />} />
                
                {/* Analytics */}
                <Route path="analytics" element={<EducatorAnalytics />} />
                <Route path="stats" element={<ContentStats />} />
                
                {/* Settings */}
                <Route path="settings" element={<EducatorSettings />} />
                
                {/* Approval Status */}
                <Route path="pending" element={<EducatorPendingApproval />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/educators" element={<AdminEducatorApproval />} />
            </Route>

            {/* 404 Page */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-4xl font-bold mb-4">404 | Page Not Found</h1>
                <Button asChild>
                  <Link to="/">Return Home</Link>
                </Button>
              </div>
            } />
          </Routes>
        </main>
        
        <Footer />
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#f87171',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;