import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Terms of Use - ContractFlow';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <FileText className="text-blue-600" size={32} />
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
                <FileText className="text-blue-600" size={32} />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Terms of Use</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Last Updated: January 15, 2024
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Please read these terms carefully before using ContractFlow. By accessing or using our service, you agree to be bound by these terms.
                </p>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>
                  By creating an account, accessing, or using ContractFlow ("Service"), you agree to these Terms of Use ("Terms"). If you do not agree to these Terms, you must not use our Service.
                </p>
                <p>
                  These Terms constitute a legally binding agreement between you (either an individual or entity) and ContractFlow Inc. ("Company," "we," "us," or "our").
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>
                  ContractFlow is a cloud-based contract lifecycle management platform that provides:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contract creation, editing, and template management</li>
                  <li>Digital signature and e-signature services</li>
                  <li>Collaboration and workflow tools</li>
                  <li>Document storage and version control</li>
                  <li>Analytics, reporting, and compliance features</li>
                  <li>Integration with third-party services</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">3.1 Eligibility</h3>
                <p>
                  You must be at least 18 years old and capable of forming a binding contract to use our Service. By registering, you represent that you meet these requirements.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">3.2 Account Security</h3>
                <p>You are responsible for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized access</li>
                  <li>Providing accurate and current information</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">3.3 Account Types</h3>
                <div className="grid md:grid-cols-2 gap-4 my-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Individual Account</h4>
                    <p className="text-sm text-gray-700">Personal use with limited features</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Organization Account</h4>
                    <p className="text-sm text-gray-700">Team collaboration with advanced features</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>You agree NOT to:</p>
                <div className="bg-red-50 rounded-xl p-6 my-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Violate any laws, regulations, or third-party rights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Upload malicious code, viruses, or harmful content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Attempt to gain unauthorized access to our systems</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Interfere with or disrupt the Service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Use the Service for illegal or fraudulent activities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Resell or redistribute the Service without authorization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Scrape, mine, or extract data from the Service</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Subscription and Payment</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">5.1 Pricing</h3>
                <p>
                  Subscription fees are displayed on our pricing page. We reserve the right to modify pricing with 30 days' notice to existing subscribers.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">5.2 Billing</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subscriptions are billed monthly or annually in advance</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>You authorize us to charge your payment method automatically</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">5.3 Free Trial</h3>
                <p>
                  We may offer a free trial period. You will not be charged until the trial ends. We may require payment information upfront to verify your identity.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">5.4 Cancellation</h3>
                <p>
                  You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. You will retain access until that time.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">6.1 Our Rights</h3>
                <p>
                  ContractFlow and all related trademarks, logos, and content are owned by us. You may not use our intellectual property without permission.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">6.2 Your Rights</h3>
                <p>
                  You retain all rights to your content (contracts, documents, data). By using our Service, you grant us a license to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Store, process, and transmit your content</li>
                  <li>Display your content to authorized users</li>
                  <li>Create backups and copies for service operation</li>
                  <li>Analyze anonymized data for service improvement</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">6.3 Feedback</h3>
                <p>
                  Any feedback, suggestions, or ideas you provide become our property and may be used without compensation or attribution.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data and Privacy</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>
                  Our collection and use of personal information is governed by our <Link to="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>. By using our Service, you consent to our privacy practices.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Service Availability</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>
                  We strive to provide 99.9% uptime but cannot guarantee uninterrupted access. We may:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Perform scheduled maintenance with advance notice</li>
                  <li>Make emergency updates without notice</li>
                  <li>Modify or discontinue features</li>
                  <li>Impose usage limits or restrictions</li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimers and Limitations</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">DISCLAIMER OF WARRANTIES</h3>
                  <p className="text-sm uppercase">
                    THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">LIMITATION OF LIABILITY</h3>
                  <p className="text-sm uppercase">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA LOSS, OR BUSINESS INTERRUPTION.
                  </p>
                  <p className="text-sm mt-3">
                    Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>
                  You agree to indemnify and hold us harmless from any claims, damages, losses, and expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Your use of the Service</li>
                  <li>Your content</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights</li>
                </ul>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">11.1 By You</h3>
                <p>
                  You may terminate your account at any time through your account settings or by contacting support.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">11.2 By Us</h3>
                <p>
                  We may suspend or terminate your account if you:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violate these Terms</li>
                  <li>Engage in fraudulent or illegal activities</li>
                  <li>Fail to pay fees</li>
                  <li>Present a security risk</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">11.3 Effect of Termination</h3>
                <p>
                  Upon termination, you will lose access to the Service. We will retain your data for 30 days for potential recovery, after which it will be deleted.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Dispute Resolution</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">12.1 Governing Law</h3>
                <p>
                  These Terms are governed by the laws of the State of California, without regard to conflict of law principles.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">12.2 Arbitration</h3>
                <p>
                  Any disputes shall be resolved through binding arbitration in San Francisco, California, under the rules of the American Arbitration Association.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6">12.3 Class Action Waiver</h3>
                <p>
                  You agree to resolve disputes on an individual basis only, not as part of a class action or collective proceeding.
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. General Provisions</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and us</li>
                  <li><strong>Severability:</strong> If any provision is invalid, the remainder remains in effect</li>
                  <li><strong>Waiver:</strong> Failure to enforce any right does not waive that right</li>
                  <li><strong>Assignment:</strong> You may not assign these Terms without our consent</li>
                  <li><strong>Force Majeure:</strong> We are not liable for delays due to circumstances beyond our control</li>
                </ul>
              </div>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to Terms</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>
                  We may modify these Terms at any time. Material changes will be notified via email or in-app notification. Continued use after changes constitutes acceptance.
                </p>
              </div>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>For questions about these Terms, contact us:</p>
                <div className="bg-gray-50 rounded-xl p-6 mt-4">
                  <p className="mb-2"><strong>Email:</strong> <a href="mailto:legal@contractflow.com" className="text-blue-600 hover:text-blue-700">legal@contractflow.com</a></p>
                  <p className="mb-2"><strong>Address:</strong> ContractFlow Inc., 123 Legal Street, San Francisco, CA 94105</p>
                  <p><strong>Phone:</strong> +1 (415) 555-0100</p>
                </div>
              </div>
            </section>
          </div>

          {/* Acceptance Notice */}
          <div className="mt-12 p-6 bg-green-50 border-l-4 border-green-500 rounded-r-xl">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Acknowledgment</h3>
                <p className="text-sm text-gray-700">
                  By clicking "I Accept" or by accessing or using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link to="/" className="text-blue-600 hover:text-blue-700">Home</Link>
              <Link to="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
              <Link to="/faq" className="text-blue-600 hover:text-blue-700">FAQ</Link>
              <Link to="/sitemap" className="text-blue-600 hover:text-blue-700">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
