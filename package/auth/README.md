# @exyconn/auth

React authentication hooks, components, and server middleware for Exyconn Auth integration with multi-tenant API key support.

## Features

- 🔐 **Client-side hooks** - React hooks for authentication state management
- 🛡️ **Guard components** - Declarative auth protection for your components
- 🔒 **Protected routes** - Easy route protection with automatic redirects
- ⚡ **Server middleware** - Express middleware for API authentication
- 🏢 **Multi-tenant support** - API key-based tenant identification

## Installation

```bash
npm install @exyconn/auth
# or
yarn add @exyconn/auth
# or
pnpm add @exyconn/auth
```

## Subpackages

This package provides two subpackages for different use cases:

| Subpackage | Import | Use Case |
|------------|--------|----------|
| `@exyconn/auth` | Main entry | All client-side features |
| `@exyconn/auth/client` | Client-only | React hooks & components |
| `@exyconn/auth/server` | Server-only | Express middleware |

---

## Client Usage (`@exyconn/auth` or `@exyconn/auth/client`)

### 1. Wrap your app with `ExyconnAuthProvider`

```tsx
import { ExyconnAuthProvider } from '@exyconn/auth';

function App() {
  return (
    <ExyconnAuthProvider
      apiAuthBaseUrl="https://exyconn-auth-server.exyconn.com"
      uiAuthUrl="https://auth.exyconn.com"
      apiKey="exy_your_api_key"
    >
      <YourApp />
    </ExyconnAuthProvider>
  );
}
```

### 2. Use authentication hooks

```tsx
import { useIsAuthenticated, useUser, useLogout } from '@exyconn/auth';

function ProfilePage() {
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const logout = useLogout();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <img src={user?.profilePicture} alt="Profile" />
      <h1>Hello, {user?.firstName}!</h1>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. Use guard components

```tsx
import { RequireAuth, RequireRole, RequirePermission } from '@exyconn/auth';

// Require authentication
<RequireAuth fallback={<LoginPage />}>
  <Dashboard />
</RequireAuth>

// Require specific role
<RequireRole role="admin" fallback={<AccessDenied />}>
  <AdminPanel />
</RequireRole>

// Require specific permission
<RequirePermission permission="posts:edit" fallback={<AccessDenied />}>
  <EditButton />
</RequirePermission>
```

### 4. Use ProtectedRoute

```tsx
import { ProtectedRoute } from '@exyconn/auth';

// Automatically redirects to login if not authenticated
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// With custom loading
<ProtectedRoute loading={<Spinner />}>
  <Dashboard />
</ProtectedRoute>

// With custom fallback (no redirect)
<ProtectedRoute fallback={<LoginPage />} redirectToLogin={false}>
  <Dashboard />
</ProtectedRoute>
```

---

## Server Usage (`@exyconn/auth/server`)

### 1. Use the auth middleware

```typescript
import express from 'express';
import { authMiddleware } from '@exyconn/auth/server';

const app = express();

// Set environment variables
// API_KEY=your_api_key
// AUTH_API_BASE_URL=https://exyconn-auth-server.exyconn.com

// Protected route
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({
    message: `Hello ${req.user?.firstName}!`,
    user: req.user,
  });
});
```

### 2. Create custom middleware with options

```typescript
import { createAuthMiddleware } from '@exyconn/auth/server';

const authMiddleware = createAuthMiddleware({
  apiKey: 'your-api-key',
  apiAuthBaseUrl: 'https://your-auth-server.com',
  onError: (error, req, res) => {
    res.status(401).json({ 
      success: false, 
      error 
    });
  },
});

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
```

### 3. Validate tokens directly

```typescript
import { validateToken } from '@exyconn/auth/server';

const result = await validateToken({
  token: 'user-token-here',
  apiKey: 'your-api-key',
});

