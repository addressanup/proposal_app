import { PrismaClient, ContractType, ContractCategory, ClauseCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create a system user for seeding (or use existing)
  let systemUser = await prisma.user.findFirst({
    where: { email: 'system@proposalapp.com' }
  });

  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: 'system@proposalapp.com',
        firstName: 'System',
        lastName: 'Administrator',
        password: 'not-used', // This user cannot login
        isEmailVerified: true
      }
    });
    console.log('✅ Created system user');
  }

  // ========================================================================
  // EMPLOYMENT AGREEMENT TEMPLATES
  // ========================================================================

  console.log('📄 Creating Employment Agreement templates...');

  await prisma.contractTemplate.create({
    data: {
      name: 'Full-Time Employment Agreement - Tech Industry',
      description: 'Comprehensive full-time employment agreement for technology companies, including IP assignment, confidentiality, and non-compete clauses.',
      contractType: ContractType.EMPLOYMENT,
      category: ContractCategory.EMPLOYMENT,
      isGlobal: true,
      isActive: true,
      version: 1,
      content: `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into on {{start_date}}, by and between:

EMPLOYER: {{company_name}}, a {{company_type}} organized under the laws of {{jurisdiction}}
Address: {{company_address}}

EMPLOYEE: {{employee_name}}
Address: {{employee_address}}
Email: {{employee_email}}

1. POSITION AND DUTIES

1.1 Position: The Employee is hired for the position of {{job_title}}.

1.2 Duties: The Employee shall perform all duties and responsibilities associated with the position, including but not limited to:
{{job_responsibilities}}

1.3 Reporting: The Employee shall report to {{supervisor_title}}.

2. COMPENSATION

2.1 Base Salary: The Employee shall receive a base salary of {{annual_salary}} per year, payable in accordance with the Employer's standard payroll schedule.

2.2 Benefits: The Employee shall be eligible for the following benefits:
- Health Insurance: {{health_insurance_details}}
- Retirement Plan: {{retirement_plan_details}}
- Paid Time Off: {{pto_days}} days per year
- {{additional_benefits}}

2.3 Bonus: {{#if has_bonus}}The Employee may be eligible for an annual performance bonus of up to {{bonus_percentage}}% of base salary, subject to company performance and individual performance metrics.{{/if}}

3. TERM AND TERMINATION

3.1 Start Date: Employment shall commence on {{start_date}}.

3.2 At-Will Employment: This employment is at-will, meaning either party may terminate the relationship at any time, with or without cause, subject to the notice requirements below.

3.3 Notice Period: Either party shall provide {{notice_period_days}} days written notice of termination.

3.4 Severance: {{#if has_severance}}Upon termination without cause, the Employee shall receive severance pay equal to {{severance_weeks}} weeks of base salary.{{/if}}

4. CONFIDENTIALITY

4.1 The Employee agrees to maintain strict confidentiality of all proprietary information, trade secrets, and confidential business information of the Employer.

4.2 This obligation shall survive the termination of employment for a period of {{confidentiality_years}} years.

5. INTELLECTUAL PROPERTY

5.1 All inventions, discoveries, works, and intellectual property created by the Employee in the course of employment shall be the exclusive property of the Employer.

5.2 The Employee agrees to execute all documents necessary to assign such rights to the Employer.

6. NON-COMPETE

{{#if has_noncompete}}6.1 For a period of {{noncompete_months}} months following termination, the Employee agrees not to engage in any business that directly competes with the Employer within {{noncompete_territory}}.{{/if}}

7. GOVERNING LAW

This Agreement shall be governed by the laws of {{governing_law}}.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

EMPLOYER: {{company_name}}

By: _______________________
Name: {{company_representative}}
Title: {{representative_title}}
Date: __________

EMPLOYEE:

Signature: _______________________
Name: {{employee_name}}
Date: __________`,
      structure: {
        sections: [
          { id: 's1', name: 'Position and Duties', order: 1, clauseIds: [] },
          { id: 's2', name: 'Compensation', order: 2, clauseIds: [] },
          { id: 's3', name: 'Term and Termination', order: 3, clauseIds: [] },
          { id: 's4', name: 'Confidentiality', order: 4, clauseIds: [] },
          { id: 's5', name: 'Intellectual Property', order: 5, clauseIds: [] },
          { id: 's6', name: 'Non-Compete', order: 6, clauseIds: [] },
          { id: 's7', name: 'Governing Law', order: 7, clauseIds: [] }
        ]
      },
      requiredFields: {
        company_name: { type: 'TEXT', label: 'Company Name' },
        company_type: { type: 'SELECT', label: 'Company Type', options: ['Corporation', 'LLC', 'Partnership'] },
        company_address: { type: 'TEXT', label: 'Company Address' },
        employee_name: { type: 'TEXT', label: 'Employee Name' },
        employee_address: { type: 'TEXT', label: 'Employee Address' },
        employee_email: { type: 'TEXT', label: 'Employee Email' },
        job_title: { type: 'TEXT', label: 'Job Title' },
        job_responsibilities: { type: 'TEXT', label: 'Job Responsibilities' },
        supervisor_title: { type: 'TEXT', label: 'Supervisor Title' },
        annual_salary: { type: 'CURRENCY', label: 'Annual Salary' },
        start_date: { type: 'DATE', label: 'Start Date' },
        notice_period_days: { type: 'NUMBER', label: 'Notice Period (Days)' },
        governing_law: { type: 'TEXT', label: 'Governing Law' },
        company_representative: { type: 'TEXT', label: 'Company Representative Name' },
        representative_title: { type: 'TEXT', label: 'Representative Title' }
      },
      optionalFields: {
        health_insurance_details: { type: 'TEXT', label: 'Health Insurance Details' },
        retirement_plan_details: { type: 'TEXT', label: 'Retirement Plan Details' },
        pto_days: { type: 'NUMBER', label: 'PTO Days per Year' },
        additional_benefits: { type: 'TEXT', label: 'Additional Benefits' },
        has_bonus: { type: 'BOOLEAN', label: 'Include Bonus Clause' },
        bonus_percentage: { type: 'PERCENTAGE', label: 'Maximum Bonus Percentage' },
        has_severance: { type: 'BOOLEAN', label: 'Include Severance' },
        severance_weeks: { type: 'NUMBER', label: 'Severance Weeks' },
        confidentiality_years: { type: 'NUMBER', label: 'Confidentiality Period (Years)', defaultValue: 2 },
        has_noncompete: { type: 'BOOLEAN', label: 'Include Non-Compete' },
        noncompete_months: { type: 'NUMBER', label: 'Non-Compete Period (Months)' },
        noncompete_territory: { type: 'TEXT', label: 'Non-Compete Territory' }
      },
      conditionalFields: {},
      jurisdiction: ['US'],
      governingLaw: 'State of California',
      language: 'en',
      tags: ['employment', 'full-time', 'tech', 'comprehensive'],
      industry: ['Technology', 'Software'],
      createdById: systemUser.id,
      updatedById: systemUser.id
    }
  });

  await prisma.contractTemplate.create({
    data: {
      name: 'Part-Time Employment Agreement',
      description: 'Simple part-time employment agreement suitable for hourly workers with flexible schedules.',
      contractType: ContractType.EMPLOYMENT,
      category: ContractCategory.EMPLOYMENT,
      isGlobal: true,
      isActive: true,
      version: 1,
      content: `PART-TIME EMPLOYMENT AGREEMENT

This Part-Time Employment Agreement is made on {{start_date}}, between:

EMPLOYER: {{company_name}}
EMPLOYEE: {{employee_name}}

1. POSITION: {{job_title}}

2. HOURS: The Employee shall work approximately {{hours_per_week}} hours per week. Schedule to be determined by mutual agreement.

3. COMPENSATION: ${{hourly_rate}} per hour, paid {{pay_frequency}}.

4. TERM: This agreement begins on {{start_date}} and continues until terminated by either party with {{notice_period_days}} days notice.

5. DUTIES: {{job_duties}}

6. CONFIDENTIALITY: The Employee agrees to keep all company information confidential.

Signed:

EMPLOYER: _____________________ Date: __________

EMPLOYEE: _____________________ Date: __________`,
      structure: {
        sections: [
          { id: 's1', name: 'Position and Hours', order: 1, clauseIds: [] },
          { id: 's2', name: 'Compensation', order: 2, clauseIds: [] },
          { id: 's3', name: 'Term', order: 3, clauseIds: [] }
        ]
      },
      requiredFields: {
        company_name: { type: 'TEXT', label: 'Company Name' },
        employee_name: { type: 'TEXT', label: 'Employee Name' },
        job_title: { type: 'TEXT', label: 'Job Title' },
        hours_per_week: { type: 'NUMBER', label: 'Hours per Week' },
        hourly_rate: { type: 'CURRENCY', label: 'Hourly Rate' },
        pay_frequency: { type: 'SELECT', label: 'Pay Frequency', options: ['weekly', 'bi-weekly', 'monthly'] },
        start_date: { type: 'DATE', label: 'Start Date' },
        notice_period_days: { type: 'NUMBER', label: 'Notice Period (Days)' },
        job_duties: { type: 'TEXT', label: 'Job Duties' }
      },
      optionalFields: {},
      conditionalFields: {},
      jurisdiction: ['US'],
      language: 'en',
      tags: ['employment', 'part-time', 'hourly', 'simple'],
      industry: ['Retail', 'Hospitality', 'General'],
      createdById: systemUser.id,
      updatedById: systemUser.id
    }
  });

  // ========================================================================
  // OFFER LETTER TEMPLATES
  // ========================================================================

  console.log('📄 Creating Offer Letter templates...');

  await prisma.contractTemplate.create({
    data: {
      name: 'Job Offer Letter - Executive Level',
      description: 'Executive-level job offer letter with comprehensive compensation package including equity, relocation, and executive benefits.',
      contractType: ContractType.OFFER_LETTER,
      category: ContractCategory.EMPLOYMENT,
      isGlobal: true,
      isActive: true,
      version: 1,
      content: `{{company_name}}
{{company_address}}

{{offer_date}}

{{candidate_name}}
{{candidate_address}}

Dear {{candidate_name}},

We are delighted to offer you the position of {{job_title}} at {{company_name}}. We believe your skills and experience make you an excellent fit for our executive team.

POSITION DETAILS

Title: {{job_title}}
Department: {{department}}
Reports To: {{reports_to}}
Start Date: {{start_date}}
Location: {{work_location}}

COMPENSATION PACKAGE

Base Salary: ${{annual_salary}} per year, paid {{pay_frequency}}

Sign-On Bonus: {{#if has_signing_bonus}}${{signing_bonus}} payable on your first paycheck{{/if}}

Annual Bonus Target: {{bonus_target}}% of base salary, based on individual and company performance

Equity Compensation: {{#if has_equity}}{{equity_type}} - {{equity_amount}} {{equity_units}}, vesting over {{vesting_years}} years{{/if}}

BENEFITS

- Comprehensive health, dental, and vision insurance for you and your family
- {{pto_days}} days paid time off annually
- 401(k) with {{match_percentage}}% company match
- Life and disability insurance
- Executive perks: {{executive_perks}}

RELOCATION

{{#if has_relocation}}We will provide a relocation package of ${{relocation_amount}} to assist with your move to {{work_location}}.{{/if}}

EMPLOYMENT TERMS

This is an at-will employment position. You will be required to sign our standard Employment Agreement and Confidentiality & IP Assignment Agreement.

CONTINGENCIES

This offer is contingent upon:
- Satisfactory completion of background check
- Proof of eligibility to work in the United States
{{additional_contingencies}}

ACCEPTANCE

To accept this offer, please sign and return this letter by {{response_deadline}}. If you have any questions, please contact {{contact_person}} at {{contact_email}}.

We are excited about the prospect of you joining our team and look forward to your positive response.

Sincerely,

{{signatory_name}}
{{signatory_title}}


ACCEPTANCE

I accept the position of {{job_title}} with {{company_name}} under the terms outlined above.

Signature: _____________________________ Date: __________

Print Name: {{candidate_name}}`,
      structure: {
        sections: [
          { id: 's1', name: 'Position Details', order: 1, clauseIds: [] },
          { id: 's2', name: 'Compensation Package', order: 2, clauseIds: [] },
          { id: 's3', name: 'Benefits', order: 3, clauseIds: [] },
          { id: 's4', name: 'Terms and Contingencies', order: 4, clauseIds: [] }
        ]
      },
      requiredFields: {
        company_name: { type: 'TEXT', label: 'Company Name' },
        company_address: { type: 'TEXT', label: 'Company Address' },
        offer_date: { type: 'DATE', label: 'Offer Date' },
        candidate_name: { type: 'TEXT', label: 'Candidate Name' },
        candidate_address: { type: 'TEXT', label: 'Candidate Address' },
        job_title: { type: 'TEXT', label: 'Job Title' },
        department: { type: 'TEXT', label: 'Department' },
        reports_to: { type: 'TEXT', label: 'Reports To' },
        start_date: { type: 'DATE', label: 'Start Date' },
        work_location: { type: 'TEXT', label: 'Work Location' },
        annual_salary: { type: 'CURRENCY', label: 'Annual Salary' },
        pay_frequency: { type: 'SELECT', label: 'Pay Frequency', options: ['bi-weekly', 'semi-monthly', 'monthly'] },
        bonus_target: { type: 'PERCENTAGE', label: 'Bonus Target %' },
        pto_days: { type: 'NUMBER', label: 'PTO Days' },
        match_percentage: { type: 'PERCENTAGE', label: '401(k) Match %' },
        response_deadline: { type: 'DATE', label: 'Response Deadline' },
        contact_person: { type: 'TEXT', label: 'Contact Person' },
        contact_email: { type: 'TEXT', label: 'Contact Email' },
        signatory_name: { type: 'TEXT', label: 'Signatory Name' },
        signatory_title: { type: 'TEXT', label: 'Signatory Title' }
      },
      optionalFields: {
        has_signing_bonus: { type: 'BOOLEAN', label: 'Include Signing Bonus' },
        signing_bonus: { type: 'CURRENCY', label: 'Signing Bonus Amount' },
        has_equity: { type: 'BOOLEAN', label: 'Include Equity' },
        equity_type: { type: 'SELECT', label: 'Equity Type', options: ['Stock Options', 'RSUs', 'Restricted Stock'] },
        equity_amount: { type: 'NUMBER', label: 'Equity Amount' },
        equity_units: { type: 'TEXT', label: 'Equity Units' },
        vesting_years: { type: 'NUMBER', label: 'Vesting Years' },
        executive_perks: { type: 'TEXT', label: 'Executive Perks' },
        has_relocation: { type: 'BOOLEAN', label: 'Include Relocation' },
        relocation_amount: { type: 'CURRENCY', label: 'Relocation Amount' },
        additional_contingencies: { type: 'TEXT', label: 'Additional Contingencies' }
      },
      conditionalFields: {},
      jurisdiction: ['US'],
      language: 'en',
      tags: ['offer', 'executive', 'comprehensive', 'equity'],
      industry: ['Technology', 'Finance', 'Corporate'],
      createdById: systemUser.id,
      updatedById: systemUser.id
    }
  });

  await prisma.contractTemplate.create({
    data: {
      name: 'Job Offer Letter - Standard',
      description: 'Standard job offer letter for mid-level positions with typical benefits package.',
      contractType: ContractType.OFFER_LETTER,
      category: ContractCategory.EMPLOYMENT,
      isGlobal: true,
      isActive: true,
      version: 1,
      content: `{{company_name}}

{{offer_date}}

Dear {{candidate_name}},

We are pleased to offer you the position of {{job_title}} with {{company_name}}.

Position: {{job_title}}
Start Date: {{start_date}}
Salary: ${{annual_salary}} per year
Benefits: Health insurance, {{pto_days}} days PTO, 401(k)

This offer is contingent upon background check completion.

Please respond by {{response_deadline}}.

Sincerely,
{{hiring_manager}}

I accept: _____________________ Date: __________`,
      structure: {
        sections: [
          { id: 's1', name: 'Offer Details', order: 1, clauseIds: [] }
        ]
      },
      requiredFields: {
        company_name: { type: 'TEXT', label: 'Company Name' },
        offer_date: { type: 'DATE', label: 'Offer Date' },
        candidate_name: { type: 'TEXT', label: 'Candidate Name' },
        job_title: { type: 'TEXT', label: 'Job Title' },
        start_date: { type: 'DATE', label: 'Start Date' },
        annual_salary: { type: 'CURRENCY', label: 'Annual Salary' },
        pto_days: { type: 'NUMBER', label: 'PTO Days' },
        response_deadline: { type: 'DATE', label: 'Response Deadline' },
        hiring_manager: { type: 'TEXT', label: 'Hiring Manager Name' }
      },
      optionalFields: {},
      conditionalFields: {},
      jurisdiction: ['US'],
      language: 'en',
      tags: ['offer', 'standard', 'simple'],
      industry: ['General'],
      createdById: systemUser.id,
      updatedById: systemUser.id
    }
  });

  // ========================================================================
  // NDA TEMPLATES
  // ========================================================================

  console.log('📄 Creating NDA templates...');

  await prisma.contractTemplate.create({
    data: {
      name: 'Mutual Non-Disclosure Agreement',
      description: 'Mutual NDA for two parties sharing confidential information with each other.',
      contractType: ContractType.NDA,
      category: ContractCategory.LEGAL,
      isGlobal: true,
      isActive: true,
      version: 1,
      content: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of {{effective_date}}, by and between:

PARTY A: {{party_a_name}}, a {{party_a_type}} with principal place of business at {{party_a_address}}

PARTY B: {{party_b_name}}, a {{party_b_type}} with principal place of business at {{party_b_address}}

(each a "Party" and collectively the "Parties")

RECITALS

The Parties wish to explore a business relationship relating to: {{business_purpose}}

In connection with this relationship, each Party may disclose to the other certain confidential and proprietary information.

AGREEMENT

1. DEFINITION OF CONFIDENTIAL INFORMATION

"Confidential Information" means all information disclosed by either Party to the other Party, whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure, including but not limited to:

- Technical data, trade secrets, know-how, research, product plans, products, services, customers, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information
- Business information including pricing, costs, profits, markets, sales, and strategic plans
- Any other information marked as "Confidential" or "Proprietary"

2. EXCLUSIONS

Confidential Information shall not include information that:

a) Is or becomes publicly available through no breach of this Agreement
b) Was rightfully known to the receiving Party prior to disclosure
c) Is rightfully received by the receiving Party from a third party without breach of any confidentiality obligation
d) Is independently developed by the receiving Party without use of the Confidential Information

