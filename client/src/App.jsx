import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import FacultyDashboard from './pages/dashboard/FacultyDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import StudentProfile from './pages/dashboard/StudentProfile';
import StudentsDetailPage from './pages/dashboard/StudentsDetailPage';
import FacultyDetailPage from './pages/dashboard/FacultyDetailPage';
import RegistrationsDetailPage from './pages/dashboard/RegistrationsDetailPage';
import DataViewer from './components/DataViewer';

// Protected Route Component
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/students"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <StudentsDetailPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/faculty"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <FacultyDetailPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/registrations"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <RegistrationsDetailPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/faculty/*"
          element={
            <PrivateRoute allowedRoles={['admin', 'faculty']}>
              <FacultyDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/student"
          element={
            <PrivateRoute allowedRoles={['admin', 'faculty', 'student']}>
              <StudentDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <StudentProfile />
            </PrivateRoute>
          }
        />

        {/* Debug Data Viewer - Admin Only */}
        <Route
          path="/debug/data"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <DataViewer />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
