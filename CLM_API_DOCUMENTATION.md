# Contract Lifecycle Management API Documentation

## Phase 1: Template & Contract Management APIs

This document provides comprehensive documentation for the CLM (Contract Lifecycle Management) platform's Template and Contract APIs.

---

## Table of Contents

- [Authentication](#authentication)
- [Template API](#template-api)
- [Contract API](#contract-api)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Authentication

All API endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Template API

Base URL: `/api/templates`

### List Templates

Get all templates accessible to the user (global templates + organization templates).

**Endpoint:** `GET /api/templates`

**Query Parameters:**
- `contractType` (optional): Filter by contract type (EMPLOYMENT, NDA, VENDOR_SERVICE, etc.)
- `category` (optional): Filter by category (EMPLOYMENT, LEGAL, VENDOR_SUPPLIER, etc.)
- `organizationId` (optional): Filter by organization
- `isGlobal` (optional): Filter global templates (true/false)
- `search` (optional): Search in name and description
- `tags` (optional): Filter by tags (can be multiple)
- `industry` (optional): Filter by industry (can be multiple)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "template_123",
      "name": "Full-Time Employment Agreement - Tech Industry",
      "description": "Comprehensive full-time employment agreement...",
      "contractType": "EMPLOYMENT",
      "category": "EMPLOYMENT",
      "isGlobal": true,
      "isActive": true,
      "version": 1,
      "usageCount": 45,
      "tags": ["employment", "full-time", "tech"],
      "industry": ["Technology", "Software"],
      "createdAt": "2025-01-15T10:00:00Z",
      "creator": {
        "id": "user_123",
        "email": "admin@company.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "count": 1
}
```

### Get Template

Get a specific template by ID.

**Endpoint:** `GET /api/templates/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_123",
    "name": "Full-Time Employment Agreement - Tech Industry",
    "description": "Comprehensive full-time employment agreement...",
    "contractType": "EMPLOYMENT",
    "category": "EMPLOYMENT",
    "content": "EMPLOYMENT AGREEMENT\n\nThis Employment Agreement...",
    "structure": {
      "sections": [
        {
          "id": "s1",
          "name": "Position and Duties",
          "order": 1,
          "clauseIds": []
        }
      ]
    },
    "requiredFields": {
      "company_name": {
        "type": "TEXT",
        "label": "Company Name"
      },
      "employee_name": {
        "type": "TEXT",
        "label": "Employee Name"
      }
    },
    "optionalFields": {
      "has_bonus": {
        "type": "BOOLEAN",
        "label": "Include Bonus Clause"
      }
    },
    "clauses": [
      {
        "id": "clause_1",
        "name": "Confidentiality",
        "category": "CONFIDENTIALITY",
        "content": "The Employee agrees...",
        "position": 1,
        "riskLevel": "MEDIUM",
        "favorability": "NEUTRAL"
      }
    ],
    "jurisdiction": ["US"],
    "governingLaw": "State of California",
    "language": "en",
    "isGlobal": true,
    "usageCount": 45
  }
}
```

### Create Template

Create a new contract template.

**Endpoint:** `POST /api/templates`

**Request Body:**
```json
{
  "name": "Vendor Service Agreement - SaaS",
  "description": "Service agreement for SaaS vendors",
  "contractType": "VENDOR_SERVICE",
  "category": "VENDOR_SUPPLIER",
  "organizationId": "org_123",
  "isGlobal": false,
  "content": "VENDOR SERVICE AGREEMENT\n\n{{company_name}} agrees...",
  "structure": {
    "sections": [
      {
        "id": "s1",
        "name": "Services",
        "order": 1,
        "clauseIds": []
      }
    ]
  },
  "requiredFields": {
    "company_name": {
      "type": "TEXT",
      "label": "Company Name"
    },
    "vendor_name": {
      "type": "TEXT",
      "label": "Vendor Name"
    },
    "service_description": {
      "type": "TEXT",
      "label": "Service Description"
    }
  },
  "optionalFields": {
    "has_sla": {
      "type": "BOOLEAN",
      "label": "Include SLA"
    }
  },
  "clauses": [
    {
      "name": "Service Level Agreement",
      "category": "SCOPE_OF_WORK",
      "content": "Vendor shall provide...",
      "riskLevel": "MEDIUM",
      "favorability": "NEUTRAL"
    }
  ],
  "jurisdiction": ["US"],
  "governingLaw": "State of Delaware",
  "tags": ["vendor", "saas", "service"],
  "industry": ["Technology"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_456",
    "name": "Vendor Service Agreement - SaaS",
    "version": 1,
    "createdAt": "2025-01-16T10:00:00Z"
  }
}
```

### Update Template

Update an existing template.

**Endpoint:** `PATCH /api/templates/:id`

**Request Body:** Same as create, all fields optional

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_456",
    "name": "Updated Template Name",
    "updatedAt": "2025-01-16T11:00:00Z"
  }
}
```

### Delete Template

Delete a template (only if not in use).

**Endpoint:** `DELETE /api/templates/:id`

**Response:**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

### Clone Template

Create a copy of an existing template.

**Endpoint:** `POST /api/templates/:id/clone`

**Request Body:**
```json
{
  "name": "Cloned Template Name",
  "organizationId": "org_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_789",
    "name": "Cloned Template Name"
  }
}
```

### Create Template Version

Create a new version of a template.

**Endpoint:** `POST /api/templates/:id/version`

**Request Body:**
```json
{
  "name": "Template Name v2",
  "content": "Updated content...",
  "changes": "Updated compensation section"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_790",
    "version": 2,
    "parentTemplateId": "template_456"
  }
}
```

### Preview Template

Preview a template with sample field values.

**Endpoint:** `POST /api/templates/:id/preview`

**Request Body:**
```json
{
  "fieldValues": {
    "company_name": "Acme Corporation",
    "employee_name": "John Smith",
    "job_title": "Software Engineer",
    "annual_salary": "$120,000",
    "start_date": "2025-02-01",
    "has_bonus": true,
    "bonus_percentage": "15"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "preview": "EMPLOYMENT AGREEMENT\n\nThis Employment Agreement is entered into on February 1, 2025, by and between:\n\nEMPLOYER: Acme Corporation\nEMPLOYEE: John Smith\n\n1. POSITION: Software Engineer\n2. SALARY: $120,000 per year\n3. BONUS: Up to 15% of base salary..."
  }
}
```

### Get Template Usage Stats

Get usage statistics for a template.

**Endpoint:** `GET /api/templates/:id/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "templateId": "template_123",
    "usageCount": 45,
    "lastUsed": "2025-01-15T14:30:00Z",
    "contractsByStatus": {
      "DRAFT": 5,
      "ACTIVE": 35,
      "EXPIRED": 5
    },
    "averageCompletionTime": "2.5 days",
    "popularFields": {
      "job_title": ["Software Engineer", "Product Manager"],
      "annual_salary": ["$120,000", "$150,000"]
    }
  }
}
```

---

## Contract API

Base URL: `/api/contracts`

### Create Contract from Template

Create a new contract using a template.

**Endpoint:** `POST /api/contracts/from-template`

**Request Body:**
```json
{
  "templateId": "template_123",
  "organizationId": "org_123",
  "title": "Employment Agreement - John Smith",
  "description": "Full-time employment for Software Engineer position",
  "contractType": "EMPLOYMENT",
  "category": "EMPLOYMENT",
  "fieldValues": {
    "company_name": "Acme Corporation",
    "company_type": "Corporation",
    "company_address": "123 Tech Street, San Francisco, CA 94105",
    "employee_name": "John Smith",
    "employee_address": "456 Main St, San Francisco, CA 94110",
    "employee_email": "john.smith@email.com",
    "job_title": "Software Engineer",
    "job_responsibilities": "Develop and maintain software applications",
    "supervisor_title": "Engineering Manager",
    "annual_salary": "$120,000",
    "start_date": "2025-02-01",
    "notice_period_days": "30",
    "governing_law": "State of California",
    "company_representative": "Jane Doe",
    "representative_title": "CEO",
    "has_bonus": true,
    "bonus_percentage": "15"
  },
  "contractValue": 120000,
  "currency": "USD",
  "effectiveDate": "2025-02-01T00:00:00Z",
  "expirationDate": "2026-02-01T00:00:00Z",
  "counterparties": [
    {
      "name": "John Smith",
      "role": "EMPLOYEE",
      "type": "INDIVIDUAL",
      "email": "john.smith@email.com",
      "phone": "+1-555-0123",
      "address": "456 Main St, San Francisco, CA 94110"
    }
  ],
  "obligations": [
    {
      "title": "Complete onboarding",
      "description": "Complete all onboarding tasks and training",
      "type": "COMPLIANCE",
      "responsibleParty": "COUNTERPARTY",
      "dueDate": "2025-02-15T00:00:00Z",
      "priority": "HIGH"
    }
  ],
  "tags": ["employment", "engineering", "full-time"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "contract_123",
    "title": "Employment Agreement - John Smith",
    "contractType": "EMPLOYMENT",
    "status": "DRAFT",
    "content": "EMPLOYMENT AGREEMENT\n\n[Populated content]",
    "templateId": "template_123",
    "organizationId": "org_123",
    "creatorId": "user_123",
    "contractValue": 120000,
    "currency": "USD",
    "effectiveDate": "2025-02-01T00:00:00Z",
    "expirationDate": "2026-02-01T00:00:00Z",
    "counterparties": [
      {
        "id": "cp_123",
        "name": "John Smith",
        "role": "EMPLOYEE",
        "isPrimary": true
      }
    ],
    "createdAt": "2025-01-16T10:00:00Z"
  }
}
```

### Create Contract from Scratch

Create a new contract without using a template.

**Endpoint:** `POST /api/contracts`

**Request Body:**
```json
{
  "organizationId": "org_123",
  "title": "Custom Service Agreement",
  "description": "Custom agreement for special project",
  "content": "This Agreement is made on...",
  "contractType": "VENDOR_SERVICE",
  "category": "VENDOR_SUPPLIER",
  "contractValue": 50000,
  "currency": "USD",
  "effectiveDate": "2025-02-01T00:00:00Z",
  "expirationDate": "2025-08-01T00:00:00Z",
  "counterparties": [
    {
      "name": "XYZ Consulting",
      "role": "VENDOR",
      "type": "COMPANY",
      "email": "contact@xyz.com"
    }
  ]
}
```

**Response:** Same as create from template

### Get Contract

Get a specific contract by ID.

**Endpoint:** `GET /api/contracts/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "contract_123",
    "title": "Employment Agreement - John Smith",
    "description": "Full-time employment for Software Engineer position",
    "content": "[Full contract content]",
    "contractType": "EMPLOYMENT",
    "category": "EMPLOYMENT",
    "status": "ACTIVE",
    "templateId": "template_123",
    "templateFields": {
      "company_name": "Acme Corporation",
      "employee_name": "John Smith"
    },
    "organizationId": "org_123",
    "organization": {
      "id": "org_123",
      "name": "Acme Corporation"
    },
    "creatorId": "user_123",
    "creator": {
      "id": "user_123",
      "email": "admin@acme.com",
      "firstName": "Jane",
      "lastName": "Doe"
    },
    "contractValue": 120000,
    "currency": "USD",
    "effectiveDate": "2025-02-01T00:00:00Z",
    "expirationDate": "2026-02-01T00:00:00Z",
    "counterparties": [
      {
        "id": "cp_123",
        "name": "John Smith",
        "role": "EMPLOYEE",
        "type": "INDIVIDUAL",
        "email": "john.smith@email.com",
        "isPrimary": true,
        "status": "ACTIVE"
      }
    ],
    "obligations": [
      {
        "id": "ob_123",
        "title": "Complete onboarding",
        "type": "COMPLIANCE",
        "status": "COMPLETED",
        "dueDate": "2025-02-15T00:00:00Z",
        "priority": "HIGH",
        "completedAt": "2025-02-10T00:00:00Z"
      }
    ],
    "milestones": [],
    "versions": [
      {
        "id": "ver_1",
        "version": 1,
        "createdAt": "2025-01-16T10:00:00Z",
        "createdBy": {
          "id": "user_123",
          "email": "admin@acme.com"
        }
      }
    ],
    "amendments": [],
    "_count": {
      "versions": 1,
      "obligations": 1,
      "milestones": 0,
      "amendments": 0
    },
    "createdAt": "2025-01-16T10:00:00Z",
    "updatedAt": "2025-02-10T00:00:00Z"
  }
}
```

### List Contracts

Get all contracts with filtering and pagination.

**Endpoint:** `GET /api/contracts`

**Query Parameters:**
- `organizationId` (optional): Filter by organization
- `contractType` (optional): Filter by type
- `category` (optional): Filter by category
- `status` (optional): Filter by status
- `search` (optional): Search in title and description
- `tags` (optional): Filter by tags
- `expiringInDays` (optional): Get contracts expiring in X days
- `effectiveDateFrom` (optional): Filter by effective date range start
- `effectiveDateTo` (optional): Filter by effective date range end
- `minValue` (optional): Minimum contract value
- `maxValue` (optional): Maximum contract value
- `counterpartyName` (optional): Filter by counterparty name
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "contract_123",
      "title": "Employment Agreement - John Smith",
      "contractType": "EMPLOYMENT",
      "status": "ACTIVE",
      "contractValue": 120000,
      "effectiveDate": "2025-02-01T00:00:00Z",
      "expirationDate": "2026-02-01T00:00:00Z",
      "organization": {
        "id": "org_123",
        "name": "Acme Corporation"
      },
      "creator": {
        "id": "user_123",
        "email": "admin@acme.com"
      },
      "counterparties": [
        {
          "id": "cp_123",
          "name": "John Smith",
          "role": "EMPLOYEE"
        }
      ],
      "_count": {
        "counterparties": 1,
        "obligations": 1,
        "milestones": 0,
        "versions": 1
      },
      "createdAt": "2025-01-16T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Update Contract

Update a contract.

**Endpoint:** `PATCH /api/contracts/:id`

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "PENDING_APPROVAL",
  "contractValue": 125000,
  "expirationDate": "2026-03-01T00:00:00Z",
  "tags": ["employment", "engineering", "full-time", "updated"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "contract_123",
    "title": "Updated Title",
    "status": "PENDING_APPROVAL",
    "updatedAt": "2025-01-17T10:00:00Z"
  }
}
```

### Delete Contract

Delete a contract (only DRAFT contracts).

**Endpoint:** `DELETE /api/contracts/:id`

**Response:**
```json
{
  "success": true,
  "message": "Contract deleted successfully"
}
```

### Archive Contract

Archive a contract.

**Endpoint:** `POST /api/contracts/:id/archive`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "contract_123",
    "status": "ARCHIVED"
  }
}
```

