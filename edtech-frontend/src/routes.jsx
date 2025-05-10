import { Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import EducatorAdmin from './Admins/EducatorAdmin';
import EducatorDashboard from './Admins/EducatorDashboard';
import EducatorUpload from './Admins/EducatorUpload';
import EducatorPendingApproval from './Admins/PendingApproval';
import AdminEducatorApproval from './pages/AdminEdApproval';
import ContentList from '.Admins/ContentList';
import ContentStats from './Admins/ContentStats';
import EducatorContent from './Admins/EducatorContent';
import EducatorAnalytics from './Admins/EducatorAnalytics';
import EducatorSettings from './Admins/EducatorSettings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Main Dashboard */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/educators" element={
        <PrivateRoute roles={['ADMIN']}>
          <AdminEducatorApproval />
        </PrivateRoute>
      } />

      {/* Educator Routes */}
      <Route path="/educator" element={
        <PrivateRoute roles={['EDUCATOR']}>
          <EducatorAdmin />
        </PrivateRoute>
      }>

        <Route path="content" element={<ContentList />} />
        <Route path="content/upload" element={<ModuleUploadPage />} />
        <Route path="content/upload/topics" element={<TopicManagementPage />} />
        <Route path="content/upload/assessments" element={<AssessmentCreationPage />} />
        {/* Dashboard and Core Functionality */}
        <Route index element={<EducatorDashboard />} />
        <Route path="dashboard" element={<EducatorDashboard />} />
        
        {/* Content Management */}
        <Route path="content/list" element={<ContentList />} />
        <Route path="content/edit/:id" element={<EducatorUpload mode="edit" />} />
        
        {/* Analytics */}
        <Route path="analytics" element={<EducatorAnalytics />} />
        <Route path="stats" element={<ContentStats />} />
        
        {/* Settings */}
        <Route path="settings" element={<EducatorSettings />} />
        
        {/* Approval Status */}
        <Route path="pending" element={<EducatorPendingApproval />} />
      </Route>
    </Routes>
  );
}
