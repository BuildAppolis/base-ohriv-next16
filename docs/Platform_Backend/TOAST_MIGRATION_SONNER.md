# Toast System Migration to Sonner

This document outlines the migration from the current toast system to Sonner for web.

## Overview

We're migrating from our current toast implementation to [Sonner](https://sonner.emilkowal.ski/), a modern toast library with better animations and developer experience.

## Installation

```bash
pnpm add sonner
```

## Basic Setup

### 1. Add Toaster Component to Root Layout

```tsx
// app/layout.tsx
import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

### 2. Configure Toaster (Optional)

```tsx
<Toaster
  position="bottom-right"
  toastOptions={{
    duration: 4000,
    style: {
      background: '#363636',
      color: '#fff',
    },
    classNames: {
      error: 'bg-red-400',
      success: 'bg-green-400',
      warning: 'bg-orange-400',
      info: 'bg-blue-400',
    },
  }}
/>
```

## Migration Guide

### Current Implementation
```tsx
// Current (shadcn/ui toast)
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

toast({
  title: 'Success',
  description: 'Operation completed successfully',
  variant: 'default' // or 'destructive'
})
```

### New Implementation
```tsx
// New (sonner)
import { toast } from 'sonner'

// Basic toast
toast('Operation completed successfully')

// With title
toast.success('Success', {
  description: 'Operation completed successfully',
})

// Error toast
toast.error('Error', {
  description: 'Something went wrong',
})
```

## All Toast Methods

### 1. Basic Toast
```tsx
toast('Hello World')
```

### 2. Success Toast
```tsx
toast.success('Successfully saved!')

// With description
toast.success('Success', {
  description: 'Your changes have been saved.',
})
```

### 3. Error Toast
```tsx
toast.error('Error occurred')

// With description
toast.error('Error', {
  description: 'Failed to save changes. Please try again.',
})
```

### 4. Warning Toast
```tsx
toast.warning('Warning', {
  description: 'This action cannot be undone.',
})
```

### 5. Info Toast
```tsx
toast.info('Info', {
  description: 'New update available.',
})
```

### 6. Loading/Promise Toast
```tsx
// For async operations
const promise = fetch('/api/data')

toast.promise(promise, {
  loading: 'Loading...',
  success: 'Data loaded successfully',
  error: 'Failed to load data',
})

// Or with more control
toast.promise(
  saveData(),
  {
    loading: 'Saving...',
    success: (data) => {
      return `${data.name} has been saved`
    },
    error: (err) => `Error: ${err.message}`,
  }
)
```

### 7. Custom Toast
```tsx
toast.custom((t) => (
  <div>
    <p>Custom toast with id: {t}</p>
  </div>
))
```

### 8. Toast with Action
```tsx
toast('Event has been created', {
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo')
  },
})
```

## Advanced Options

### Duration
```tsx
toast('This will last 10 seconds', {
  duration: 10000, // milliseconds
})

// Persist toast
toast('This will not auto-dismiss', {
  duration: Infinity,
})
```

### Positioning
```tsx
// Individual toast position
toast('Custom position', {
  position: 'top-center',
})
```

### Styling
```tsx
toast('Styled toast', {
  style: {
    background: 'red',
    color: 'white',
  },
  className: 'my-custom-class',
})
```

### Dismissing Toasts
```tsx
// Dismiss specific toast
const toastId = toast('Loading...')
toast.dismiss(toastId)

// Dismiss all toasts
toast.dismiss()
```

### Icons
```tsx
toast('Custom icon', {
  icon: '👍',
})

// Or with React component
toast('Custom icon', {
  icon: <MyIcon />,
})
```

## Common Migration Patterns

### 1. Form Submission
```tsx
// Before
const { toast } = useToast()

const onSubmit = async (data) => {
  try {
    await saveData(data)
    toast({
      title: 'Success',
      description: 'Data saved successfully',
    })
  } catch (error) {
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    })
  }
}

// After
import { toast } from 'sonner'

const onSubmit = async (data) => {
  try {
    await saveData(data)
    toast.success('Data saved successfully')
  } catch (error) {
    toast.error('Failed to save data', {
      description: error.message,
    })
  }
}

// Or even simpler with promise
const onSubmit = async (data) => {
  toast.promise(saveData(data), {
    loading: 'Saving...',
    success: 'Data saved successfully',
    error: (err) => `Error: ${err.message}`,
  })
}
```

### 2. Delete Confirmation
```tsx
// Before
toast({
  title: 'Item deleted',
  description: 'The item has been permanently deleted.',
})

// After
toast.success('Item deleted', {
  description: 'The item has been permanently deleted.',
  action: {
    label: 'Undo',
    onClick: () => restoreItem(),
  },
})
```

### 3. API Errors
```tsx
// Before
if (error.response?.status === 403) {
  toast({
    title: 'Access Denied',
    description: 'You don't have permission to perform this action.',
    variant: 'destructive',
  })
}

// After
if (error.response?.status === 403) {
  toast.error('Access Denied', {
    description: 'You don't have permission to perform this action.',
  })
}
```

## Theming

### Light/Dark Mode
Sonner automatically adapts to your theme. For custom theming:

```tsx
<Toaster
  theme="light" // or "dark", "system"
  toastOptions={{
    style: {
      background: 'var(--background)',
      color: 'var(--foreground)',
      border: '1px solid var(--border)',
    },
  }}
/>
```

### Global Styles
```css
/* In your global CSS */
[data-sonner-toaster] {
  --width: 356px;
  --gap: 14px;
  --offset: 24px;
}

[data-sonner-toast] {
  --normal-bg: hsl(var(--background));
  --normal-text: hsl(var(--foreground));
  --success-bg: hsl(var(--success));
  --error-bg: hsl(var(--destructive));
}
```

## Migration Checklist

1. [ ] Install sonner: `pnpm add sonner`
2. [ ] Add `<Toaster />` to root layout
3. [ ] Configure Toaster with desired options
4. [ ] Search for all `useToast()` imports
5. [ ] Replace with `import { toast } from 'sonner'`
6. [ ] Update all toast calls to use new API
7. [ ] Remove old toast components and hooks
8. [ ] Update any custom toast styles
9. [ ] Test all toast notifications

## TypeScript Support

Sonner is fully typed. Custom data can be passed:

```tsx
interface ToastData {
  userId: string
  action: string
}

toast.success<ToastData>('Action completed', {
  data: {
    userId: '123',
    action: 'update',
  },
})
```

## Benefits of Migration

1. **Better DX**: Simpler API with less boilerplate
2. **Animations**: Smooth enter/exit animations out of the box
3. **Promise Support**: Built-in loading states for async operations
4. **Stacking**: Better toast stacking and positioning
5. **Accessibility**: Better keyboard and screen reader support
6. **Performance**: Optimized rendering and animations
7. **Customization**: More flexible styling options

## Reference Links

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [Sonner GitHub](https://github.com/emilkowalski/sonner)
- [Examples](https://sonner.emilkowal.ski/examples)