### Add Counterparty

Add a counterparty to a contract.

**Endpoint:** `POST /api/contracts/:id/counterparties`

**Request Body:**
```json
{
  "name": "ABC Company",
  "role": "VENDOR",
  "type": "COMPANY",
  "email": "contact@abc.com",
  "phone": "+1-555-0199",
  "address": "789 Business Ave, New York, NY 10001",
  "taxId": "12-3456789",
  "contactPerson": "Sarah Johnson",
  "contactEmail": "sarah@abc.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cp_456",
    "name": "ABC Company",
    "role": "VENDOR",
    "status": "ACTIVE"
  }
}
```

### Remove Counterparty

Remove a counterparty from a contract.

**Endpoint:** `DELETE /api/contracts/:id/counterparties/:counterpartyId`

**Response:**
```json
{
  "success": true,
  "message": "Counterparty removed successfully"
}
```

### Add Obligation

Add an obligation to a contract.

**Endpoint:** `POST /api/contracts/:id/obligations`

**Request Body:**
```json
{
  "title": "Monthly Payment",
  "description": "Pay monthly subscription fee",
  "type": "PAYMENT",
  "responsibleParty": "ORGANIZATION",
  "dueDate": "2025-03-01T00:00:00Z",
  "recurringSchedule": "MONTHLY",
  "priority": "HIGH",
  "alertDaysBefore": 7
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ob_456",
    "title": "Monthly Payment",
    "status": "PENDING",
    "dueDate": "2025-03-01T00:00:00Z"
  }
}
```