3. OBLIGATIONS

Each Party agrees to:

a) Hold the other Party's Confidential Information in strict confidence
b) Not disclose Confidential Information to any third parties without prior written consent
c) Not use Confidential Information for any purpose other than evaluating the business relationship
d) Limit access to Confidential Information to employees and contractors with a need to know
e) Protect Confidential Information with at least the same degree of care used to protect its own confidential information, but in no case less than reasonable care

4. TERM

This Agreement shall remain in effect for {{term_years}} years from the Effective Date. The confidentiality obligations shall survive termination for an additional {{survival_years}} years.

5. RETURN OF MATERIALS

Upon termination or at any time upon request, each Party shall promptly return or destroy all Confidential Information and certify in writing that all such materials have been returned or destroyed.

6. NO LICENSE

Nothing in this Agreement grants any license or rights in any intellectual property.

7. REMEDIES

Each Party acknowledges that breach of this Agreement may cause irreparable harm for which monetary damages may be inadequate, and agrees that the non-breaching Party shall be entitled to seek equitable relief, including injunction and specific performance.

8. GOVERNING LAW

This Agreement shall be governed by the laws of {{governing_law}}.

9. ENTIRE AGREEMENT

This Agreement constitutes the entire agreement between the Parties concerning confidentiality and supersedes all prior agreements.

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first written above.

