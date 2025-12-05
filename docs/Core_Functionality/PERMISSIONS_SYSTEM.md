# Organization Permissions System

## Overview

This document outlines how to implement granular permissions for organizations using Better Auth's built-in features combined with custom permission flags.

## Architecture

### 1. Use Better Auth's Member Metadata

Better Auth's organization plugin allows storing custom data in the member record. We'll use this for permissions:

```typescript
// When inviting/updating a member
await authClient.organization.updateMember({
  memberId: "member-id",
  role: "recruiter", // Base role
  // Custom permissions stored in member metadata
  data: {
    permissions: {
      // Job permissions
      jobs: {
        create: false,
        edit: true,
        delete: false,
        viewAll: true,
        viewAssigned: true
      },
      // Candidate permissions
      candidates: {
        create: true,
        edit: true,
        delete: false,
        score: true,
        changeStatus: true,
        viewAll: false,
        viewAssigned: true
      },
      // Team permissions
      teams: {
        manageMembers: false,
        viewMembers: true,
        assignWork: false
      },
      // Custom feature flags
      features: {
        bulkImport: false,
        exportData: false,
        viewAnalytics: false,
        useAI: true
      }
    }
  }
})
```

### 2. Permission Templates

Create role-based permission templates that admins can customize:

```typescript
// Permission templates by role
const PERMISSION_TEMPLATES = {
  owner: {
    jobs: { create: true, edit: true, delete: true, viewAll: true },
    candidates: { create: true, edit: true, delete: true, score: true, changeStatus: true, viewAll: true },
    teams: { manageMembers: true, viewMembers: true, assignWork: true },
    features: { bulkImport: true, exportData: true, viewAnalytics: true, useAI: true }
  },
  admin: {
    jobs: { create: true, edit: true, delete: false, viewAll: true },
    candidates: { create: true, edit: true, delete: false, score: true, changeStatus: true, viewAll: true },
    teams: { manageMembers: true, viewMembers: true, assignWork: true },
    features: { bulkImport: true, exportData: true, viewAnalytics: true, useAI: true }
  },
  manager: {
    jobs: { create: true, edit: true, delete: false, viewAll: true },
    candidates: { create: false, edit: true, delete: false, score: true, changeStatus: true, viewAll: true },
    teams: { manageMembers: false, viewMembers: true, assignWork: true },
    features: { bulkImport: false, exportData: true, viewAnalytics: true, useAI: true }
  },
  recruiter: {
    jobs: { create: false, edit: false, delete: false, viewAll: true },
    candidates: { create: true, edit: true, delete: false, score: true, changeStatus: true, viewAll: false, viewAssigned: true },
    teams: { manageMembers: false, viewMembers: true, assignWork: false },
    features: { bulkImport: false, exportData: false, viewAnalytics: false, useAI: true }
  },
  interviewer: {
    jobs: { create: false, edit: false, delete: false, viewAll: false, viewAssigned: true },
    candidates: { create: false, edit: false, delete: false, score: true, changeStatus: false, viewAll: false, viewAssigned: true },
    teams: { manageMembers: false, viewMembers: false, assignWork: false },
    features: { bulkImport: false, exportData: false, viewAnalytics: false, useAI: false }
  }
}
```

### 3. Database Schema

Store permission configurations:

```prisma
// Organization-wide permission settings
model OrganizationPermissions {
  id             String   @id @default(cuid())
  organizationId String   @unique
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // JSON field storing custom permission definitions
  customPermissions Json? // { "customAction": { name: "Custom Action", description: "..." } }
  
  // Role templates with overrides
  roleTemplates Json? // Modified versions of default templates
  
  // Feature flags for the entire organization
  features Json? // { "advancedAnalytics": true, "aiFeatures": false }
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Member-specific permission overrides (stored in Better Auth's member table)
// This is handled by Better Auth's member.data field
```

### 4. Implementation

```typescript
// auth.ts - Extend organization plugin
import { organization } from "better-auth/plugins"

export const auth = betterAuth({
  plugins: [
    organization({
      // Hook to set default permissions when member is added
      memberAdded: async ({ member, organization }) => {
        const template = PERMISSION_TEMPLATES[member.role] || PERMISSION_TEMPLATES.member
        
        // Set default permissions based on role
        await updateMemberPermissions(member.id, {
          permissions: template
        })
      },
      
      // Custom authorization for permission checks
      async authorizeAction({ user, organization, member, action }) {
        // Get member with permissions
        const fullMember = await getMemberWithPermissions(member.id)
        
        // Check specific permission
        const [resource, permission] = action.split(':') // e.g., "jobs:create"
        return fullMember.data?.permissions?.[resource]?.[permission] ?? false
      }
    })
  ]
})
```