### Update Obligation Status

Update the status of an obligation.

**Endpoint:** `PATCH /api/contracts/obligations/:obligationId/status`

**Request Body:**
```json
{
  "status": "COMPLETED",
  "completionNotes": "Payment processed successfully"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ob_456",
    "status": "COMPLETED",
    "completedAt": "2025-03-01T10:00:00Z"
  }
}
```

### Add Milestone

Add a milestone to a contract.

**Endpoint:** `POST /api/contracts/:id/milestones`

**Request Body:**
```json
{
  "name": "Project Kickoff",
  "description": "Initial project meeting and setup",
  "dueDate": "2025-02-15T00:00:00Z",
  "completionCriteria": "Meeting completed and project plan approved",
  "paymentAmount": 10000,
  "dependencies": "Contract signing"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ms_123",
    "name": "Project Kickoff",
    "sequence": 1,
    "status": "PENDING"
  }
}
```

### Update Milestone Status

Update the status of a milestone.

**Endpoint:** `PATCH /api/contracts/milestones/:milestoneId/status`

**Request Body:**
```json
{
  "status": "COMPLETED",
  "completionNotes": "Kickoff meeting successful"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ms_123",
    "status": "COMPLETED",
    "completedAt": "2025-02-15T14:00:00Z"
  }
}
```

