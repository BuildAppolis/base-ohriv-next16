# Admin User Management System

## Overview

Comprehensive user management system for the admin panel, built on top of better-auth's admin plugin with enhanced UI and functionality.

## Features

### ✅ Implemented

#### 1. **Enhanced User Table**
- **Pagination**: Configurable page sizes (10, 25, 50, 100 per page)
- **Search**: By email or name with "contains" matching
- **Filtering**:
  - By role (admin, user, all)
  - By status (active, banned, all)
- **Sorting**: By name, email, or created date (ascending/descending)
- **Inline Actions**:
  - View user details
  - Quick role change
  - Revoke all sessions
  - Impersonate user
  - Delete user

#### 2. **User Detail Dialog** (6 Tabs)

**Profile Tab**:
- Edit name, email, role, profile image
- View user ID, Stripe customer ID
- View email verification and onboarding status
- Display creation and update timestamps

**Security Tab**:
- View 2FA status
- Ban/unban users with reason and expiration
- Send password reset emails (placeholder)
- Security recommendations based on account status

**Sessions Tab**:
- View all active and expired sessions
- Device information (browser, OS, device type)
- IP address and location
- Revoke individual sessions
- Revoke all sessions with confirmation
- Highlight impersonated sessions

**Organizations Tab**:
- View user's organization memberships
- Display role within each organization
- Show preferred organization
- *(Requires custom API endpoint for full functionality)*

**Accounts Tab**:
- View linked OAuth accounts (GitHub, Google, etc.)
- Display authentication methods
- Show account IDs and link dates
- *(Requires custom API endpoint for full functionality)*

**Activity Tab**:
- View user's audit log
- Activity summary statistics
- *(Requires custom API endpoint for full functionality)*

#### 3. **User Statistics Dashboard**
- Total users count
- Admin users count
- Verified users count
- Banned users count

#### 4. **Create User Dialog**
- Create new users with email, password, name, and role
- Form validation
- Success/error notifications

## Architecture

### Components

```
src/components/admin/user-management/
├── EnhancedUserTable.tsx       # Main table with filters and pagination
├── UserDetailDialog.tsx        # Tabbed dialog container
├── UserProfileTab.tsx          # Profile editing
├── UserSecurityTab.tsx         # Security settings and bans
├── UserSessionsTab.tsx         # Session management
├── UserOrganizationsTab.tsx    # Organization memberships
├── UserAccountsTab.tsx         # Linked OAuth accounts
├── UserActivityTab.tsx         # Audit log and activity
├── CreateUserDialog.tsx        # User creation form
├── UserStats.tsx               # Statistics cards
└── index.ts                    # Exports
```

### Types

```typescript
src/types/admin-user-management.ts
- AdminUser              # Extended user type with all fields
- AdminUserSession       # Session details
- AdminUserAccount       # OAuth account details
- AdminUserMembership    # Organization membership
- UserListQuery          # Query parameters for list API
- UserListResponse       # Paginated response
- UserFilters            # Filter state
- UserDetailTab          # Tab identifier type
```

## Better-Auth Integration

### Available APIs (Already Implemented)

```typescript
// User Management
client.admin.createUser({ email, password, name, role })
client.admin.listUsers({ query: { limit, offset, sortBy, etc. } })
client.admin.setRole({ userId, role })
client.admin.removeUser({ userId })

// Banning
client.admin.banUser({ userId, banReason, banExpiresIn })
client.admin.unbanUser({ userId })

// Sessions
client.admin.listUserSessions({ userId })
client.admin.revokeUserSession({ sessionToken })
client.admin.revokeUserSessions({ userId })

// Impersonation
client.admin.impersonateUser({ userId })
client.admin.stopImpersonating()
```

### Missing APIs (Need Custom Implementation)

These would enhance functionality but aren't critical:

```typescript
// User Profile Updates
updateUserProfile({ userId, name, email, image })
setEmailVerification({ userId, verified: boolean })

// Organization Management (if using organizations)
getUserMemberships({ userId })
addUserToOrganization({ userId, organizationId, role })
removeUserFromOrganization({ userId, organizationId })

// Account Management
getUserAccounts({ userId })

// Activity Tracking
getUserActivity({ userId, limit, offset })
```