PARTY A: {{party_a_name}}

By: _______________________
Name: {{party_a_signatory}}
Title: {{party_a_title}}
Date: __________

PARTY B: {{party_b_name}}

By: _______________________
Name: {{party_b_signatory}}
Title: {{party_b_title}}
Date: __________`,
      structure: {
        sections: [
          { id: 's1', name: 'Definitions', order: 1, clauseIds: [] },
          { id: 's2', name: 'Obligations', order: 2, clauseIds: [] },
          { id: 's3', name: 'Term and Termination', order: 3, clauseIds: [] },
          { id: 's4', name: 'General Provisions', order: 4, clauseIds: [] }
        ]
      },
      requiredFields: {
        effective_date: { type: 'DATE', label: 'Effective Date' },
        party_a_name: { type: 'TEXT', label: 'Party A Name' },
        party_a_type: { type: 'TEXT', label: 'Party A Entity Type' },
        party_a_address: { type: 'TEXT', label: 'Party A Address' },
        party_b_name: { type: 'TEXT', label: 'Party B Name' },
        party_b_type: { type: 'TEXT', label: 'Party B Entity Type' },
        party_b_address: { type: 'TEXT', label: 'Party B Address' },
        business_purpose: { type: 'TEXT', label: 'Purpose of Relationship' },
        term_years: { type: 'NUMBER', label: 'Agreement Term (Years)' },
        survival_years: { type: 'NUMBER', label: 'Survival Period (Years)' },
        governing_law: { type: 'TEXT', label: 'Governing Law' },
        party_a_signatory: { type: 'TEXT', label: 'Party A Signatory Name' },
        party_a_title: { type: 'TEXT', label: 'Party A Signatory Title' },
        party_b_signatory: { type: 'TEXT', label: 'Party B Signatory Name' },
        party_b_title: { type: 'TEXT', label: 'Party B Signatory Title' }
      },
      optionalFields: {},
      conditionalFields: {},
      jurisdiction: ['US', 'UK', 'EU'],
      governingLaw: 'State of Delaware',
      language: 'en',
      tags: ['nda', 'mutual', 'confidentiality', 'two-way'],
      industry: ['Technology', 'Business', 'General'],
      createdById: systemUser.id,
      updatedById: systemUser.id
    }
  });

  await prisma.contractTemplate.create({
    data: {
      name: 'Unilateral Non-Disclosure Agreement',
      description: 'One-way NDA where only one party discloses confidential information.',
      contractType: ContractType.NDA,
      category: ContractCategory.LEGAL,
      isGlobal: true,
      isActive: true,
      version: 1,
      content: `UNILATERAL NON-DISCLOSURE AGREEMENT