### Get Expiring Contracts

Get contracts expiring within specified days.

**Endpoint:** `GET /api/contracts/expiring`

**Query Parameters:**
- `daysAhead` (optional, default: 30): Number of days to look ahead

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "contract_789",
      "title": "Vendor Agreement - XYZ Corp",
      "expirationDate": "2025-02-28T00:00:00Z",
      "daysUntilExpiry": 12,
      "organization": {
        "id": "org_123",
        "name": "Acme Corporation"
      },
      "counterparties": [
        {
          "id": "cp_789",
          "name": "XYZ Corp"
        }
      ]
    }
  ],
  "count": 1
}
```

### Get Contract Statistics

Get dashboard statistics for contracts.

**Endpoint:** `GET /api/contracts/statistics`

**Query Parameters:**
- `organizationId` (optional): Filter by organization

**Response:**
```json
{
  "success": true,
  "data": {
    "totalContracts": 150,
    "activeContracts": 95,
    "expiringContracts": 12,
    "pendingApproval": 8,
    "pendingSignature": 5,
    "totalValue": 5250000,
    "contractsByType": [
      {
        "contractType": "EMPLOYMENT",
        "_count": 45
      },
      {
        "contractType": "VENDOR_SERVICE",
        "_count": 35
      },
      {
        "contractType": "NDA",
        "_count": 30
      }
    ],
    "contractsByStatus": [
      {
        "status": "ACTIVE",
        "_count": 95
      },
      {
        "status": "DRAFT",
        "_count": 20
      },
      {
        "status": "PENDING_APPROVAL",
        "_count": 8
      }
    ]
  }
}
```

---

## Data Models

### Contract Types

```typescript
enum ContractType {
  EMPLOYMENT
  OFFER_LETTER
  NDA
  VENDOR_SERVICE
  CONSULTING
  PARTNERSHIP
  SALES
  LEASE
  IP_LICENSE
  SUPPLY
  PROCUREMENT
  SUBSCRIPTION
  FREELANCE
  INTERNSHIP
  OTHER
}
```

### Contract Categories

```typescript
enum ContractCategory {
  EMPLOYMENT
  VENDOR_SUPPLIER
  SALES_REVENUE
  PARTNERSHIP
  LEGAL
  REAL_ESTATE
  INTELLECTUAL_PROPERTY
  PROFESSIONAL_SERVICES
  OTHER
}
```

### Contract Status

```typescript
enum ContractStatus {
  DRAFT
  PENDING_APPROVAL
  IN_REVIEW
  APPROVED
  PENDING_SIGNATURE
  PARTIALLY_SIGNED
  FULLY_EXECUTED
  ACTIVE
  EXPIRING_SOON
  EXPIRED
  RENEWED
  AMENDED
  TERMINATED
  ARCHIVED
  REJECTED
  CANCELLED
}
```

### Status Transition Rules

Valid status transitions:
- `DRAFT` → `PENDING_APPROVAL`, `CANCELLED`
- `PENDING_APPROVAL` → `IN_REVIEW`, `APPROVED`, `REJECTED`, `DRAFT`
- `IN_REVIEW` → `APPROVED`, `REJECTED`, `PENDING_APPROVAL`
- `APPROVED` → `PENDING_SIGNATURE`, `REJECTED`
- `PENDING_SIGNATURE` → `PARTIALLY_SIGNED`, `FULLY_EXECUTED`, `CANCELLED`
- `PARTIALLY_SIGNED` → `FULLY_EXECUTED`, `CANCELLED`
- `FULLY_EXECUTED` → `ACTIVE`
- `ACTIVE` → `EXPIRING_SOON`, `EXPIRED`, `RENEWED`, `AMENDED`, `TERMINATED`, `ARCHIVED`
- `EXPIRED` → `RENEWED`, `ARCHIVED`

### Counterparty Roles

```typescript
enum CounterpartyRole {
  EMPLOYEE
  EMPLOYER
  VENDOR
  CLIENT
  BUYER
  SELLER
  LESSOR
  LESSEE
  LICENSOR
  LICENSEE
  PARTNER
  CONSULTANT
  CONTRACTOR
  OTHER
}
```

### Obligation Types

```typescript
enum ObligationType {
  PAYMENT
  DELIVERY
  PERFORMANCE
  REPORTING
  COMPLIANCE
  INSURANCE
  WARRANTY
  MAINTENANCE
  RENEWAL_DECISION
  OTHER
}
```

### Field Types

```typescript
type FieldType =
  | 'TEXT'
  | 'NUMBER'
  | 'DATE'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'CURRENCY'
  | 'PERCENTAGE'
  | 'BOOLEAN'
  | 'FILE'
  | 'PARTY';
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200 OK`: Successful GET request
- `201 Created`: Successful POST request creating a resource
- `400 Bad Request`: Invalid request data or business logic error
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Authenticated but not authorized for this action
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Common Error Messages

**Authentication Errors:**
- `"Unauthorized"` - No auth token provided
- `"Invalid token"` - Token is invalid or expired

**Validation Errors:**
- `"Organization ID is required"`
- `"Missing required fields: <field_names>"`
- `"Invalid status transition from X to Y"`

**Business Logic Errors:**
- `"Template not found or access denied"`
- `"Contract not found or access denied"`
- `"Cannot remove primary counterparty"`
- `"Only draft contracts can be deleted"`
- `"Template is in use and cannot be deleted"`

---

## Examples

### Example 1: Creating an Employment Contract from Template

```bash
# 1. List available templates
curl -X GET "http://localhost:5000/api/templates?contractType=EMPLOYMENT" \
  -H "Authorization: Bearer <token>"