## Usage Guide

### Basic Operations

**View User Details**:
1. Click the "View Details" action on any user row
2. Navigate through tabs to view different aspects
3. Changes in tabs automatically refresh the main table

**Create User**:
1. Click "Create User" button in header
2. Fill in email, password, name, and role
3. Submit to create

**Edit User Role**:
- Use dropdown in the table for quick role changes
- OR use Profile tab in detail dialog for editing

**Ban User**:
1. Open user detail dialog
2. Go to Security tab
3. Click "Ban User"
4. Enter reason and expiration date
5. Confirm

**Manage Sessions**:
1. Open user detail dialog
2. Go to Sessions tab
3. View all active sessions with device info
4. Revoke individual sessions or all at once

### Advanced Operations

**Search and Filter**:
```
1. Use search bar to find users by email or name
2. Select search field (email/name)
3. Apply role filter (admin/user/all)
4. Apply status filter (active/banned/all)
5. Results update automatically
```

**Pagination**:
```
1. Choose page size from dropdown (10/25/50/100)
2. Navigate pages with prev/next buttons
3. View total count and current page
```

**Sorting**:
```
1. Click column headers (Name, Email, Joined)
2. Click again to toggle asc/desc
3. Arrow icon shows current sort direction
```

## Customization

### Adding Custom Fields to Profile

```typescript
// 1. Update AdminUser type
export interface AdminUser {
  // ... existing fields
  customField: string;
}

// 2. Add field to UserProfileTab.tsx
<div className="space-y-2">
  <Label htmlFor="customField">Custom Field</Label>
  <Input
    id="customField"
    value={formData.customField}
    onChange={(e) => setFormData({ ...formData, customField: e.target.value })}
    disabled={!isEditing}
  />
</div>
```

### Adding Custom Filters

```typescript
// In EnhancedUserTable.tsx
const [customFilter, setCustomFilter] = useState<string>("all");

// Add to UI
<Select value={customFilter} onValueChange={setCustomFilter}>
  <SelectContent>
    <SelectItem value="all">All</SelectItem>
    <SelectItem value="value1">Value 1</SelectItem>
  </SelectContent>
</Select>

// Add to query
if (customFilter !== "all") {
  query.filterField = "customField";
  query.filterOperator = "eq";
  query.filterValue = customFilter;
}
```

### Adding Custom Actions

```typescript
// In EnhancedUserTable.tsx dropdown menu
<DropdownMenuItem onClick={() => handleCustomAction(user.id)}>
  <CustomIcon className="h-4 w-4 mr-2" />
  Custom Action
</DropdownMenuItem>

// Implement handler
const handleCustomAction = async (userId: string) => {
  setActionLoading(`custom-${userId}`);
  try {
    // Your custom logic
    toast.success("Action completed");
  } catch (error) {
    toast.error("Action failed");
  } finally {
    setActionLoading(null);
  }
};
```

## Extension Points

### 1. **Organization Management Tab**

To make UserOrganizationsTab fully functional:

```typescript
// Create API endpoint
// app/api/admin/users/[userId]/memberships/route.ts
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const memberships = await prisma.membership.findMany({
    where: { userId: params.userId },
    include: { organization: true },
  });
  return Response.json(memberships);
}

// Update UserOrganizationsTab.tsx query
queryFn: async () => {
  const response = await fetch(`/api/admin/users/${userId}/memberships`);
  return response.json();
}
```

### 2. **Accounts Tab**

To show linked OAuth accounts:

```typescript
// Create API endpoint
// app/api/admin/users/[userId]/accounts/route.ts
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const accounts = await prisma.account.findMany({
    where: { userId: params.userId },
  });
  return Response.json(accounts);
}

// Update UserAccountsTab.tsx query
queryFn: async () => {
  const response = await fetch(`/api/admin/users/${userId}/accounts`);
  return response.json();
}
```

### 3. **Activity Tab**

