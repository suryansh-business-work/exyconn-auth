# Exyconn Auth Multi Tenant

Multi-tenant authentication system with cross-subdomain cookie support.

## 📋 Project Overview

| Component | Port | Domain | Description |
|-----------|------|--------|-------------|
| UI | 4001 | auth.exyconn.com | Authentication user interface |
| Server | 4002 | exyconn-auth-server.exyconn.com | Authentication API server |

## 🚀 Quick Start

### Prerequisites
- Node.js >= 22.0.0
- npm or pnpm
- Docker & Docker Compose (for containerized deployment)
- MongoDB (for server)

### Installation

```bash
# Install all dependencies
npm run install:all

# Or install individually
npm run install:ui
npm run install:server
```

### Development

```bash
# Run both UI and Server
npm run dev

# Or run individually
npm run dev:ui      # UI on http://localhost:4001
npm run dev:server  # Server on http://localhost:4002
```

### Build

```bash
# Build all
npm run build

# Or build individually
npm run build:ui
npm run build:server
```

### Linting & Formatting

```bash
# Typecheck
npm run typecheck

# Lint
npm run lint
npm run lint:fix

# Format
npm run format
npm run format:check
```

### Docker

```bash
# Build Docker images
npm run docker:build

# Start containers
npm run docker:up

# View logs
npm run docker:logs

# Stop containers
npm run docker:down
```

---

## How It Works

**Tokens are stored in HTTP-only cookies** that are shared across subdomains. User data is stored in localStorage.

### Cookie Configuration
- **Domain**: Automatically extracted from request origin (e.g., `.company.com` from `auth.company.com`)
- **HttpOnly**: `true` - not accessible via JavaScript (XSS protection)
- **Secure**: `true` in production (HTTPS only)
- **SameSite**: `lax` - CSRF protection while allowing navigation
- **Multi-tenant**: Works with any domain, not just exyconn.com

---

## Integrating Auth in Other Apps

### 1. API Calls (Backend Token Validation)

Just include `credentials: 'include'` in fetch requests - the auth cookie is sent automatically:

```typescript
const response = await fetch('https://exyconn-auth-server.exyconn.com/v1/api/auth/me', {
  method: 'GET',
  credentials: 'include',  // Important! Sends cookies
  headers: {
    'x-api-key': 'YOUR_ORG_API_KEY',
  }
});

const { data } = await response.json();
// data.user contains the authenticated user
```

### 2. Check if User is Logged In

Call `/v1/api/auth/me` - if it returns `200`, user is authenticated:

```typescript
export async function isAuthenticated(): Promise<boolean> {
  try {
    const res = await fetch('https://exyconn-auth-server.exyconn.com/v1/api/auth/me', {
      credentials: 'include',
      headers: { 'x-api-key': 'YOUR_ORG_API_KEY' }
    });
    return res.ok;
  } catch {
    return false;
  }
}
```

### 3. Get User Data from localStorage

After login, user data is stored in localStorage:

```typescript
const userData = JSON.parse(localStorage.getItem('userData') || 'null');
// { id, email, firstName, lastName, role, organizationId, ... }
```

### 4. Redirect to Login

If not authenticated, redirect to the auth portal:

```typescript
if (!isAuthenticated()) {
  window.location.href = 'https://auth.exyconn.com?redirect=' + encodeURIComponent(window.location.href);
}
```

### 5. Logout

Redirect to the logout page or call the API:

```typescript
// Option 1: Redirect
window.location.href = 'https://auth.exyconn.com/logout';

// Option 2: API call
await fetch('https://exyconn-auth-server.exyconn.com/v1/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
});
localStorage.removeItem('userData');
localStorage.removeItem('godUserData');
```

---

## 🔐 Environment Variables

### Server (`server/.env`)

```env
# ==============================================
# Auth Server Environment Variables
# ==============================================

# Server Configuration
PORT=4002
NODE_ENV=development
API_BASE_URL=http://localhost:4002

# Database
MONGODB_URI=mongodb://localhost:27017/dynamic-auth

# JWT Configuration
JWT_SECRET=your-jwt-secret-here

# ImageKit Configuration (for profile picture uploads)
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-endpoint

# Email Configuration (optional - can use org-specific SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password

# Google OAuth (optional - can use org-specific OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### UI (`ui/.env`)

```env
VITE_API_BASE_URL=http://localhost:4002/v1/api
```

---

## 🔑 GitHub Secrets Required

For GitHub Actions deployment, add these secrets:

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `SSH_HOST` | Server IP/hostname |
| `SSH_USER` | SSH username |
| `SSH_KEY` | SSH private key |
| `SSH_PORT` | SSH port (default: 22) |
| `SLACK_WEBHOOK` | Slack webhook URL for notifications |

---

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/login` | POST | API Key | Login user |
| `/auth/signup` | POST | API Key | Register user |
| `/auth/logout` | POST | None | Clear auth cookies |
| `/auth/me` | GET | API Key + Cookie | Get current user |
| `/auth/profile` | GET/PUT | API Key + Cookie | User profile |

---

## Local Development

```bash
# Server (port 4002)
cd server
npm install
npm run dev

# UI (port 4001)
cd ui
npm install
npm run dev
```

Open http://localhost:4001

---

## 📁 Project Structure

```
exyconn-auth/
├── .github/
│   └── workflows/
│       ├── ci.yml           # CI Pipeline
│       ├── deploy-ui.yml    # UI Deployment
│       └── deploy-server.yml # Server Deployment
├── ui/                      # React TypeScript UI
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── server/                  # Node TypeScript Server
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── package/                 # NPM Package (optional)
├── docker-compose.yml       # Docker Compose config
├── package.json             # Root package.json
└── README.md
```

---

## 🔗 Repository

- **GitHub**: https://github.com/suryansh-business-work/exyconn-auth
- **Production UI**: https://auth.exyconn.com
- **Production API**: https://exyconn-auth-server.exyconn.com