if (result.valid) {
  console.log('User:', result.user);
} else {
  console.error('Invalid:', result.error);
}
```

---

## Provider Configuration

```tsx
<ExyconnAuthProvider
  // Base URL for your Exyconn Auth API server (required)
  apiAuthBaseUrl="https://exyconn-auth-server.exyconn.com"
  
  // Base URL for the Auth UI (required)
  uiAuthUrl="https://auth.exyconn.com"
  
  // API key for multi-tenant authentication (required)
  apiKey="exy_your_api_key"
  
  // Whether to auto-fetch user on mount (default: true)
  autoFetch={true}
  
  // Callback when authentication fails
  onAuthError={(error) => console.error(error)}
  
  // Callback when user is successfully authenticated
  onAuthSuccess={(user) => console.log('Logged in:', user)}
  
  // Custom headers for API requests
  headers={{ 'X-Custom-Header': 'value' }}
>
  {children}
</ExyconnAuthProvider>
```

---

## Available Hooks

| Hook | Return Type | Description |
|------|-------------|-------------|
| `useExyconnAuth()` | `ExyconnAuthContextValue` | Full auth context |
| `useIsAuthenticated()` | `boolean` | Check if authenticated |
| `useUser()` | `AuthUser \| null` | Get current user |
| `useOrganization()` | `AuthOrganization \| null` | Get organization |
| `useRole()` | `AuthRole \| null` | Get user role |
| `useRoleSlug()` | `string \| null` | Get role slug |
| `useHasRole(role)` | `boolean` | Check specific role |
| `useHasPermission(perm)` | `boolean` | Check permission |
| `useHasAnyPermission(perms)` | `boolean` | Check any permission |
| `useHasAllPermissions(perms)` | `boolean` | Check all permissions |
| `useAuthLoading()` | `boolean` | Loading state |
| `useAuthError()` | `string \| null` | Error state |
| `useLogout()` | `() => void` | Logout function |
| `useAuthToken()` | `{ get, set }` | Token management |
| `useApiKey()` | `{ get, set }` | API key management |
| `useAuthUrls()` | `{ getLoginUrl, ... }` | Auth URL builders |

---

## Guard Components

| Component | Props | Description |
|-----------|-------|-------------|
| `<RequireAuth>` | `fallback`, `loading` | Require authentication |
| `<RequireRole>` | `role`, `fallback`, `loading` | Require specific role |
| `<RequirePermission>` | `permission`, `fallback`, `loading` | Require permission |
| `<RequireAnyPermission>` | `permissions[]`, `fallback`, `loading` | Require any permission |
| `<RequireAllPermissions>` | `permissions[]`, `fallback`, `loading` | Require all permissions |
| `<ProtectedRoute>` | `fallback`, `loading`, `redirectToLogin`, `redirectUrl` | Route protection |

---

## Types

### AuthUser

```typescript
interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  role: string;
  isVerified?: boolean;
  mfaEnabled?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}
```

### Server AuthUser

```typescript
interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  role?: string;
  isVerified?: boolean;
}
```

---

## API Endpoints

This package uses the following Exyconn Auth API endpoints:

- `GET /v1/api/auth/me` - Get current user
- `GET /v1/api/auth/role` - Get current user's role
- `POST /v1/api/auth/logout` - Logout user
- `POST /token/validate` - Validate token (server-side)

---

## Example: Full Stack Setup

### Frontend (React)

```tsx
import { ExyconnAuthProvider, ProtectedRoute, useUser } from '@exyconn/auth';

function App() {
  return (
    <ExyconnAuthProvider
      apiAuthBaseUrl="https://exyconn-auth-server.exyconn.com"
      uiAuthUrl="https://auth.exyconn.com"
      apiKey="exy_your_api_key"
    >
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    </ExyconnAuthProvider>
  );
}

function Dashboard() {
  const user = useUser();
  
  return (
    <div>
      <img src={user?.profilePicture} alt="" />
      <h1>Welcome, {user?.firstName}!</h1>
    </div>
  );
}
```

### Backend (Express)

```typescript
import express from 'express';
import cors from 'cors';
import { createAuthMiddleware } from '@exyconn/auth/server';

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

const authMiddleware = createAuthMiddleware({
  apiKey: process.env.API_KEY!,
});

app.get('/api/user', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.listen(4000);
```

---

## License

MIT © Exyconn
