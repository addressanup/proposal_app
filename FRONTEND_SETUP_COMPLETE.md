# Frontend Setup Complete - CLM Platform

## ✅ Configuration Complete

The React + TypeScript + Vite frontend has been configured with:

- **package.json**: Full dependencies for React, TypeScript, Tailwind, React Router, Zustand, React Hook Form
- **vite.config.ts**: Vite configuration with API proxy to backend (localhost:5000)
- **tsconfig.json**: TypeScript configuration with strict mode and path aliases
- **tailwind.config.js**: Tailwind CSS configuration with custom primary colors
- **index.html**: HTML entry point
- **src/main.tsx**: React entry point
- **src/index.css**: Tailwind CSS with custom component classes

## 📦 Installation Required

Before running the frontend, install dependencies:

```bash
cd frontend
npm install
```

## 🚀 Running the Frontend

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The frontend will run on **http://localhost:3000** and proxy API requests to **http://localhost:5000**

## 📁 Required Source Structure

The following files need to be created in `frontend/src/`:

### Core Application Files

```
src/
├── App.tsx                          # Main application component with routing
├── main.tsx                         # ✅ Created - React entry point
├── index.css                        # ✅ Created - Tailwind styles
│
├── lib/
│   ├── api.ts                       # Axios instance with auth interceptors
│   └── utils.ts                     # Utility functions
│
├── services/
│   ├── auth.service.ts              # Authentication API calls
│   ├── template.service.ts          # Template API calls
│   └── contract.service.ts          # Contract API calls
│
├── stores/
│   └── auth.store.ts                # Zustand auth state management
│
├── types/
│   ├── auth.types.ts                # Authentication types
│   ├── template.types.ts            # Template types
│   └── contract.types.ts            # Contract types
│
├── components/
│   ├── layout/
│   │   ├── Nav bar.tsx              # Navigation bar
│   │   ├── Sidebar.tsx              # Sidebar navigation
│   │   └── Layout.tsx               # Main layout wrapper
│   │
│   ├── templates/
│   │   ├── TemplateList.tsx         # List all templates
│   │   ├── TemplateCard.tsx         # Template preview card
│   │   ├── TemplateDetail.tsx       # Template details
│   │   ├── TemplateForm.tsx         # Create/edit template
│   │   └── TemplatePreview.tsx      # Preview with sample data
│   │
│   ├── contracts/
│   │   ├── ContractList.tsx         # List all contracts
│   │   ├── ContractCard.tsx         # Contract preview card
│   │   ├── ContractDetail.tsx       # Contract details
│   │   ├── ContractForm.tsx         # Create contract from template
│   │   ├── ContractWizard.tsx       # Multi-step contract creation
│   │   └── ContractStatus.tsx       # Status indicator
│   │
│   ├── dashboard/
│   │   ├── Dashboard.tsx            # Main dashboard
│   │   ├── StatsCard.tsx            # Statistics card
│   │   ├── ExpiringContracts.tsx    # Expiring contracts widget
│   │   └── RecentActivity.tsx       # Recent activity feed
│   │
│   └── common/
│       ├── Button.tsx               # Reusable button
│       ├── Input.tsx                # Form input
│       ├── Select.tsx               # Select dropdown
│       ├── Modal.tsx                # Modal dialog
│       ├── Loading.tsx              # Loading spinner
│       ├── Badge.tsx                # Status badge
│       └── EmptyState.tsx           # Empty state component
│
└── pages/
    ├── auth/
    │   ├── LoginPage.tsx            # Login page
    │   ├── RegisterPage.tsx         # Registration page
    │   └── ForgotPasswordPage.tsx   # Password reset
    │
    ├── dashboard/
    │   └── DashboardPage.tsx        # Dashboard page
    │
    ├── templates/
    │   ├── TemplatesPage.tsx        # Templates list page
    │   ├── TemplateDetailPage.tsx   # Template detail page
    │   └── CreateTemplatePage.tsx   # Create template page
    │
    └── contracts/
        ├── ContractsPage.tsx        # Contracts list page
        ├── ContractDetailPage.tsx   # Contract detail page
        └── CreateContractPage.tsx   # Create contract page
```

## 🔑 Key Implementation Details

### 1. API Service Layer

All services should use the configured axios instance with auth interceptors:

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Template Service Example

```typescript
// services/template.service.ts
import api from '../lib/api';
import { Template, CreateTemplateData } from '../types/template.types';

export const templateService = {
  list: (filters?: any) =>
    api.get<{ data: Template[] }>('/templates', { params: filters }),

  getById: (id: string) =>
    api.get<{ data: Template }>(`/templates/${id}`),

  create: (data: CreateTemplateData) =>
    api.post<{ data: Template }>('/templates', data),

  update: (id: string, data: Partial<Template>) =>
    api.patch<{ data: Template }>(`/templates/${id}`, data),

  delete: (id: string) =>
    api.delete(`/templates/${id}`),

  clone: (id: string, name: string, organizationId?: string) =>
    api.post<{ data: Template }>(`/templates/${id}/clone`, { name, organizationId }),

  preview: (id: string, fieldValues: Record<string, any>) =>
    api.post<{ data: { preview: string } }>(`/templates/${id}/preview`, { fieldValues }),
};
```

### 3. Contract Service Example

