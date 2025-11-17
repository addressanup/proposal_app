import { Link } from 'react-router-dom';
import { Home, Search, FileQuestion, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = '404 - Page Not Found | ContractFlow';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Simple Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ContractFlow
              </span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8 relative">
            <div className="inline-flex items-center justify-center w-48 h-48 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full opacity-10 animate-pulse"></div>
              <FileQuestion className="text-blue-600 relative z-10" size={96} strokeWidth={1.5} />
            </div>

            {/* Floating Numbers */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
              <span className="text-[120px] font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent opacity-20 leading-none">
                404
              </span>
            </div>
          </div>

          {/* Text Content */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Oops! The page you're looking for doesn't exist.
            </p>
            <p className="text-gray-500">
              The page might have been moved, deleted, or the URL might be incorrect.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold"
            >
              <Home size={20} />
              Go to Homepage
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 hover:shadow-lg transition-all font-semibold"
            >
              <Search size={20} />
              Go to Dashboard
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Looking for something? Try these popular pages:
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/proposals"
                className="p-4 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    Proposals
                  </span>
                </div>
              </Link>
              <Link
                to="/contracts"
                className="p-4 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    Contracts
                  </span>
                </div>
              </Link>
              <Link
                to="/templates"
                className="p-4 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    Templates
                  </span>
                </div>
              </Link>
              <Link
                to="/settings"
                className="p-4 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    Settings
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Still can't find what you're looking for?
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link to="/faq" className="text-blue-600 hover:text-blue-700 font-medium">
                Visit FAQ
              </Link>
              <span className="text-gray-300">•</span>
              <Link to="/sitemap" className="text-blue-600 hover:text-blue-700 font-medium">
                View Sitemap
              </Link>
              <span className="text-gray-300">•</span>
              <a href="mailto:support@contractflow.com" className="text-blue-600 hover:text-blue-700 font-medium">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span className="text-gray-300">•</span>
            <Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
            <span className="text-gray-300">•</span>
            <Link to="/terms" className="hover:text-blue-600">Terms of Use</Link>
            <span className="text-gray-300">•</span>
            <p className="text-gray-500">© 2024 ContractFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
