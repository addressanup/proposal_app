# CLM Platform Frontend

Modern React frontend for the Contract Lifecycle Management (CLM) Platform.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Zustand** - State management (planned)
- **React Hook Form** - Form handling (planned)
- **Zod** - Schema validation (planned)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will be available at **http://localhost:3000**

### 3. Build for Production

```bash
npm run build
```

### 4. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── lib/
│   │   └── api.ts                  # ✅ Axios instance with auth
│   ├── services/
│   │   ├── template.service.ts     # ✅ Template API calls
│   │   └── contract.service.ts     # ✅ Contract API calls
│   ├── types/
│   │   ├── template.types.ts       # ✅ Template TypeScript types
│   │   └── contract.types.ts       # ✅ Contract TypeScript types
│   ├── App.tsx                     # ✅ Main app with routing
│   ├── main.tsx                    # ✅ React entry point
│   └── index.css                   # ✅ Tailwind styles
│
├── index.html                      # ✅ HTML entry point
├── package.json                    # ✅ Dependencies
├── vite.config.ts                  # ✅ Vite configuration
├── tsconfig.json                   # ✅ TypeScript configuration
├── tailwind.config.js              # ✅ Tailwind configuration
└── postcss.config.js               # (auto-created)
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend connects to the backend API at **http://localhost:5000**

### Proxy Configuration

Vite is configured to proxy `/api` requests to the backend:

```typescript
// vite.config.ts
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

### Authentication

All API requests automatically include the JWT token from localStorage:

```typescript
// lib/api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Current Status

### ✅ Completed

1. **Project Setup**
   - Vite + React + TypeScript configuration
   - Tailwind CSS with custom design system
   - Development server with API proxy

2. **API Services**
   - Template service with all CRUD operations
   - Contract service with full lifecycle management
   - Axios instance with authentication

3. **Type Safety**
   - Template types (15 contract types, enums)
   - Contract types (18 statuses, workflows)
   - Full TypeScript coverage

4. **Basic UI**
   - App component with routing
   - Layout with navigation
   - Placeholder pages (Dashboard, Templates, Contracts)
   - Login page

5. **Styling System**
   - Tailwind custom components (btn-primary, input, card)
   - Status badges (success, warning, error, info)
   - Responsive design utilities

### 🚧 To Be Implemented

1. **Authentication**
   - Zustand auth store
   - Login/logout functionality
   - Protected route guards
   - Token refresh logic

2. **Dashboard**
   - Real statistics from API
   - Expiring contracts widget
   - Recent activity feed
   - Contract type distribution chart

3. **Templates**
   - Template list with filters
   - Template detail view
   - Template creation form
   - Template preview modal
   - Clone functionality

4. **Contracts**
   - Contract list with filters
   - Contract detail view
   - Create contract wizard
   - Status management
   - Counterparty management
   - Obligation tracking
   - Milestone tracking

5. **UI Components**
   - Reusable button, input, select components
   - Modal dialog
   - Loading states
   - Empty states
   - Form validation

## Design System

### Colors

```javascript
primary: {
  500: '#3b82f6',  // Primary blue
  600: '#2563eb',  // Primary blue (hover)
  700: '#1d4ed8',  // Primary blue (active)
}
```

### Component Classes

```css
.btn-primary     /* Primary button */
.btn-secondary   /* Secondary button */
.input           /* Form input */
.card            /* Card container */
.badge-success   /* Green success badge */
.badge-warning   /* Yellow warning badge */
.badge-error     /* Red error badge */
.badge-info      /* Blue info badge */
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Access in code:

```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

## Development Workflow

### 1. Start Both Frontend and Backend

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 2. Seed Sample Data

```bash
cd backend
npm run seed
```

This creates 8 professional contract templates.

### 3. Access the Platform

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: See `CLM_API_DOCUMENTATION.md`

## Next Steps for Developers

### Priority 1: Complete Authentication

1. Create `stores/auth.store.ts` with Zustand
2. Implement login/logout flow
3. Add protected route guards
4. Connect login page to backend

### Priority 2: Implement Dashboard

1. Fetch statistics from `/api/contracts/statistics`
2. Display expiring contracts from `/api/contracts/expiring`
3. Add contract type chart
4. Create recent activity feed

### Priority 3: Build Template Pages

1. **TemplateList Component**:
   - Fetch from `/api/templates`
   - Add filters (type, category, search)
   - Card grid layout
   - Click to view details

2. **TemplateDetail Component**:
   - Fetch from `/api/templates/:id`
   - Show template content
   - Preview button
   - Clone button
   - Use template button

3. **TemplatePreview Modal**:
   - Form for field values
   - POST to `/api/templates/:id/preview`
   - Display populated content

### Priority 4: Build Contract Pages

1. **ContractList Component**:
   - Fetch from `/api/contracts`
   - Filters (type, status, expiring)
   - Pagination
   - Status badges

2. **ContractDetail Component**:
   - Full contract view
   - Counterparties section
   - Obligations list
   - Milestones tracker
   - Version history

3. **CreateContract Wizard**:
   - Step 1: Choose template
   - Step 2: Fill field values
   - Step 3: Add counterparties
   - Step 4: Set dates & terms
   - Step 5: Review & create

## API Endpoints Reference

See `CLM_API_DOCUMENTATION.md` in project root for complete API reference.

### Templates

- `GET /api/templates` - List templates
- `GET /api/templates/:id` - Get template
- `POST /api/templates` - Create template
- `PATCH /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `POST /api/templates/:id/clone` - Clone template
- `POST /api/templates/:id/preview` - Preview template

### Contracts

- `GET /api/contracts` - List contracts
- `GET /api/contracts/:id` - Get contract
- `POST /api/contracts/from-template` - Create from template
- `POST /api/contracts` - Create from scratch
- `PATCH /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract
- `POST /api/contracts/:id/archive` - Archive contract
- `GET /api/contracts/expiring` - Get expiring contracts
- `GET /api/contracts/statistics` - Get statistics

## Troubleshooting

### Port Already in Use

If port 3000 is in use, Vite will suggest an alternative port (3001, 3002, etc.)

Or change the port in `vite.config.ts`:

```typescript
server: {
  port: 3001,
}
```

### API Connection Issues

1. Ensure backend is running on port 5000
2. Check proxy configuration in `vite.config.ts`
3. Verify CORS is enabled in backend (`backend/src/server.ts`)

### Build Errors

Clear cache and rebuild:

```bash
rm -rf node_modules .vite
npm install
npm run dev
```

## Performance Optimization

- Use React.lazy() for code splitting
- Implement virtual scrolling for large lists
- Add pagination for API calls
- Cache frequently accessed data
- Optimize images and assets

## Contributing

1. Follow TypeScript strict mode
2. Use Tailwind utility classes
3. Create reusable components
4. Add proper error handling
5. Include loading states
6. Write meaningful commit messages

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [TypeScript](https://www.typescriptlang.org)

---

**Status**: Foundation complete. Ready for component development!
