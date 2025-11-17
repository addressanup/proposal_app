import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import Button from './components/common/Button';
import Toast from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotificationsDropdown from './components/common/NotificationsDropdown';

// Import pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TemplatesPage from './pages/TemplatesPage';
import TemplateDetailPage from './pages/TemplateDetailPage';
import CreateTemplatePage from './pages/CreateTemplatePage';
import EditTemplatePage from './pages/EditTemplatePage';
import ContractsPage from './pages/ContractsPage';
import ContractDetailPage from './pages/ContractDetailPage';
import CreateContractPage from './pages/CreateContractPage';
import EditContractPage from './pages/EditContractPage';
import ProposalsPage from './pages/ProposalsPage';
import ProposalDetailPage from './pages/ProposalDetailPage';
import CreateProposalPage from './pages/CreateProposalPage';
import EditProposalPage from './pages/EditProposalPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import OrganizationsPage from './pages/OrganizationsPage';
import OrganizationDetailPage from './pages/OrganizationDetailPage';
import AuditLogsPage from './pages/AuditLogsPage';
import RemindersPage from './pages/RemindersPage';

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
                  to="/proposals"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Proposals
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
                <Link
                  to="/organizations"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Organizations
                </Link>
                <Link
                  to="/audit-logs"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Audit Logs
                </Link>
                <Link
                  to="/reminders"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Reminders
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <NotificationsDropdown />
                  <Link
                    to="/settings"
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    {user.firstName} {user.lastName}
                  </Link>
                  <Button variant="secondary" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              )}
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
    <ErrorBoundary>
      <BrowserRouter>
        <Toast />
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
            path="/templates/:id/edit"
            element={
              <ProtectedRoute>
                <EditTemplatePage />
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

          <Route
            path="/contracts/:id/edit"
            element={
              <ProtectedRoute>
                <EditContractPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/proposals"
            element={
              <ProtectedRoute>
                <ProposalsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/proposals/create"
            element={
              <ProtectedRoute>
                <CreateProposalPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/proposals/:id"
            element={
              <ProtectedRoute>
                <ProposalDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/proposals/:id/edit"
            element={
              <ProtectedRoute>
                <EditProposalPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ProfileSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizations"
            element={
              <ProtectedRoute>
                <OrganizationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizations/:id"
            element={
              <ProtectedRoute>
                <OrganizationDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reminders"
            element={
              <ProtectedRoute>
                <RemindersPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
