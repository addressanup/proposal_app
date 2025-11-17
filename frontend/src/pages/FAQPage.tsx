import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, ChevronDown, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'What is ContractFlow?',
    answer: 'ContractFlow is a modern contract lifecycle management (CLM) platform that helps organizations create, negotiate, sign, and manage contracts efficiently. It combines document management, digital signatures, collaboration tools, and analytics in one unified platform.',
  },
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Click the "Get Started Free" button on our homepage, provide your email address, create a password, and verify your email. You\'ll get instant access to a 14-day free trial with no credit card required.',
  },
  {
    category: 'Getting Started',
    question: 'Is there a free trial?',
    answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card is required to start your trial. You can upgrade to a paid plan at any time.',
  },
  {
    category: 'Getting Started',
    question: 'What browsers are supported?',
    answer: 'ContractFlow works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience and security.',
  },

  // Features
  {
    category: 'Features',
    question: 'Can I create custom contract templates?',
    answer: 'Absolutely! You can create unlimited custom templates with variables, conditional logic, and formatting. Our template library also includes industry-standard templates to get you started.',
  },
  {
    category: 'Features',
    question: 'Are digital signatures legally binding?',
    answer: 'Yes! ContractFlow uses electronic signatures that comply with e-signature laws including ESIGN (US), eIDAS (EU), and other international standards. Every signature includes a complete audit trail.',
  },
  {
    category: 'Features',
    question: 'Can multiple people collaborate on a contract?',
    answer: 'Yes! You can invite team members to collaborate with customizable permissions (owner, editor, commentator, viewer). Real-time collaboration features include comments, mentions, and version control.',
  },
  {
    category: 'Features',
    question: 'Does ContractFlow integrate with other tools?',
    answer: 'Yes, we integrate with popular tools including Google Drive, Dropbox, Salesforce, HubSpot, Slack, and Microsoft Teams. Our REST API allows custom integrations as well.',
  },
  {
    category: 'Features',
    question: 'Can I track contract milestones and deadlines?',
    answer: 'Yes! ContractFlow includes smart reminders for renewals, obligations, milestones, and custom deadlines. You\'ll receive notifications via email and in-app to never miss important dates.',
  },

  // Pricing & Plans
  {
    category: 'Pricing & Plans',
    question: 'What plans do you offer?',
    answer: 'We offer three plans: Starter ($29/user/month), Professional ($79/user/month), and Enterprise (custom pricing). Each plan includes different features and limits. Visit our pricing page for details.',
  },
  {
    category: 'Pricing & Plans',
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time with no penalties. Cancellation takes effect at the end of your current billing period, and you\'ll retain access until then.',
  },
  {
    category: 'Pricing & Plans',
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes! Annual plans receive a 20% discount compared to monthly billing. Enterprise customers can discuss custom pricing and terms.',
  },
  {
    category: 'Pricing & Plans',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) and ACH bank transfers for enterprise accounts. Payments are processed securely through Stripe.',
  },
  {
    category: 'Pricing & Plans',
    question: 'Is there a setup fee?',
    answer: 'No setup fees! You only pay the monthly or annual subscription price. Enterprise customers receive free onboarding and training.',
  },

  // Security & Compliance
  {
    category: 'Security & Compliance',
    question: 'How secure is my data?',
    answer: 'Your data is protected with bank-level AES-256 encryption at rest and TLS 1.3 in transit. We\'re SOC 2 Type II certified, GDPR compliant, and undergo regular security audits.',
  },
  {
    category: 'Security & Compliance',
    question: 'Where is my data stored?',
    answer: 'Data is stored in secure, redundant data centers in the US (with EU options for GDPR compliance). We maintain automatic backups with 99.9% uptime SLA.',
  },
  {
    category: 'Security & Compliance',
    question: 'Who can access my contracts?',
    answer: 'Only users you explicitly invite can access your contracts. You control permissions at the organization, document, and user levels. Our team cannot access your data without your permission.',
  },
  {
    category: 'Security & Compliance',
    question: 'Is ContractFlow HIPAA compliant?',
    answer: 'Yes! Enterprise plans can include HIPAA compliance with a Business Associate Agreement (BAA). Contact our sales team to discuss HIPAA requirements.',
  },
  {
    category: 'Security & Compliance',
    question: 'Do you provide audit logs?',
    answer: 'Yes! All actions are logged with timestamps, user information, and IP addresses. Audit logs can be exported for compliance and investigations.',
  },

  // Support
  {
    category: 'Support',
    question: 'What support options are available?',
    answer: 'All plans include email support (24-48 hour response). Professional and Enterprise plans include priority support, live chat, and phone support. Enterprise customers get a dedicated success manager.',
  },
  {
    category: 'Support',
    question: 'Do you offer training?',
    answer: 'Yes! We provide video tutorials, documentation, and webinars for all users. Enterprise customers receive personalized onboarding and training sessions.',
  },
  {
    category: 'Support',
    question: 'Can I import my existing contracts?',
    answer: 'Yes! You can import contracts via bulk upload (PDF, Word, etc.) or migrate from another CLM platform. Enterprise customers get free migration assistance.',
  },
  {
    category: 'Support',
    question: 'What if I need help getting started?',
    answer: 'We offer comprehensive onboarding resources including quick-start guides, video tutorials, and live training sessions. Our support team is always available to help you succeed.',
  },

  // Technical
  {
    category: 'Technical',
    question: 'Can I use ContractFlow on mobile devices?',
    answer: 'Yes! ContractFlow is fully responsive and works on smartphones and tablets through your mobile browser. Native iOS and Android apps are coming soon.',
  },
  {
    category: 'Technical',
    question: 'What file formats are supported?',
    answer: 'We support PDF, Word (.docx), Excel, PowerPoint, images (JPG, PNG), and plain text. Documents are automatically converted for online viewing and editing.',
  },
  {
    category: 'Technical',
    question: 'Is there an API?',
    answer: 'Yes! Professional and Enterprise plans include REST API access with comprehensive documentation. Use our API to build custom integrations and automate workflows.',
  },
  {
    category: 'Technical',
    question: 'What are the system requirements?',
    answer: 'ContractFlow is cloud-based and requires only a modern web browser and internet connection. No software installation is needed.',
  },
  {
    category: 'Technical',
    question: 'Do you offer on-premise deployment?',
    answer: 'For Enterprise customers with specific compliance requirements, we can discuss private cloud or on-premise deployment options. Contact our sales team for details.',
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Frequently Asked Questions - ContractFlow';
    window.scrollTo(0, 0);
  }, []);

  const categories = ['All', ...Array.from(new Set(faqs.map((faq) => faq.category)))];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <HelpCircle className="text-blue-600" size={32} />
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
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <HelpCircle size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-blue-100">
            Find answers to common questions about ContractFlow
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-600 text-lg">No questions found matching your search.</p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                <button
                  onClick={() => toggleExpand(index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex-1 pr-4">
                    <div className="text-xs font-semibold text-blue-600 mb-2">{faq.category}</div>
                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  </div>
                  <ChevronDown
                    className={`flex-shrink-0 text-gray-400 transition-transform ${
                      expandedIndex === index ? 'transform rotate-180' : ''
                    }`}
                    size={24}
                  />
                </button>
                {expandedIndex === index && (
                  <div className="px-6 pb-6">
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Still Have Questions */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-blue-100 mb-6">
            Our support team is here to help you succeed
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@contractflow.com"
              className="inline-flex items-center justify-center bg-white text-blue-600 px-6 py-3 rounded-full hover:shadow-lg transition-all font-semibold"
            >
              Email Support
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center border-2 border-white text-white px-6 py-3 rounded-full hover:bg-white hover:text-blue-600 transition-all font-semibold"
            >
              Schedule Demo
            </a>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-700">Home</Link>
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
            <Link to="/terms" className="text-blue-600 hover:text-blue-700">Terms of Use</Link>
            <Link to="/sitemap" className="text-blue-600 hover:text-blue-700">Sitemap</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
