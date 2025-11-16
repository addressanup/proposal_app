import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Placeholder components - to be implemented
function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">CLM Platform</h1>
        <h2 className="text-xl text-center mb-6 text-gray-600">Login</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="input"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              className="input"
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Sign In
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          Frontend configured and ready. Connect to backend at localhost:5000
        </p>
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Contracts</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Active Contracts</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Expiring Soon</h3>
          <p className="text-3xl font-bold text-yellow-600">0</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Approval</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <div className="card">
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Backend API is running at <code className="bg-gray-100 px-2 py-1 rounded">localhost:5000</code></li>
            <li>Frontend is configured with Vite + React + TypeScript + Tailwind</li>
            <li>API services for templates and contracts are ready</li>
            <li>Navigate to /templates or /contracts to start using the platform</li>
            <li>Run <code className="bg-gray-100 px-2 py-1 rounded">npm run seed</code> in backend to load sample templates</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function TemplatesPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Contract Templates</h1>
        <button className="btn-primary">Create Template</button>
      </div>
      <div className="card">
        <p className="text-gray-600">Template list will be displayed here.</p>
        <p className="text-sm text-gray-500 mt-2">
          API Endpoint: GET /api/templates
        </p>
      </div>
    </div>
  );
}

function ContractsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
        <button className="btn-primary">Create Contract</button>
      </div>
      <div className="card">
        <p className="text-gray-600">Contract list will be displayed here.</p>
        <p className="text-sm text-gray-500 mt-2">
          API Endpoint: GET /api/contracts
        </p>
      </div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">CLM Platform</h1>
              <div className="ml-10 flex space-x-4">
                <a href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                  Dashboard
                </a>
                <a href="/templates" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                  Templates
                </a>
                <a href="/contracts" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                  Contracts
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <button className="btn-secondary text-sm">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6">
        {children}
      </main>
    </div>
  );
}

function App() {
  // Simulated auth state - in production, use Zustand store
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout>
                <Routes>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="templates" element={<TemplatesPage />} />
                  <Route path="contracts" element={<ContractsPage />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          {/* Nested routes within layout */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