### 5. Permission Checking Utilities

```typescript
// utils/permissions.ts
import { auth } from "@/lib/auth"

export async function checkPermission(
  userId: string,
  organizationId: string,
  resource: string,
  action: string
): Promise<boolean> {
  try {
    const member = await auth.api.getMember({
      userId,
      organizationId
    })
    
    if (!member) return false
    
    // Check role-based permission first
    const rolePermissions = PERMISSION_TEMPLATES[member.role]
    const hasRolePermission = rolePermissions?.[resource]?.[action]
    
    // Check custom permission overrides
    const customPermissions = member.data?.permissions
    const hasCustomPermission = customPermissions?.[resource]?.[action]
    
    // Custom permission overrides role permission
    return hasCustomPermission !== undefined ? hasCustomPermission : hasRolePermission
  } catch {
    return false
  }
}

// React hook for permission checking
export function usePermission(resource: string, action: string) {
  const { data: session } = useSession()
  const { data: activeOrg } = useActiveOrganization()
  const [hasPermission, setHasPermission] = useState(false)
  
  useEffect(() => {
    if (session?.user?.id && activeOrg?.id) {
      checkPermission(session.user.id, activeOrg.id, resource, action)
        .then(setHasPermission)
    }
  }, [session, activeOrg, resource, action])
  
  return hasPermission
}
```

### 6. UI Components

```tsx
// components/PermissionGate.tsx
export function PermissionGate({ 
  resource, 
  action, 
  children, 
  fallback = null 
}: {
  resource: string
  action: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const hasPermission = usePermission(resource, action)
  
  return hasPermission ? <>{children}</> : <>{fallback}</>
}

// Usage
<PermissionGate resource="jobs" action="create">
  <Button onClick={createJob}>Create New Job</Button>
</PermissionGate>
```

### 7. Admin UI for Managing Permissions

```tsx
// components/MemberPermissions.tsx
export function MemberPermissionsEditor({ member }: { member: Member }) {
  const [permissions, setPermissions] = useState(member.data?.permissions || {})
  
  const updatePermission = async (resource: string, action: string, value: boolean) => {
    const newPermissions = {
      ...permissions,
      [resource]: {
        ...permissions[resource],
        [action]: value
      }
    }
    
    await authClient.organization.updateMember({
      memberId: member.id,
      data: {
        permissions: newPermissions
      }
    })
    
    setPermissions(newPermissions)
  }
  
  return (
    <div className="space-y-4">
      <h3>Permissions for {member.user.name}</h3>
      
      {Object.entries(PERMISSION_TEMPLATES[member.role] || {}).map(([resource, actions]) => (
        <Card key={resource}>
          <CardHeader>
            <CardTitle>{resource}</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(actions).map(([action, defaultValue]) => (
              <div key={action} className="flex items-center justify-between">
                <Label>{action}</Label>
                <Switch
                  checked={permissions[resource]?.[action] ?? defaultValue}
                  onCheckedChange={(checked) => updatePermission(resource, action, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

## API Usage

### Check Permission
```typescript
// Server-side
const canCreateJob = await checkPermission(userId, orgId, 'jobs', 'create')

// Client-side (React)
const canEditCandidate = usePermission('candidates', 'edit')
```

### Update Permissions
```typescript
// Update specific member permissions
await authClient.organization.updateMember({
  memberId: "member-id",
  data: {
    permissions: {
      jobs: { create: true, edit: true },
      candidates: { score: true }
    }
  }
})
```

### Batch Update Permissions
```typescript
// Apply template to all members with a specific role
const members = await auth.api.listMembers({ organizationId })
const recruiters = members.filter(m => m.role === 'recruiter')

await Promise.all(recruiters.map(member => 
  auth.api.updateMember({
    memberId: member.id,
    data: {
      permissions: PERMISSION_TEMPLATES.recruiter
    }
  })
))
```

## Best Practices

1. **Use Templates**: Start with role-based templates and customize as needed
2. **Audit Changes**: Log all permission changes for security
3. **Cache Permissions**: Cache permission checks to avoid repeated database queries
4. **Progressive Enhancement**: Show UI elements by default, disable on permission check
5. **Batch Operations**: Update multiple members' permissions together
6. **Version Control**: Keep track of permission template versions

## Security Considerations

- Always validate permissions server-side
- Don't expose all permissions to the client
- Rate limit permission checks
- Audit permission changes
- Implement permission inheritance carefully
- Regular permission reviews

## Migration Path

1. Start with role-based permissions (Better Auth default)
2. Add custom permissions as needed
3. Gradually migrate complex permissions to the new system
4. Maintain backwards compatibility