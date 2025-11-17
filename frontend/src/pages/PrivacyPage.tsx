import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Database, FileText, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy - ContractFlow';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="text-blue-600" size={32} />
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Shield className="text-blue-600" size={32} />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Last Updated: January 15, 2024
            </p>
            <p className="text-gray-600 mt-4 leading-relaxed">
              At ContractFlow, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our contract lifecycle management platform.
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-blue-50 rounded-xl p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Table of Contents</h2>
            <ul className="space-y-2">
              <li><a href="#information-we-collect" className="text-blue-600 hover:text-blue-700">1. Information We Collect</a></li>
              <li><a href="#how-we-use" className="text-blue-600 hover:text-blue-700">2. How We Use Your Information</a></li>
              <li><a href="#data-security" className="text-blue-600 hover:text-blue-700">3. Data Security</a></li>
              <li><a href="#data-sharing" className="text-blue-600 hover:text-blue-700">4. Data Sharing and Disclosure</a></li>
              <li><a href="#your-rights" className="text-blue-600 hover:text-blue-700">5. Your Privacy Rights</a></li>
              <li><a href="#cookies" className="text-blue-600 hover:text-blue-700">6. Cookies and Tracking</a></li>
              <li><a href="#data-retention" className="text-blue-600 hover:text-blue-700">7. Data Retention</a></li>
              <li><a href="#international" className="text-blue-600 hover:text-blue-700">8. International Data Transfers</a></li>
              <li><a href="#children" className="text-blue-600 hover:text-blue-700">9. Children's Privacy</a></li>
              <li><a href="#changes" className="text-blue-600 hover:text-blue-700">10. Changes to This Policy</a></li>
              <li><a href="#contact" className="text-blue-600 hover:text-blue-700">11. Contact Us</a></li>
            </ul>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Section 1 */}
            <section id="information-we-collect">
              <div className="flex items-center gap-3 mb-4">
                <Database className="text-blue-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
              </div>
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mt-6">1.1 Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account Information:</strong> Name, email address, phone number, company name, job title</li>
                  <li><strong>Profile Information:</strong> Profile picture, bio, preferences, notification settings</li>
                  <li><strong>Contract Data:</strong> Contracts, proposals, documents, templates, and related metadata</li>
                  <li><strong>Communication Data:</strong> Messages, comments, notes, and collaboration content</li>
                  <li><strong>Payment Information:</strong> Billing address, payment method (processed securely through third-party providers)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">1.2 Automatically Collected Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Usage Data:</strong> Pages viewed, features used, time spent, click patterns</li>
                  <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                  <li><strong>Log Data:</strong> Access times, error logs, performance data</li>
                  <li><strong>Location Data:</strong> General geographic location based on IP address</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">1.3 Information from Third Parties</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Authentication providers (Google, Microsoft, etc.)</li>
                  <li>Payment processors</li>
                  <li>Analytics and marketing services</li>
                  <li>Integration partners (CRM, storage services, etc.)</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section id="how-we-use">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="text-blue-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
              </div>
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>We use the information we collect for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Provision:</strong> To provide, maintain, and improve our CLM platform</li>
                  <li><strong>Account Management:</strong> To create and manage your account</li>
                  <li><strong>Communication:</strong> To send transactional emails, notifications, and support responses</li>
                  <li><strong>Collaboration:</strong> To enable collaboration features between users and organizations</li>
                  <li><strong>Analytics:</strong> To understand usage patterns and improve user experience</li>
                  <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security incidents</li>
                  <li><strong>Compliance:</strong> To comply with legal obligations and enforce our terms</li>
                  <li><strong>Marketing:</strong> To send promotional communications (with your consent)</li>
                  <li><strong>Product Development:</strong> To develop new features and services</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="data-security">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="text-blue-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">3. Data Security</h2>
              </div>
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>We implement industry-standard security measures to protect your data:</p>
                <div className="bg-green-50 rounded-xl p-6 my-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="bg-green-500 rounded-full p-1 mt-1">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <span><strong>Encryption:</strong> AES-256 encryption at rest and TLS 1.3 in transit</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-green-500 rounded-full p-1 mt-1">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <span><strong>Access Controls:</strong> Role-based access control and multi-factor authentication</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-green-500 rounded-full p-1 mt-1">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <span><strong>Infrastructure:</strong> Secure cloud hosting with SOC 2 Type II certification</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-green-500 rounded-full p-1 mt-1">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <span><strong>Monitoring:</strong> 24/7 security monitoring and incident response</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-green-500 rounded-full p-1 mt-1">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <span><strong>Backups:</strong> Regular automated backups with disaster recovery procedures</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-green-500 rounded-full p-1 mt-1">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <span><strong>Audit Logs:</strong> Comprehensive activity logging for security and compliance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="data-sharing">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="text-blue-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">4. Data Sharing and Disclosure</h2>
              </div>
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>We do not sell your personal information. We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Providers:</strong> Third-party vendors who provide infrastructure, analytics, payment processing, and support services</li>
                  <li><strong>Business Partners:</strong> Integration partners you choose to connect with our platform</li>
                  <li><strong>Organization Members:</strong> Other users within your organization (according to permissions)</li>
                  <li><strong>Legal Requirements:</strong> Government authorities when required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section id="your-rights">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-blue-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">5. Your Privacy Rights</h2>
              </div>
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>Depending on your location, you may have the following rights:</p>
                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Access</h4>
                    <p className="text-sm text-gray-700">Request a copy of your personal data</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Rectification</h4>
                    <p className="text-sm text-gray-700">Correct inaccurate or incomplete data</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Deletion</h4>
                    <p className="text-sm text-gray-700">Request deletion of your personal data</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Portability</h4>
                    <p className="text-sm text-gray-700">Receive your data in a machine-readable format</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Objection</h4>
                    <p className="text-sm text-gray-700">Object to certain data processing activities</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Restriction</h4>
                    <p className="text-sm text-gray-700">Restrict processing of your personal data</p>
                  </div>
                </div>
                <p>To exercise these rights, please contact us at <a href="mailto:privacy@contractflow.com" className="text-blue-600 hover:text-blue-700">privacy@contractflow.com</a></p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="cookies">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>We use cookies and similar tracking technologies for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for the platform to function (authentication, security)</li>
                  <li><strong>Analytics Cookies:</strong> To understand how you use our platform</li>
                  <li><strong>Preference Cookies:</strong> To remember your settings and preferences</li>
                  <li><strong>Marketing Cookies:</strong> To show relevant advertisements (with your consent)</li>
                </ul>
                <p>You can control cookies through your browser settings. Note that disabling essential cookies may affect platform functionality.</p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="data-retention">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>We retain your information for as long as necessary to:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Provide our services to you</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce agreements</li>
                  <li>Meet legitimate business purposes</li>
                </ul>
                <p className="mt-4">Upon account deletion, we will delete or anonymize your data within 30 days, except where retention is required by law.</p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="international">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. International Data Transfers</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Standard Contractual Clauses approved by the European Commission</li>
                  <li>Data Processing Agreements with all service providers</li>
                  <li>Adequacy decisions where applicable</li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section id="children">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>Our platform is not intended for children under 16. We do not knowingly collect information from children. If you believe we have collected information from a child, please contact us immediately.</p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="changes">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>We may update this Privacy Policy from time to time. We will notify you of material changes by:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Posting the updated policy on our website</li>
                  <li>Sending an email notification to registered users</li>
                  <li>Displaying a prominent notice in the platform</li>
                </ul>
                <p className="mt-4">Continued use of our services after changes constitutes acceptance of the updated policy.</p>
              </div>
            </section>

            {/* Section 11 */}
            <section id="contact">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>If you have questions about this Privacy Policy or our privacy practices, please contact us:</p>
                <div className="bg-gray-50 rounded-xl p-6 mt-4">
                  <p className="mb-2"><strong>Email:</strong> <a href="mailto:privacy@contractflow.com" className="text-blue-600 hover:text-blue-700">privacy@contractflow.com</a></p>
                  <p className="mb-2"><strong>Address:</strong> ContractFlow Inc., 123 Legal Street, San Francisco, CA 94105</p>
                  <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@contractflow.com" className="text-blue-600 hover:text-blue-700">dpo@contractflow.com</a></p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link to="/" className="text-blue-600 hover:text-blue-700">Home</Link>
              <Link to="/terms" className="text-blue-600 hover:text-blue-700">Terms of Use</Link>
              <Link to="/faq" className="text-blue-600 hover:text-blue-700">FAQ</Link>
              <Link to="/sitemap" className="text-blue-600 hover:text-blue-700">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