# 2. Preview the template
curl -X POST "http://localhost:5000/api/templates/template_123/preview" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fieldValues": {
      "company_name": "Acme Corp",
      "employee_name": "John Smith",
      "job_title": "Software Engineer",
      "annual_salary": "$120,000",
      "start_date": "2025-02-01"
    }
  }'

# 3. Create the contract
curl -X POST "http://localhost:5000/api/contracts/from-template" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "template_123",
    "organizationId": "org_123",
    "title": "Employment Agreement - John Smith",
    "contractType": "EMPLOYMENT",
    "category": "EMPLOYMENT",
    "fieldValues": {
      "company_name": "Acme Corp",
      "employee_name": "John Smith",
      "job_title": "Software Engineer",
      "annual_salary": "$120,000",
      "start_date": "2025-02-01"
    },
    "effectiveDate": "2025-02-01T00:00:00Z",
    "expirationDate": "2026-02-01T00:00:00Z"
  }'

# 4. Update contract status
curl -X PATCH "http://localhost:5000/api/contracts/contract_123" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PENDING_APPROVAL"
  }'
```

### Example 2: Managing Contract Obligations

```bash
# 1. Add an obligation
curl -X POST "http://localhost:5000/api/contracts/contract_123/obligations" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "First Month Payroll",
    "type": "PAYMENT",
    "responsibleParty": "ORGANIZATION",
    "dueDate": "2025-03-01T00:00:00Z",
    "priority": "HIGH"
  }'