```typescript
// services/contract.service.ts
import api from '../lib/api';
import { Contract, CreateContractFromTemplateData } from '../types/contract.types';

export const contractService = {
  list: (filters?: any, page = 1, limit = 20) =>
    api.get<{ data: Contract[]; pagination: any }>('/contracts', {
      params: { ...filters, page, limit }
    }),

  getById: (id: string) =>
    api.get<{ data: Contract }>(`/contracts/${id}`),

  createFromTemplate: (data: CreateContractFromTemplateData) =>
    api.post<{ data: Contract }>('/contracts/from-template', data),

  create: (data: any) =>
    api.post<{ data: Contract }>('/contracts', data),

  update: (id: string, data: Partial<Contract>) =>
    api.patch<{ data: Contract }>(`/contracts/${id}`, data),

  delete: (id: string) =>
    api.delete(`/contracts/${id}`),

  archive: (id: string) =>
    api.post<{ data: Contract }>(`/contracts/${id}/archive`),

  getExpiring: (daysAhead = 30) =>
    api.get<{ data: Contract[] }>('/contracts/expiring', { params: { daysAhead } }),

  getStatistics: (organizationId?: string) =>
    api.get<{ data: any }>('/contracts/statistics', { params: { organizationId } }),
};
```

### 4. Auth Store with Zustand

```typescript
// stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        set({
          user: data.user,
          accessToken: data.accessToken,
          isAuthenticated: true
        });
        localStorage.setItem('accessToken', data.accessToken);
      },

      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
        localStorage.removeItem('accessToken');
      },

      setUser: (user, token) => {
        set({ user, accessToken: token, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 5. Main App with Routing

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TemplatesPage from './pages/templates/TemplatesPage';
import TemplateDetailPage from './pages/templates/TemplateDetailPage';
import CreateTemplatePage from './pages/templates/CreateTemplatePage';
import ContractsPage from './pages/contracts/ContractsPage';
import ContractDetailPage from './pages/contracts/ContractDetailPage';
import CreateContractPage from './pages/contracts/CreateContractPage';

// Layout
import Layout from './components/layout/Layout';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Templates */}
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="templates/:id" element={<TemplateDetailPage />} />
          <Route path="templates/new" element={<CreateTemplatePage />} />

          {/* Contracts */}
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="contracts/:id" element={<ContractDetailPage />} />
          <Route path="contracts/new" element={<CreateContractPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## 🎨 UI Component Examples

### Dashboard Stats Card

```tsx
// components/dashboard/StatsCard.tsx
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
}

export default function StatsCard({ title, value, icon, trend, subtitle }: StatsCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-primary-100 rounded-full text-primary-600">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-gray-500 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
}
```

### Contract Status Badge

```tsx
// components/contracts/ContractStatus.tsx
import { ContractStatus } from '../../types/contract.types';

const STATUS_CONFIG: Record<ContractStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'badge-gray' },
  PENDING_APPROVAL: { label: 'Pending Approval', className: 'badge-warning' },
  IN_REVIEW: { label: 'In Review', className: 'badge-info' },
  APPROVED: { label: 'Approved', className: 'badge-success' },
  PENDING_SIGNATURE: { label: 'Pending Signature', className: 'badge-warning' },
  ACTIVE: { label: 'Active', className: 'badge-success' },
  EXPIRED: { label: 'Expired', className: 'badge-error' },
  ARCHIVED: { label: 'Archived', className: 'badge-gray' },
  // ... other statuses
};

interface ContractStatusProps {
  status: ContractStatus;
}

export default function ContractStatusBadge({ status }: ContractStatusProps) {
  const config = STATUS_CONFIG[status];
  return <span className={config.className}>{config.label}</span>;
}
```

## 🔐 Protected Routes

Use a ProtectedRoute component:

```tsx
// components/common/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

## 📊 Dashboard Implementation

The dashboard should display:

1. **Statistics Cards**:
   - Total Contracts
   - Active Contracts
   - Expiring Soon (next 30 days)
   - Pending Approval
   - Total Contract Value

2. **Recent Contracts Table**:
   - Contract title
   - Type
   - Status
   - Expiration date
   - Actions

3. **Expiring Contracts Alert**:
   - List of contracts expiring in next 30 days
   - Days until expiration
   - Quick renewal action

4. **Contract by Type Chart**:
   - Pie/donut chart showing distribution
   - Employment, NDA, Vendor, etc.

## 🚦 Status Workflow UI

Implement status transitions with:
- Status badge showing current state
- Dropdown or buttons for valid next states
- Confirmation modal for critical transitions
- Audit trail showing status history

## 📋 Forms with React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const contractSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  contractType: z.enum(['EMPLOYMENT', 'NDA', 'VENDOR_SERVICE', ...]),
  effectiveDate: z.string(),
  // ... other fields
});

type ContractFormData = z.infer<typeof contractSchema>;

export default function ContractForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
  });

  const onSubmit = async (data: ContractFormData) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} className="input" />
      {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
      {/* ... other fields */}
    </form>
  );
}
```

## 🎯 Priority Implementation Order

1. **Phase 1: Core Setup** ✅
   - Vite + React + TypeScript configuration
   - Tailwind CSS setup
   - API service layer
   - Auth store

2. **Phase 2: Authentication**
   - Login/Register pages
   - Protected routes
   - Auth state management

3. **Phase 3: Dashboard**
   - Statistics display
   - Recent activity
   - Navigation

4. **Phase 4: Templates**
   - List templates
   - Template details
   - Preview functionality

5. **Phase 5: Contracts**
   - Create from template
   - List contracts
   - Contract details
   - Status management

6. **Phase 6: Integration**
   - Connect to proposal features
   - Document upload/management
   - Share functionality

## 🔄 Next Steps

1. **Install dependencies**:
   ```bash
   cd frontend && npm install
   ```

2. **Create the source files** listed in the structure above

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Test against backend**:
   - Ensure backend is running on port 5000
   - Test API calls through proxy
   - Verify authentication flow

## 📚 Additional Resources

- **React Router v6**: https://reactrouter.com/
- **Zustand**: https://docs.pmnd.rs/zustand/
- **React Hook Form**: https://react-hook-form.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/

---

**Status**: Configuration complete, ready for component development!
