import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import Button from './components/common/Button';

// Import pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TemplatesPage from './pages/TemplatesPage';
import TemplateDetailPage from './pages/TemplateDetailPage';
import CreateTemplatePage from './pages/CreateTemplatePage';
import ContractsPage from './pages/ContractsPage';
import ContractDetailPage from './pages/ContractDetailPage';
import CreateContractPage from './pages/CreateContractPage';

// Layout component with navigation
function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-primary-600">
                CLM Platform
              </Link>
              <div className="ml-10 flex space-x-4">
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Dashboard
                </Link>
                <Link
                  to="/templates"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Templates
                </Link>
                <Link
                  to="/contracts"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Contracts
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-gray-700">
                  {user.firstName} {user.lastName}
                </span>
              )}
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <TemplatesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/templates/create"
          element={
            <ProtectedRoute>
              <CreateTemplatePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/templates/:id"
          element={
            <ProtectedRoute>
              <TemplateDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contracts"
          element={
            <ProtectedRoute>
              <ContractsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contracts/create"
          element={
            <ProtectedRoute>
              <CreateContractPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contracts/:id"
          element={
            <ProtectedRoute>
              <ContractDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
