# Proposal Platform Backend

Secure proposal sharing platform backend built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- User authentication with JWT and MFA support
- Multi-tenant organization management with RBAC
- Proposal document management
- Comprehensive audit logging
- Rate limiting and security middleware

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure `.env` with your database and other credentials

4. Set up database:
```bash
npm run migrate
```

5. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/mfa/setup` - Setup MFA
- `POST /api/auth/mfa/verify` - Verify and enable MFA

### Organizations
- `GET /api/organizations` - Get user's organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/:id` - Get organization details
- `POST /api/organizations/:id/members` - Invite member
- `DELETE /api/organizations/:id/members/:memberId` - Remove member
- `PATCH /api/organizations/:id/members/:memberId/role` - Update member role

### Proposals
- Coming soon

## Security Features

- Bcrypt password hashing (12 rounds)
- JWT with short expiration (15 minutes)
- Refresh token rotation
- TOTP-based MFA
- Rate limiting on auth endpoints
- Helmet security headers
- CORS configuration
- Comprehensive audit logging

## Development

```bash
# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma Studio (database GUI)
npm run studio
```

## Database Schema

See `prisma/schema.prisma` for complete database schema including:
- Users with MFA support
- Organizations with multi-tenancy
- Proposals and versions
- Comments and discussions
- Digital signatures
- Audit logs
- Notifications

## Environment Variables

See `.env.example` for all required environment variables.