This Agreement is made on {{effective_date}}, between:

DISCLOSING PARTY: {{discloser_name}}
RECEIVING PARTY: {{recipient_name}}

Purpose: {{purpose}}

1. The Receiving Party agrees to hold all Confidential Information disclosed by the Disclosing Party in strict confidence.

2. The Receiving Party shall not disclose, copy, or use such information except for the stated purpose.

3. This obligation shall continue for {{term_years}} years.

4. Governed by the laws of {{governing_law}}.

DISCLOSING PARTY: ___________________ Date: ___________

RECEIVING PARTY: ___________________ Date: ___________`,
      structure: {
        sections: [
          { id: 's1', name: 'Agreement', order: 1, clauseIds: [] }
        ]
      },
      requiredFields: {
        effective_date: { type: 'DATE', label: 'Effective Date' },
        discloser_name: { type: 'TEXT', label: 'Disclosing Party Name' },
        recipient_name: { type: 'TEXT', label: 'Receiving Party Name' },
        purpose: { type: 'TEXT', label: 'Purpose' },
        term_years: { type: 'NUMBER', label: 'Term (Years)' },
        governing_law: { type: 'TEXT', label: 'Governing Law' }
      },
      optionalFields: {},
      conditionalFields: {},
      jurisdiction: ['US'],
      language: 'en',
      tags: ['nda', 'unilateral', 'one-way', 'simple'],
      industry: ['General'],
      createdById: systemUser.id,
      updatedById: systemUser.id
    }
  });

  // ========================================================================
  // VENDOR/SERVICE AGREEMENT TEMPLATES
  // ========================================================================

  console.log('📄 Creating Vendor/Service Agreement templates...');

  await prisma.contractTemplate.create({
    data: {
      name: 'Master Services Agreement (MSA)',
      description: 'Comprehensive MSA for ongoing service relationships with scope of work, payment terms, and liability provisions.',
      contractType: ContractType.VENDOR_SERVICE,
      category: ContractCategory.VENDOR_SUPPLIER,
      isGlobal: true,
      isActive: true,
      version: 1,
      content: `MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into as of {{effective_date}}, by and between:

CLIENT: {{client_name}}, a {{client_type}} with principal place of business at {{client_address}}

SERVICE PROVIDER: {{provider_name}}, a {{provider_type}} with principal place of business at {{provider_address}}

1. SERVICES

1.1 Scope: The Service Provider shall provide the following services ("Services"):
{{service_description}}

1.2 Service Level: Services shall be performed in accordance with the Service Level Agreement attached as Exhibit A.

1.3 Statements of Work: Specific projects shall be defined in individual Statements of Work ("SOWs") which shall reference this Agreement.

2. TERM AND TERMINATION

2.1 Term: This Agreement shall commence on {{effective_date}} and continue for {{initial_term_months}} months.

2.2 Renewal: This Agreement shall automatically renew for successive {{renewal_term_months}}-month periods unless either party provides {{termination_notice_days}} days written notice.

2.3 Termination for Convenience: Either party may terminate this Agreement for convenience with {{termination_notice_days}} days written notice.

2.4 Termination for Cause: Either party may terminate immediately upon written notice if the other party materially breaches this Agreement and fails to cure within {{cure_period_days}} days.

3. FEES AND PAYMENT

3.1 Fees: Client shall pay Service Provider according to the fee schedule:
{{fee_structure}}

3.2 Expenses: {{#if reimburse_expenses}}Client shall reimburse pre-approved expenses with proper documentation.{{/if}}

3.3 Payment Terms: Invoices are due within {{payment_terms_days}} days of invoice date.

3.4 Late Payment: Late payments shall accrue interest at {{late_fee_percentage}}% per month.

4. INTELLECTUAL PROPERTY

4.1 Pre-Existing IP: Each party retains all rights to its pre-existing intellectual property.

4.2 Work Product: {{ip_ownership_type}}
{{#if client_owns_ip}}All work product created under this Agreement shall be owned exclusively by Client as "work made for hire."{{/if}}
{{#if provider_owns_ip}}Service Provider retains ownership of all work product, and grants Client a non-exclusive license to use deliverables.{{/if}}

5. CONFIDENTIALITY

5.1 Each party agrees to maintain the confidentiality of the other party's Confidential Information.

5.2 Confidentiality obligations shall survive termination for {{confidentiality_years}} years.

6. WARRANTIES

6.1 Service Provider warrants that:
   a) Services will be performed in a professional and workmanlike manner
   b) Services will comply with applicable laws and regulations
   c) It has the right and authority to enter into this Agreement

6.2 Warranty Period: {{warranty_period_days}} days from delivery.

7. LIMITATION OF LIABILITY

7.1 EXCEPT FOR BREACHES OF CONFIDENTIALITY OR INDEMNIFICATION OBLIGATIONS, NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

7.2 Maximum Liability: Each party's maximum liability shall not exceed {{liability_cap_type}}.
{{#if liability_cap_amount}}${{liability_cap_amount}}{{/if}}
{{#if liability_cap_fees}}The fees paid in the {{liability_cap_period}} preceding the claim{{/if}}

8. INDEMNIFICATION

8.1 Service Provider shall indemnify Client against claims arising from:
   a) Service Provider's negligence or willful misconduct
   b) Infringement of third-party intellectual property rights
   c) Violation of applicable laws

8.2 Client shall indemnify Service Provider against claims arising from Client's use of deliverables in a manner not authorized by this Agreement.

9. INSURANCE

Service Provider shall maintain the following insurance:
- General Liability: ${{general_liability_amount}}
- Professional Liability: ${{professional_liability_amount}}
{{#if cyber_insurance}}
- Cyber Liability: ${{cyber_liability_amount}}
{{/if}}

10. INDEPENDENT CONTRACTOR

Service Provider is an independent contractor, not an employee or agent of Client.

11. GOVERNING LAW AND DISPUTE RESOLUTION

11.1 Governing Law: {{governing_law}}

11.2 Dispute Resolution: {{dispute_resolution_method}}
{{#if arbitration}}Disputes shall be resolved through binding arbitration in {{arbitration_location}}.{{/if}}
{{#if litigation}}Disputes shall be resolved in the courts of {{litigation_venue}}.{{/if}}

12. GENERAL PROVISIONS

12.1 Entire Agreement: This Agreement constitutes the entire agreement between the parties.

12.2 Amendments: This Agreement may only be amended in writing signed by both parties.

12.3 Assignment: Neither party may assign this Agreement without the other party's written consent.

12.4 Notices: All notices shall be sent to the addresses listed above.

IN WITNESS WHEREOF, the parties have executed this Agreement.

CLIENT: {{client_name}}

By: _______________________
Name: {{client_signatory}}
Title: {{client_title}}
Date: __________

SERVICE PROVIDER: {{provider_name}}

By: _______________________
Name: {{provider_signatory}}
Title: {{provider_title}}
Date: __________`,
      structure: {
        sections: [
          { id: 's1', name: 'Services', order: 1, clauseIds: [] },
          { id: 's2', name: 'Term and Termination', order: 2, clauseIds: [] },
          { id: 's3', name: 'Fees and Payment', order: 3, clauseIds: [] },
          { id: 's4', name: 'Intellectual Property', order: 4, clauseIds: [] },
          { id: 's5', name: 'Warranties and Liability', order: 5, clauseIds: [] },
          { id: 's6', name: 'General Provisions', order: 6, clauseIds: [] }
        ]
      },
      requiredFields: {
        effective_date: { type: 'DATE', label: 'Effective Date' },
        client_name: { type: 'TEXT', label: 'Client Name' },
        client_type: { type: 'TEXT', label: 'Client Entity Type' },
        client_address: { type: 'TEXT', label: 'Client Address' },
        provider_name: { type: 'TEXT', label: 'Provider Name' },
        provider_type: { type: 'TEXT', label: 'Provider Entity Type' },
        provider_address: { type: 'TEXT', label: 'Provider Address' },
        service_description: { type: 'TEXT', label: 'Service Description' },
        initial_term_months: { type: 'NUMBER', label: 'Initial Term (Months)' },
        renewal_term_months: { type: 'NUMBER', label: 'Renewal Term (Months)' },
        termination_notice_days: { type: 'NUMBER', label: 'Termination Notice (Days)' },
        cure_period_days: { type: 'NUMBER', label: 'Cure Period (Days)' },
        fee_structure: { type: 'TEXT', label: 'Fee Structure' },
        payment_terms_days: { type: 'NUMBER', label: 'Payment Terms (Days)' },
        late_fee_percentage: { type: 'PERCENTAGE', label: 'Late Fee %' },
        confidentiality_years: { type: 'NUMBER', label: 'Confidentiality Period (Years)' },
        warranty_period_days: { type: 'NUMBER', label: 'Warranty Period (Days)' },
        general_liability_amount: { type: 'CURRENCY', label: 'General Liability Insurance' },
        professional_liability_amount: { type: 'CURRENCY', label: 'Professional Liability Insurance' },
        governing_law: { type: 'TEXT', label: 'Governing Law' },
        dispute_resolution_method: { type: 'SELECT', label: 'Dispute Resolution', options: ['Arbitration', 'Litigation'] },
        client_signatory: { type: 'TEXT', label: 'Client Signatory' },
        client_title: { type: 'TEXT', label: 'Client Title' },
        provider_signatory: { type: 'TEXT', label: 'Provider Signatory' },
        provider_title: { type: 'TEXT', label: 'Provider Title' }
      },
      optionalFields: {
        reimburse_expenses: { type: 'BOOLEAN', label: 'Reimburse Expenses' },
        ip_ownership_type: { type: 'SELECT', label: 'IP Ownership', options: ['Client Owns', 'Provider Owns'] },
        client_owns_ip: { type: 'BOOLEAN', label: 'Client Owns IP' },
        provider_owns_ip: { type: 'BOOLEAN', label: 'Provider Owns IP' },
        liability_cap_type: { type: 'SELECT', label: 'Liability Cap Type', options: ['Fixed Amount', 'Fees Based'] },
        liability_cap_amount: { type: 'CURRENCY', label: 'Liability Cap Amount' },
        liability_cap_fees: { type: 'BOOLEAN', label: 'Cap Based on Fees' },
        liability_cap_period: { type: 'SELECT', label: 'Fee Period', options: ['12 months', '6 months', '3 months'] },
        cyber_insurance: { type: 'BOOLEAN', label: 'Require Cyber Insurance' },
        cyber_liability_amount: { type: 'CURRENCY', label: 'Cyber Liability Amount' },
        arbitration: { type: 'BOOLEAN', label: 'Use Arbitration' },
        arbitration_location: { type: 'TEXT', label: 'Arbitration Location' },
        litigation: { type: 'BOOLEAN', label: 'Use Litigation' },
        litigation_venue: { type: 'TEXT', label: 'Litigation Venue' }
      },
      conditionalFields: {},
      jurisdiction: ['US'],
      governingLaw: 'State of New York',
      language: 'en',
      tags: ['msa', 'services', 'vendor', 'comprehensive'],
      industry: ['Technology', 'Professional Services', 'Business'],
      createdById: systemUser.id,
      updatedById: systemUser.id
    }
  });

  // ========================================================================
  // CONSULTING AGREEMENT TEMPLATES
  // ========================================================================

  console.log('📄 Creating Consulting Agreement templates...');

  await prisma.contractTemplate.create({
    data: {
      name: 'Independent Contractor Consulting Agreement',
      description: 'Comprehensive agreement for independent consultants including scope, deliverables, and IP assignment.',
      contractType: ContractType.CONSULTING,
      category: ContractCategory.PROFESSIONAL_SERVICES,
      isGlobal: true,
      isActive: true,
      version: 1,
      content: `INDEPENDENT CONTRACTOR CONSULTING AGREEMENT

This Consulting Agreement ("Agreement") is entered into as of {{effective_date}}, by and between:

COMPANY: {{company_name}}, located at {{company_address}}

CONSULTANT: {{consultant_name}}, located at {{consultant_address}}

1. SERVICES

1.1 The Consultant agrees to provide the following services:
{{scope_of_work}}

1.2 Deliverables:
{{deliverables}}

1.3 Time Commitment: {{#if hours_specified}}Approximately {{hours_per_week}} hours per week{{/if}}

2. TERM

This Agreement shall begin on {{start_date}} and continue {{#if fixed_term}}until {{end_date}}{{/if}}{{#if ongoing}}on an ongoing basis until terminated by either party with {{notice_days}} days notice{{/if}}.

3. COMPENSATION

3.1 Rate: The Company shall pay Consultant:
{{compensation_structure}}

3.2 Expenses: {{#if reimburse_expenses}}Company shall reimburse pre-approved business expenses with receipts{{/if}}

3.3 Payment Schedule: Invoices due within {{payment_days}} days

3.4 Taxes: Consultant is responsible for all taxes as an independent contractor and will receive a 1099 form.

4. INDEPENDENT CONTRACTOR STATUS

4.1 Consultant is an independent contractor, not an employee.

4.2 Consultant is responsible for own taxes, insurance, and benefits.

4.3 Consultant may work for other clients unless prohibited below.

4.4 Exclusivity: {{#if is_exclusive}}Consultant agrees not to work for competitors during the term{{/if}}{{#if not_exclusive}}Consultant may work for other clients{{/if}}

5. INTELLECTUAL PROPERTY

5.1 All work product, inventions, and intellectual property created by Consultant for Company shall be owned exclusively by Company.

5.2 Consultant hereby assigns all rights, title, and interest in such work to Company.

6. CONFIDENTIALITY

Consultant agrees to keep all Company confidential information strictly confidential during and after the term of this Agreement.

7. NON-SOLICITATION

{{#if has_non_solicit}}For {{non_solicit_months}} months after termination, Consultant shall not solicit Company employees or clients.{{/if}}

8. LIABILITY AND INDEMNIFICATION

8.1 Consultant shall indemnify Company against claims arising from Consultant's negligence or breach of this Agreement.

8.2 Maximum liability is limited to {{liability_amount}}.

9. TERMINATION

9.1 Either party may terminate for convenience with {{notice_days}} days notice.

9.2 Either party may terminate immediately for material breach.

10. GENERAL PROVISIONS

10.1 Governing Law: {{governing_law}}

10.2 Entire Agreement: This Agreement constitutes the entire agreement between the parties.

10.3 Amendments must be in writing and signed by both parties.

COMPANY: {{company_name}}

By: _______________________
Name: {{company_signatory}}
Title: {{company_title}}
Date: __________

CONSULTANT: {{consultant_name}}

Signature: _______________________
Date: __________

Tax ID/SSN: _______________________`,
      structure: {
        sections: [
          { id: 's1', name: 'Services and Deliverables', order: 1, clauseIds: [] },
          { id: 's2', name: 'Compensation', order: 2, clauseIds: [] },
          { id: 's3', name: 'Independent Contractor Status', order: 3, clauseIds: [] },
          { id: 's4', name: 'IP and Confidentiality', order: 4, clauseIds: [] },
          { id: 's5', name: 'Termination', order: 5, clauseIds: [] }
        ]
      },
      requiredFields: {
        effective_date: { type: 'DATE', label: 'Effective Date' },
        company_name: { type: 'TEXT', label: 'Company Name' },
        company_address: { type: 'TEXT', label: 'Company Address' },
        consultant_name: { type: 'TEXT', label: 'Consultant Name' },
        consultant_address: { type: 'TEXT', label: 'Consultant Address' },
        scope_of_work: { type: 'TEXT', label: 'Scope of Work' },
        deliverables: { type: 'TEXT', label: 'Deliverables' },
        compensation_structure: { type: 'TEXT', label: 'Compensation Structure' },
        payment_days: { type: 'NUMBER', label: 'Payment Terms (Days)' },
        notice_days: { type: 'NUMBER', label: 'Notice Period (Days)' },
        liability_amount: { type: 'CURRENCY', label: 'Liability Limit' },
        governing_law: { type: 'TEXT', label: 'Governing Law' },
        company_signatory: { type: 'TEXT', label: 'Company Signatory' },
        company_title: { type: 'TEXT', label: 'Signatory Title' }
      },
      optionalFields: {
        hours_specified: { type: 'BOOLEAN', label: 'Specify Hours' },
        hours_per_week: { type: 'NUMBER', label: 'Hours per Week' },
        fixed_term: { type: 'BOOLEAN', label: 'Fixed Term' },
        end_date: { type: 'DATE', label: 'End Date' },
        ongoing: { type: 'BOOLEAN', label: 'Ongoing Term' },
        start_date: { type: 'DATE', label: 'Start Date' },
        reimburse_expenses: { type: 'BOOLEAN', label: 'Reimburse Expenses' },
        is_exclusive: { type: 'BOOLEAN', label: 'Exclusive Agreement' },
        not_exclusive: { type: 'BOOLEAN', label: 'Non-Exclusive' },
        has_non_solicit: { type: 'BOOLEAN', label: 'Include Non-Solicitation' },
        non_solicit_months: { type: 'NUMBER', label: 'Non-Solicit Period (Months)' }
      },
      conditionalFields: {},
      jurisdiction: ['US'],
      language: 'en',
      tags: ['consulting', 'independent contractor', '1099', 'freelance'],
      industry: ['Technology', 'Professional Services', 'Business'],
      createdById: systemUser.id,
      updatedById: systemUser.id
    }
  });

  console.log('✅ Created 8 contract templates');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
