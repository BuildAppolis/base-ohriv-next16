# Auth Interface Migration & Dynamic Routing System

## Executive Summary

This document outlines a comprehensive plan for migrating the authentication interface from `ba-cms-v1-ohriv` to the current Better Auth system, implementing a dynamic routing system for database management, and integrating custom components and libraries. The migration will enable seamless server/client-side data handling with advanced permission management.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication Interface Migration](#authentication-interface-migration)
3. [Dynamic Routing System](#dynamic-routing-system)
4. [Custom Components & Libraries](#custom-components--libraries)
5. [Server/Client Data Handling](#serverclient-data-handling)
6. [Permission System Architecture](#permission-system-architecture)
7. [Migration Strategy](#migration-strategy)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Architecture Overview

### Current System (ba-cms-v1-ohriv)
```
src/app/(frontend)/(auth)/
├── auth/[path]/          # Dynamic auth routes
├── dashboard/            # Main dashboard with nested routes
│   ├── _components/      # Reusable dashboard components
│   ├── attributes/       # Attribute management
│   ├── jobs/            # Job management
│   ├── questions/       # Question management
│   ├── stages/          # Stage management
│   └── team/            # Team & permissions
└── providers.tsx        # Auth providers wrapper
```

### Target System (Better Auth Integration)
```
src/app/(app)/           # Main application route group
├── auth/                # Auth routes with dynamic paths
├── dashboard/           # Dashboard with modular architecture
├── api/                 # API routes for data management
└── _components/         # Shared components
```

---

## Authentication Interface Migration

### 1. Dynamic Auth Routes

#### Current Implementation
```typescript
// auth/[path]/page.tsx
import { AuthView } from "@daveyplate/better-auth-ui"
import { authViewPaths } from "@daveyplate/better-auth-ui/server"

export function generateStaticParams() {
    return Object.values(authViewPaths).map((path) => ({ path }))
}

export default async function AuthPage({ params }) {
    const { path } = await params
    return <AuthView path={path} />
}
```

#### Migration Strategy
1. **Install Dependencies**:
   ```bash
   pnpm add @daveyplate/better-auth-ui@3.1.2
   ```

2. **Create Dynamic Auth Route**:
   ```typescript
   // src/app/(app)/auth/[...path]/page.tsx
   import { AuthView } from "@daveyplate/better-auth-ui"
   import { Metadata } from "next"
   
   export async function generateMetadata({ params }): Promise<Metadata> {
     const path = params.path.join('/')
     const titles = {
       'sign-in': 'Sign In',
       'sign-up': 'Create Account',
       'forgot-password': 'Reset Password',
       'verify-email': 'Verify Email'
     }
     return {
       title: titles[path] || 'Authentication'
     }
   }
   
   export default async function AuthPage({ params }) {
     const path = params.path.join('/')
     return (
       <div className="min-h-screen flex items-center justify-center">
         <AuthView path={path} />
       </div>
     )
   }
   ```

3. **Update Providers**:
   ```typescript
   // src/app/(app)/providers.tsx
   export function AppProviders({ children }) {
     const router = useRouter()
     
     return (
       <QueryClientProvider client={queryClient}>
         <AuthUIProvider
           authClient={authClient}
           navigate={router.push}
           replace={router.replace}
           onSessionChange={() => router.refresh()}
           magicLink={true}
           providers={['google', 'github']}
           viewPaths={{
             settings: '/dashboard/settings',
             profile: '/dashboard/profile'
           }}
           basePath="/"
           LinkComponent={Link}
         >
           {children}
         </AuthUIProvider>
       </QueryClientProvider>
     )
   }
   ```

---

## Dynamic Routing System

### Database-Driven Route Generation

#### 1. Route Configuration Schema
```typescript
// src/types/route-config.ts
interface DynamicRoute {
  id: string
  path: string
  component: string
  permissions: string[]
  metadata: {
    title: string
    description?: string
    icon?: string
    parent?: string
    order?: number
  }
  dataSource?: {
    type: 'database' | 'api' | 'static'
    model?: string
    query?: any
    cache?: {
      ttl: number
      key: string
    }
  }
}
```

#### 2. Dynamic Route Generator
```typescript
// src/lib/routing/dynamic-router.ts
import { prisma } from '@/lib/prisma'
import { cache } from 'react'

export const getDynamicRoutes = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      members: {
        include: {
          organization: true
        }
      }
    }
  })
  
  const routes: DynamicRoute[] = []
  
  // Generate org-specific routes
  for (const member of user.members) {
    const orgRoutes = await generateOrgRoutes(
      member.organization.id,
      member.role
    )
    routes.push(...orgRoutes)
  }
  
  // Add user-specific routes
  const userRoutes = await generateUserRoutes(userId)
  routes.push(...userRoutes)
  
  return routes
})

async function generateOrgRoutes(orgId: string, role: string) {
  // Generate routes based on org and role
  const baseRoutes = [
    {
      path: `/org/${orgId}/dashboard`,
      component: 'OrgDashboard',
      permissions: ['org:view']
    },
    {
      path: `/org/${orgId}/jobs`,
      component: 'JobsManager',
      permissions: ['jobs:view']
    }
  ]
  
  // Filter by role permissions
  return filterRoutesByRole(baseRoutes, role)
}
```

#### 3. Dynamic Page Component
```typescript
// src/app/(app)/[...slug]/page.tsx
import { notFound } from 'next/navigation'
import { getDynamicRoutes } from '@/lib/routing/dynamic-router'
import { loadComponent } from '@/lib/routing/component-loader'

export async function generateStaticParams() {
  // Generate paths at build time for known routes
  return []
}

export default async function DynamicPage({ 
  params 
}: { 
  params: { slug: string[] } 
}) {
  const path = '/' + params.slug.join('/')
  const session = await auth()
  
  if (!session) {
    redirect('/auth/sign-in')
  }
  
  const routes = await getDynamicRoutes(session.user.id)
  const route = routes.find(r => r.path === path)
  
  if (!route) {
    notFound()
  }
  
  // Check permissions
  const hasPermission = await checkPermissions(
    session.user.id,
    route.permissions
  )
  
  if (!hasPermission) {
    redirect('/unauthorized')
  }
  
  // Load component dynamically
  const Component = await loadComponent(route.component)
  
  // Fetch data if configured
  const data = route.dataSource 
    ? await fetchRouteData(route.dataSource)
    : null
  
  return <Component data={data} route={route} />
}
```

---

## Custom Components & Libraries

### Required Dependencies

```json
{
  "dependencies": {
    // Auth & UI
    "@daveyplate/better-auth-ui": "3.1.2",
    
    // Data Management
    "@tanstack/react-query": "^5.70.0",
    "@tanstack/react-table": "^8.21.3",
    
    // UI Components (already installed)
    "lucide-react": "latest",
    "sonner": "latest",
    
    // Charts & Analytics
    "recharts": "2.15.1",
    
    // DnD & Interactions
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    
    // Forms & Validation
    "react-hook-form": "^7.54.2",
    "zod": "^3.24.1",
    "@hookform/resolvers": "^3.10.0",
    
    // Rich Text Editor
    "@tiptap/react": "^2.10.6",
    "@tiptap/starter-kit": "^2.10.6",
    
    // File Upload
    "react-dropzone": "^14.3.5",
    "@aws-sdk/client-s3": "^3.721.0",
    
    // Date & Time
    "date-fns": "^4.2.0",
    "react-day-picker": "^9.5.1"
  }
}
```

### Component Migration Map

| Original Component | Target Location | Dependencies | Notes |
|-------------------|-----------------|--------------|--------|
| `app-sidebar.tsx` | `/components/dashboard/sidebar` | shadcn/ui sidebar | Already implemented |
| `dashboard-header.tsx` | `/components/dashboard/header` | Custom breadcrumbs | Merge with AdminPageHeader |
| `permission-wrapper.tsx` | `/components/auth/permission-guard` | Auth context | Use Better Auth hooks |
| `team-switcher.tsx` | `/components/org/org-switcher` | Organization API | Integrate with Better Auth orgs |
| `attribute-form.tsx` | `/components/forms/attribute-form` | React Hook Form | Custom form component |
| `stages-list.tsx` | `/components/stages/stages-manager` | DnD Kit | Sortable stage management |

### Custom Hooks Migration

```typescript
// src/hooks/use-effective-permissions.ts
export function useEffectivePermissions() {
  const session = useSession()
  const activeOrg = useActiveOrganization()
  
  const { data: permissions } = useQuery({
    queryKey: ['permissions', session?.user.id, activeOrg?.id],
    queryFn: async () => {
      if (!session?.user.id || !activeOrg?.id) return null
      
      const member = await authClient.organization.getMember({
        organizationId: activeOrg.id,
        userId: session.user.id
      })
      
      return calculateEffectivePermissions(member)
    }
  })
  
  return {
    permissions,
    hasPermission: (resource: string, action: string) => {
      return permissions?.[resource]?.[action] ?? false
    }
  }
}
```

---

## Server/Client Data Handling

### 1. Server Components with Data Fetching

```typescript
// src/app/(app)/dashboard/jobs/page.tsx
import { Suspense } from 'react'
import { JobsList } from '@/components/jobs/jobs-list'
import { getJobs } from '@/lib/data/jobs'

export default async function JobsPage() {
  const jobs = await getJobs() // Server-side fetch
  
  return (
    <Suspense fallback={<JobsListSkeleton />}>
      <JobsList initialData={jobs} />
    </Suspense>
  )
}
```

### 2. Client Components with React Query

```typescript
// src/components/jobs/jobs-list.tsx
'use client'

export function JobsList({ initialData }) {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
    initialData,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000 // 1 minute
  })
  
  const createMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job created successfully')
    }
  })
  
  return (
    <DataTable
      data={jobs}
      columns={jobColumns}
      onCreate={createMutation.mutate}
    />
  )
}
```

### 3. API Route Handlers

```typescript
// src/app/api/jobs/route.ts
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const jobSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  organizationId: z.string()
})

export async function GET(request: Request) {
  const session = await auth()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('orgId')
  
  const jobs = await prisma.job.findMany({
    where: {
      organizationId: orgId,
      // Apply permission filters
      OR: [
        { createdById: session.user.id },
        { assignedTo: { has: session.user.id } },
        { isPublic: true }
      ]
    },
    include: {
      stages: true,
      candidates: {
        take: 5
      }
    }
  })
  
  return Response.json(jobs)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const body = await request.json()
  const validated = jobSchema.parse(body)
  
  // Check permissions
  const hasPermission = await checkOrgPermission(
    session.user.id,
    validated.organizationId,
    'jobs:create'
  )
  
  if (!hasPermission) {
    return new Response('Forbidden', { status: 403 })
  }
  
  const job = await prisma.job.create({
    data: {
      ...validated,
      createdById: session.user.id
    }
  })
  
  return Response.json(job)
}
```

### 4. Real-time Updates with Server-Sent Events

```typescript
// src/app/api/jobs/stream/route.ts
export async function GET(request: Request) {
  const session = await auth()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const subscription = await subscribeToJobUpdates(
        session.user.id,
        (job) => {
          const data = `data: ${JSON.stringify(job)}\n\n`
          controller.enqueue(encoder.encode(data))
        }
      )
      
      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        subscription.unsubscribe()
        controller.close()
      })
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
```

---

## Permission System Architecture

### 1. Permission Hierarchy

```typescript
// src/auth/permissions/hierarchy.ts
export const PERMISSION_HIERARCHY = {
  platform: {
    super_admin: {
      inherits: [],
      grants: ['*'] // All permissions
    },
    platform_owner: {
      inherits: [],
      grants: ['platform:*', 'org:*']
    },
    user: {
      inherits: [],
      grants: ['profile:*', 'org:join']
    }
  },
  organization: {
    owner: {
      inherits: ['admin'],
      grants: ['org:delete', 'billing:*']
    },
    admin: {
      inherits: ['manager'],
      grants: ['team:*', 'settings:*']
    },
    manager: {
      inherits: ['recruiter'],
      grants: ['jobs:*', 'candidates:assign']
    },
    recruiter: {
      inherits: ['interviewer'],
      grants: ['candidates:create', 'candidates:edit']
    },
    interviewer: {
      inherits: [],
      grants: ['candidates:view', 'candidates:score']
    }
  }
}
```

### 2. Permission Middleware

```typescript
// src/middleware/permissions.ts
export function withPermissions(
  handler: NextApiHandler,
  required: string[]
): NextApiHandler {
  return async (req, res) => {
    const session = await getServerSession(req, res)
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const hasAll = await Promise.all(
      required.map(permission => 
        checkPermission(session.user.id, permission)
      )
    )
    
    if (!hasAll.every(Boolean)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    
    return handler(req, res)
  }
}
```

### 3. React Permission Components

```typescript
// src/components/auth/permission-gate.tsx
interface PermissionGateProps {
  permissions: string | string[]
  fallback?: ReactNode
  children: ReactNode
  requireAll?: boolean
}

export function PermissionGate({
  permissions,
  fallback = null,
  children,
  requireAll = false
}: PermissionGateProps) {
  const { hasPermission } = usePermissions()
  
  const permArray = Array.isArray(permissions) ? permissions : [permissions]
  
  const hasAccess = requireAll
    ? permArray.every(p => hasPermission(p))
    : permArray.some(p => hasPermission(p))
  
  if (!hasAccess) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}
```

---

## Migration Strategy

### Phase 1: Foundation (Week 1-2)
1. **Install Dependencies**
   - Add all required npm packages
   - Configure build tools and scripts

2. **Setup Auth Routes**
   - Implement dynamic auth route handler
   - Configure AuthUIProvider
   - Test all auth flows

3. **Create Base Components**
   - Migrate dashboard layout
   - Setup sidebar navigation
   - Implement permission wrapper

### Phase 2: Core Features (Week 3-4)
1. **Dynamic Routing System**
   - Implement route generator
   - Create dynamic page component
   - Setup data fetching patterns

2. **Permission System**
   - Port permission contexts
   - Implement permission checks
   - Create permission UI components

3. **Organization Management**
   - Migrate org switcher
   - Implement org-specific routes
   - Setup org data isolation

### Phase 3: Feature Migration (Week 5-6)
1. **Dashboard Components**
   - Jobs management
   - Candidates tracking
   - Team management
   - Stages configuration

2. **Forms & Interactions**
   - Attribute forms
   - Question builders
   - Drag-and-drop stages

3. **Analytics & Reporting**
   - Permission analytics
   - Activity tracking
   - Audit logs

### Phase 4: Optimization (Week 7-8)
1. **Performance**
   - Implement caching strategies
   - Optimize data fetching
   - Setup CDN for assets

2. **Testing**
   - Unit tests for permissions
   - Integration tests for auth
   - E2E tests for critical paths

3. **Documentation**
   - API documentation
   - Component storybook
   - User guides

---

## Implementation Roadmap

### Immediate Actions (Day 1-3)

```bash
# 1. Install core dependencies
pnpm add @daveyplate/better-auth-ui@3.1.2
pnpm add @tanstack/react-table recharts
pnpm add @dnd-kit/core @dnd-kit/sortable
pnpm add react-hook-form zod @hookform/resolvers

# 2. Create directory structure
mkdir -p src/app/(app)/auth
mkdir -p src/app/(app)/dashboard
mkdir -p src/components/dashboard
mkdir -p src/lib/routing
mkdir -p src/lib/permissions

# 3. Setup environment variables
echo "NEXT_PUBLIC_APP_URL=http://localhost:3000" >> .env.local
echo "PERMISSION_CACHE_TTL=300" >> .env.local
```

### Week 1 Deliverables
- [ ] Auth routes working with Better Auth UI
- [ ] Dashboard layout with sidebar
- [ ] Basic permission system
- [ ] Dynamic route generator prototype

### Week 2 Deliverables
- [ ] Organization management
- [ ] Job creation and listing
- [ ] Team member invitations
- [ ] Permission matrix UI

### Success Metrics
1. **Authentication**: < 2 second login time
2. **Permissions**: < 100ms permission checks
3. **Data Loading**: < 500ms initial page load
4. **Real-time**: < 200ms update propagation
5. **User Experience**: > 95% success rate on critical paths

---

## Security Considerations

### 1. Permission Validation
- Server-side permission checks on all API routes
- Client-side checks for UI optimization only
- Regular permission audits and logging

### 2. Data Isolation
- Row-level security in database
- Organization-based data partitioning
- Encrypted sensitive data fields

### 3. Session Management
- Secure, httpOnly cookies
- Regular session rotation
- Device tracking and alerts

### 4. Audit Trail
- Log all permission changes
- Track data access patterns
- Monitor for anomalies

---

## Conclusion

This migration plan provides a comprehensive approach to:
1. Migrating the authentication interface with minimal disruption
2. Implementing a flexible, database-driven routing system
3. Ensuring proper permission management at all levels
4. Optimizing for both server and client-side performance

The modular approach allows for incremental migration while maintaining system stability. Each phase builds upon the previous, ensuring a solid foundation for future enhancements.

## Next Steps

1. Review and approve the migration plan
2. Set up development environment
3. Begin Phase 1 implementation
4. Schedule weekly progress reviews
5. Prepare rollback strategies for each phase

---

*Document Version: 1.0.0*  
*Last Updated: {{ current_date }}*  
*Author: System Architecture Team*