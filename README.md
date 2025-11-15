# Proposal Sharing Platform

Secure proposal sharing web platform where parties can send proposals to each other while maintaining document confidentiality. The platform allows parties to comment, discuss proposals, and sign contracts digitally, making deals authentic and certified for future legal implications.

## Features

### Security & Confidentiality
- End-to-end encryption for documents
- Multi-tenant architecture with data isolation
- Role-based access control (RBAC)
- Multi-factor authentication (MFA) with TOTP
- Comprehensive audit logging

### Collaboration
- Real-time commenting and discussions
- Document versioning and history
- @mentions and notifications
- Threaded comment replies
- Resolved/unresolved status tracking

### Digital Signatures
- Multiple signature types (Simple, Advanced, Qualified)
- Legal compliance (ESIGN Act, eIDAS)
- Tamper-proof audit trails
- Timestamped signatures with IP tracking

### Organization Management
- Multi-tenant organizations
- Member invitation system
- Role management (Owner, Admin, Editor, Commentator, Viewer)
- Organization-scoped permissions

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL with Prisma ORM
- JWT authentication
- Bcrypt password hashing
- Speakeasy for MFA (TOTP)

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Zustand for state management
- React Router v6
- Axios for API calls

## Project Structure

```
proposa_app/
├── backend/                 # Node.js backend
│   ├── prisma/             # Database schema
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── App.tsx
│   └── package.json
└── research.md            # Development research & roadmap
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:
```bash
npm run migrate
```

5. Start development server:
```bash
npm run dev
```

Backend runs on [http://localhost:5000](http://localhost:5000)

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Update REACT_APP_API_URL if needed
```

4. Start development server:
```bash
npm start
```

Frontend runs on [http://localhost:3000](http://localhost:3000)

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/mfa/setup` - Setup MFA
- `POST /api/auth/mfa/verify` - Verify MFA token

### Organization Endpoints
- `GET /api/organizations` - Get user's organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/:id` - Get organization details
- `POST /api/organizations/:id/members` - Invite member
- `DELETE /api/organizations/:id/members/:memberId` - Remove member
- `PATCH /api/organizations/:id/members/:memberId/role` - Update role

### Proposal Endpoints
(Coming soon)

## Security Features

- **Password Security**: Bcrypt with 12 salt rounds
- **JWT Tokens**: Short-lived access tokens (15 min), long-lived refresh tokens (7 days)
- **MFA**: TOTP-based two-factor authentication
- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Configured for frontend-backend communication
- **Helmet**: Security headers
- **Audit Logging**: Comprehensive activity tracking

## Database Schema

Key models:
- **User**: Authentication and profile data
- **Organization**: Multi-tenant organizations
- **OrganizationMember**: User-organization relationships with roles
- **Proposal**: Document proposals
- **ProposalVersion**: Version control
- **Comment**: Threaded discussions
- **Signature**: Digital signatures
- **AuditLog**: Activity tracking
- **Notification**: User notifications

See `backend/prisma/schema.prisma` for complete schema.

## Development Roadmap

### Phase 1: MVP (Completed)
- ✅ User authentication with MFA
- ✅ Organization management
- ✅ Basic RBAC
- ✅ Frontend setup with routing

### Phase 2: Enhanced Collaboration (In Progress)
- ⬜ Proposal CRUD operations
- ⬜ Document upload/storage
- ⬜ Commenting system
- ⬜ Real-time collaboration (WebSockets)
- ⬜ Version control

### Phase 3: Enterprise & Compliance
- ⬜ Digital signature integration
- ⬜ Advanced eSignature options
- ⬜ Blockchain notarization
- ⬜ SOC 2 compliance preparation
- ⬜ GDPR tools

### Phase 4: Scale & Advanced Features
- ⬜ AI-powered features
- ⬜ Mobile applications
- ⬜ CRM integrations
- ⬜ Advanced analytics

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions, please open an issue in the GitHub repository.