To show user activity from audit logs:

```typescript
// Create API endpoint
// app/api/admin/users/[userId]/activity/route.ts
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const activities = await prisma.auditLog.findMany({
    where: { userId: params.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return Response.json(activities);
}

// Update UserActivityTab.tsx query
queryFn: async () => {
  const response = await fetch(`/api/admin/users/${userId}/activity`);
  return response.json();
}
```

### 4. **Bulk Actions**

Add bulk operations for selected users:

```typescript
// Add selection state
const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

// Add checkbox column to table
<TableCell>
  <Checkbox
    checked={selectedUsers.has(user.id)}
    onCheckedChange={(checked) => {
      const newSet = new Set(selectedUsers);
      if (checked) newSet.add(user.id);
      else newSet.delete(user.id);
      setSelectedUsers(newSet);
    }}
  />
</TableCell>

// Add bulk action buttons
{selectedUsers.size > 0 && (
  <div className="flex gap-2">
    <Button onClick={handleBulkBan}>Ban Selected ({selectedUsers.size})</Button>
    <Button onClick={handleBulkDelete}>Delete Selected</Button>
  </div>
)}
```

### 5. **Export Functionality**

Add CSV/JSON export:

```typescript
const handleExport = (format: 'csv' | 'json') => {
  const exportData = data?.users.map(user => ({
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  }));

  if (format === 'csv') {
    // Convert to CSV and download
  } else {
    // Convert to JSON and download
  }
};
```

## Performance Considerations

### Current Limitations

1. **User Stats**: Currently fetches up to 1000 users to calculate stats. For large user bases, implement server-side aggregation.

2. **Session Device Detection**: Basic user-agent parsing. Consider using a proper user-agent parser library for better device detection.

3. **Real-time Updates**: Changes require manual refresh. Consider adding WebSocket support for real-time updates.

### Optimization Recommendations

1. **Implement Server-Side Aggregation**:
```typescript
// Create stats API endpoint
export async function GET() {
  const [total, admins, verified, banned] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.user.count({ where: { emailVerified: true } }),
    prisma.user.count({ where: { banned: true } }),
  ]);
  return Response.json({ total, admins, verified, banned });
}
```

2. **Add Request Debouncing for Search**:
```typescript
import { useDebouncedValue } from '@/hooks/use-debounced-value';

const debouncedSearch = useDebouncedValue(searchValue, 500);
```

3. **Implement Virtual Scrolling for Large Tables**:
Consider using `@tanstack/react-virtual` for very large user lists.

## Security Considerations

1. **Permission Checks**: Ensure better-auth admin middleware is protecting all routes
2. **Audit Logging**: All admin actions should be logged
3. **Rate Limiting**: Consider rate limiting for bulk operations
4. **Session Security**: Impersonation sessions have 1-hour limit by default

## Future Enhancements

- [ ] Bulk user operations (bulk ban, bulk delete, bulk role change)
- [ ] Advanced filters (date ranges, custom fields, multiple filters)
- [ ] Export functionality (CSV, JSON, PDF)
- [ ] User activity analytics and charts
- [ ] Email verification from admin panel
- [ ] Force password reset functionality
- [ ] User notes/annotations system
- [ ] Advanced user search with regex
- [ ] User comparison tool
- [ ] Automated ban expiration handling
- [ ] User import from CSV
- [ ] Custom user fields management
- [ ] User tags/labels system
- [ ] Real-time user status updates

## Troubleshooting

### Sessions not loading
- Ensure better-auth admin plugin is properly configured
- Check that user has active sessions
- Verify API permissions

### Pagination not working
- Check that `total` is returned from listUsers API
- Verify query parameters are being sent correctly
- Check browser console for errors

### Role changes not saving
- Verify user has admin permissions
- Check network tab for API errors
- Ensure better-auth admin plugin has setRole enabled

## Support

For issues or questions:
1. Check better-auth documentation: https://better-auth.com
2. Review type definitions in `/types/admin-user-management.ts`
3. Check browser console for errors
4. Verify API responses in network tab