# 2. Mark obligation as completed
curl -X PATCH "http://localhost:5000/api/contracts/obligations/ob_123/status" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "completionNotes": "Payroll processed on time"
  }'
```

### Example 3: Getting Expiring Contracts Dashboard

```bash
# Get contracts expiring in next 30 days
curl -X GET "http://localhost:5000/api/contracts/expiring?daysAhead=30" \
  -H "Authorization: Bearer <token>"

# Get overall statistics
curl -X GET "http://localhost:5000/api/contracts/statistics?organizationId=org_123" \
  -H "Authorization: Bearer <token>"
```

---

## Rate Limiting

API rate limits:
- Authenticated endpoints: 100 requests per minute per user
- Template preview: 20 requests per minute per user
- Public endpoints (if any): 20 requests per minute per IP

Rate limit headers included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642521600
```

---

## Pagination

List endpoints support pagination:
- Default page size: 20 items
- Maximum page size: 100 items
- Use `page` and `limit` query parameters

Example:
```
GET /api/contracts?page=2&limit=50
```

---

## Best Practices

1. **Always validate field values** before creating contracts from templates
2. **Use preview endpoint** to show users what the contract will look like
3. **Implement status transition validation** on the client side
4. **Cache template lists** when appropriate (they don't change frequently)
5. **Use filters and search** to improve performance for large datasets
6. **Monitor expiring contracts** regularly using the expiring endpoint
7. **Track obligations** to ensure compliance with contract terms
8. **Archive old contracts** to keep active lists manageable

---

## Support

For API support, please contact:
- Email: api-support@proposalapp.com
- Documentation: https://docs.proposalapp.com
- Status Page: https://status.proposalapp.com
