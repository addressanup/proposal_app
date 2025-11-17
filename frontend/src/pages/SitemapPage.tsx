import { Link } from 'react-router-dom';
import { Map, ArrowLeft, FileText, Shield, Users, BarChart3, Bell, MessageSquare, Network, FolderOpen, HelpCircle, FileSignature } from 'lucide-react';
import { useEffect } from 'react';

export default function SitemapPage() {
  useEffect(() => {
    document.title = 'Sitemap - ContractFlow';
    window.scrollTo(0, 0);
  }, []);

  const sitemapSections = [
    {
      title: 'Public Pages',
      icon: Globe,
      links: [
        { name: 'Home', path: '/', description: 'Main landing page' },
        { name: 'Features', path: '/#features', description: 'Platform features overview' },
        { name: 'Benefits', path: '/#benefits', description: 'Why choose ContractFlow' },
        { name: 'Pricing', path: '/#pricing', description: 'Plans and pricing' },
        { name: 'FAQ', path: '/faq', description: 'Frequently asked questions' },
        { name: 'Privacy Policy', path: '/privacy', description: 'How we handle your data' },
        { name: 'Terms of Use', path: '/terms', description: 'Terms and conditions' },
        { name: 'Sitemap', path: '/sitemap', description: 'This page' },
      ],
    },
    {
      title: 'Authentication',
      icon: Shield,
      links: [
        { name: 'Sign In', path: '/login', description: 'Login to your account' },
        { name: 'Register', path: '/register', description: 'Create a new account' },
      ],
    },
    {
      title: 'Dashboard & Overview',
      icon: BarChart3,
      links: [
        { name: 'Dashboard', path: '/dashboard', description: 'Main dashboard with analytics' },
        { name: 'Notifications', path: '/notifications', description: 'All notifications' },
        { name: 'Profile Settings', path: '/settings', description: 'Account settings and preferences' },
      ],
    },
    {
      title: 'Proposals',
      icon: FileText,
      links: [
        { name: 'All Proposals', path: '/proposals', description: 'Browse all proposals' },
        { name: 'Create Proposal', path: '/proposals/create', description: 'Create new proposal' },
        { name: 'Proposal Details', path: '/proposals/:id', description: 'View and edit proposal' },
        { name: 'Edit Proposal', path: '/proposals/:id/edit', description: 'Edit proposal content' },
      ],
    },
    {
      title: 'Contracts',
      icon: FileSignature,
      links: [
        { name: 'All Contracts', path: '/contracts', description: 'Browse all contracts' },
        { name: 'Create Contract', path: '/contracts/create', description: 'Create new contract' },
        { name: 'Contract Details', path: '/contracts/:id', description: 'View contract details' },
        { name: 'Edit Contract', path: '/contracts/:id/edit', description: 'Edit contract content' },
      ],
    },
    {
      title: 'Templates',
      icon: FolderOpen,
      links: [
        { name: 'All Templates', path: '/templates', description: 'Browse contract templates' },
        { name: 'Create Template', path: '/templates/create', description: 'Create new template' },
        { name: 'Template Details', path: '/templates/:id', description: 'View template details' },
        { name: 'Edit Template', path: '/templates/:id/edit', description: 'Edit template content' },
      ],
    },
    {
      title: 'Organizations',
      icon: Users,
      links: [
        { name: 'All Organizations', path: '/organizations', description: 'Manage organizations' },
        { name: 'Organization Details', path: '/organizations/:id', description: 'View organization details' },
      ],
    },
    {
      title: 'Communication',
      icon: MessageSquare,
      links: [
        { name: 'Messages', path: '/messages', description: 'Direct messages and conversations' },
        { name: 'Connections', path: '/connections', description: 'Network and connections' },
      ],
    },
    {
      title: 'Management',
      icon: Bell,
      links: [
        { name: 'Reminders', path: '/reminders', description: 'Manage reminders and deadlines' },
        { name: 'Audit Logs', path: '/audit-logs', description: 'View activity audit trail' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <Map className="text-blue-600" size={32} />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <Map size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sitemap</h1>
          <p className="text-xl text-blue-100">
            Complete navigation guide to all pages on ContractFlow
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Sitemap Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sitemapSections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Icon className="text-blue-600" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        to={link.path}
                        className="group block p-3 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <div className="font-medium text-blue-600 group-hover:text-blue-700 mb-1">
                          {link.name}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {link.description}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* SEO Information */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About ContractFlow</h2>
            <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>
                <strong>ContractFlow</strong> is the modern contract lifecycle management platform trusted by over 10,000 organizations worldwide. Our cloud-based solution streamlines every aspect of contract management from creation to renewal.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6">Key Features:</h3>
              <ul className="grid md:grid-cols-2 gap-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Smart contract templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Digital signatures (e-signature)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Real-time collaboration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Version control & tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Automated reminders & alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Analytics & reporting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Obligation management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Milestone tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Audit logs & compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>API & integrations</span>
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6">Industries We Serve:</h3>
              <p>
                ContractFlow serves businesses across all industries including technology, healthcare, finance, legal services, real estate, manufacturing, and more. Whether you're a startup or enterprise, our scalable platform adapts to your needs.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6">Security & Compliance:</h3>
              <p>
                Your data security is our top priority. ContractFlow is SOC 2 Type II certified, GDPR compliant, and uses bank-level encryption (AES-256). All digital signatures comply with ESIGN, eIDAS, and international e-signature standards.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6">Get Started:</h3>
              <p>
                Start your free 14-day trial today with no credit card required. Experience the power of modern contract management and join thousands of organizations already saving time and reducing risk with ContractFlow.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full hover:shadow-lg transition-all font-semibold"
              >
                Start Free Trial
              </Link>
              <a
                href="mailto:sales@contractflow.com"
                className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all font-semibold"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Need help? Visit our <Link to="/faq" className="text-blue-600 hover:text-blue-700">FAQ page</Link> or contact <a href="mailto:support@contractflow.com" className="text-blue-600 hover:text-blue-700">support@contractflow.com</a>
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link to="/" className="text-blue-600 hover:text-blue-700">Home</Link>
              <Link to="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
              <Link to="/terms" className="text-blue-600 hover:text-blue-700">Terms of Use</Link>
              <Link to="/faq" className="text-blue-600 hover:text-blue-700">FAQ</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing import
function Globe({ ...props }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
