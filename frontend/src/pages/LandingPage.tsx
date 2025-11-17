import { Link } from 'react-router-dom';
import {
  FileText,
  Shield,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
  Lock,
  TrendingUp,
  Clock,
  FileSignature,
  Bell,
  BarChart3,
  Search,
  Sparkles,
} from 'lucide-react';
import { useEffect } from 'react';

export default function LandingPage() {
  useEffect(() => {
    // SEO Meta Tags
    document.title = 'ContractFlow - Modern Contract Lifecycle Management Platform';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Streamline your contract lifecycle with ContractFlow. Powerful CLM software for creating, negotiating, signing, and managing contracts with AI-powered insights and automation.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Streamline your contract lifecycle with ContractFlow. Powerful CLM software for creating, negotiating, signing, and managing contracts with AI-powered insights and automation.';
      document.head.appendChild(meta);
    }

    // Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = 'ContractFlow - Modern Contract Lifecycle Management';
      document.head.appendChild(meta);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content = 'Enterprise-grade CLM platform with digital signatures, version control, and real-time collaboration.';
      document.head.appendChild(meta);
    }

    // Keywords meta tag
    const keywords = document.querySelector('meta[name="keywords"]');
    if (!keywords) {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = 'contract management, CLM, contract lifecycle, digital signatures, document management, contract automation, legal tech, contract negotiation, e-signature';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <FileSignature className="text-blue-600" size={32} />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ContractFlow
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#benefits" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Benefits</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Pricing</a>
              <Link to="/faq" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">FAQ</Link>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Sign In</Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all font-semibold"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Sparkles size={16} />
                Trusted by 10,000+ Organizations
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Contract Management
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Streamline your entire contract lifecycle from creation to renewal. Save time, reduce risk, and gain visibility with the modern CLM platform built for growing teams.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full hover:shadow-2xl hover:scale-105 transition-all text-lg font-semibold"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2" size={20} />
                </Link>
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all text-lg font-semibold"
                >
                  Watch Demo
                </a>
              </div>
              <div className="mt-8 flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className="text-gray-600">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className="text-gray-600">14-day free trial</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <FileText className="text-blue-600" size={24} />
                    <div className="flex-1">
                      <div className="h-2 bg-blue-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-blue-100 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <CheckCircle className="text-green-600" size={24} />
                    <div className="flex-1">
                      <div className="h-2 bg-green-200 rounded w-2/3 mb-2"></div>
                      <div className="h-2 bg-green-100 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
                    <Users className="text-indigo-600" size={24} />
                    <div className="flex-1">
                      <div className="h-2 bg-indigo-200 rounded w-4/5 mb-2"></div>
                      <div className="h-2 bg-indigo-100 rounded w-2/5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600 font-medium">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500K+</div>
              <div className="text-gray-600 font-medium">Contracts Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600 font-medium">Uptime SLA</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">70%</div>
              <div className="text-gray-600 font-medium">Time Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Contracts
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to streamline every stage of your contract lifecycle
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:scale-105">
              <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <FileText className="text-blue-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Templates</h3>
              <p className="text-gray-600 leading-relaxed">
                Create contracts in seconds with customizable templates. AI-powered suggestions ensure you never miss critical clauses.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:scale-105">
              <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <FileSignature className="text-green-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Digital Signatures</h3>
              <p className="text-gray-600 leading-relaxed">
                Legally binding e-signatures with audit trails. Sequential or parallel signing workflows for complex approvals.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:scale-105">
              <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Users className="text-purple-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">
                Work together seamlessly with your team. Comments, mentions, and notifications keep everyone aligned.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:scale-105">
              <div className="bg-yellow-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Clock className="text-yellow-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Version Control</h3>
              <p className="text-gray-600 leading-relaxed">
                Track every change with automatic versioning. Compare versions and revert to previous drafts with one click.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:scale-105">
              <div className="bg-red-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Bell className="text-red-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Reminders</h3>
              <p className="text-gray-600 leading-relaxed">
                Never miss a deadline. Automated reminders for renewals, obligations, and key milestones keep you on track.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:scale-105">
              <div className="bg-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="text-indigo-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics & Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Gain visibility into contract performance. Track cycle times, identify bottlenecks, and optimize your process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Teams Choose ContractFlow
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join thousands of organizations transforming their contract management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <Zap className="mb-4" size={32} />
              <h3 className="text-2xl font-bold mb-3">10x Faster</h3>
              <p className="text-blue-100">
                Reduce contract cycle time from weeks to days with automated workflows and smart templates.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <Shield className="mb-4" size={32} />
              <h3 className="text-2xl font-bold mb-3">Enterprise Security</h3>
              <p className="text-blue-100">
                Bank-level encryption, SOC 2 Type II certified, and GDPR compliant. Your data is always protected.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <TrendingUp className="mb-4" size={32} />
              <h3 className="text-2xl font-bold mb-3">Reduce Costs</h3>
              <p className="text-blue-100">
                Save up to 70% on contract management costs while improving compliance and reducing risks.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <Globe className="mb-4" size={32} />
              <h3 className="text-2xl font-bold mb-3">Global Reach</h3>
              <p className="text-blue-100">
                Support for 50+ languages and currencies. Manage contracts across borders with ease.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <Lock className="mb-4" size={32} />
              <h3 className="text-2xl font-bold mb-3">Compliance Ready</h3>
              <p className="text-blue-100">
                Built-in audit trails, access controls, and compliance reporting for peace of mind.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <Search className="mb-4" size={32} />
              <h3 className="text-2xl font-bold mb-3">AI-Powered Search</h3>
              <p className="text-blue-100">
                Find any contract or clause instantly with intelligent search and smart filters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Teams Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "ContractFlow transformed our legal ops. We went from 2 weeks to 2 days for contract approvals. Game changer!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Jane Doe</div>
                  <div className="text-sm text-gray-600">Legal Director, TechCorp</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The collaboration features are incredible. Our sales and legal teams finally work seamlessly together."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  MS
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Mike Smith</div>
                  <div className="text-sm text-gray-600">VP Sales, Growth Inc</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Best CLM platform we've used. Intuitive, powerful, and the support team is fantastic. Highly recommend!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  SK
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Kim</div>
                  <div className="text-sm text-gray-600">COO, Enterprise Solutions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Contract Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 10,000+ organizations already saving time and reducing risk with ContractFlow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-full hover:shadow-2xl hover:scale-105 transition-all text-lg font-semibold"
            >
              Start Free Trial
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-blue-600 transition-all text-lg font-semibold"
            >
              Schedule Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileSignature className="text-blue-500" size={28} />
                <span className="text-xl font-bold text-white">ContractFlow</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Modern contract lifecycle management for growing teams.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#demo" className="hover:text-white transition-colors">Demo</a></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
                <li><Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link></li>
                <li><a href="#security" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ContractFlow. All rights reserved. Built with ❤️ for modern teams.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
