# Notification System

A global notification system using React Portals to display toast messages at the top of the page.

## Features

- ✅ **Portal-based rendering** - Notifications appear at the root level, above all other content
- ✅ **Auto-dismiss** - Configurable timeout with default 3 seconds
- ✅ **Multiple types** - `success`, `error`, `info`, `warning`
- ✅ **Manual dismiss** - Close button on each notification
- ✅ **Stacked notifications** - Multiple notifications display vertically
- ✅ **Self-contained logic** - Timeout management handled internally

## Setup

The `NotificationProvider` is already set up in the root layout:

```typescript
// app/layout.tsx
<QueryProvider>
  <NotificationProvider>
    {children}
  </NotificationProvider>
</QueryProvider>
```

## Usage

### Basic Usage

```typescript
import { useNotification } from '@shared/providers';

function MyComponent() {
  const { success, error, info, warning } = useNotification();

  const handleAction = () => {
    success('Operation completed successfully!');
  };

  const handleError = () => {
    error('Something went wrong!');
  };

  return (
    <button onClick={handleAction}>Do Something</button>
  );
}
```

### Custom Duration

```typescript
const { success } = useNotification();

// Show for 5 seconds instead of default 3
success('This will stay for 5 seconds', 5000);

// Show indefinitely (set to 0 or negative)
success('This stays until closed manually', 0);
```

### Generic Method

```typescript
const { showNotification } = useNotification();

showNotification('Custom message', 'info', 4000);
```

## API

### `useNotification()` Hook

Returns an object with the following methods:

- `success(message: string, duration?: number)` - Show success notification
- `error(message: string, duration?: number)` - Show error notification
- `info(message: string, duration?: number)` - Show info notification
- `warning(message: string, duration?: number)` - Show warning notification
- `showNotification(message: string, type: NotificationType, duration?: number)` - Generic method

### Types

```typescript
type NotificationType = 'success' | 'error' | 'info' | 'warning';
```

### Default Values

- `duration`: 3000ms (3 seconds)
- `position`: Top right corner
- `z-index`: 9999

## Example with useService

```typescript
const { success, error } = useNotification();

const createDeck = useService(deckService.create, {
  onSuccess: (data) => {
    success(`Deck "${data.name}" created successfully!`);
  },
  onError: () => {
    error('Failed to create deck. Please try again.');
  },
});
```

## Styling

Notifications use SCSS modules with color variables from `@/styles/colors.scss`:

- Success: Green background with dark green border
- Error: Red background with dark red border
- Info: Blue background with dark blue border
- Warning: Yellow background with dark yellow border

To customize, edit:
- `Notification.module.scss` - Individual notification styles
- `NotificationContainer.module.scss` - Container positioning
- `@/styles/colors.scss` - Color variables

## Architecture

1. **NotificationProvider** - Context provider that manages notification state
2. **NotificationContainer** - Portal component that renders notifications
3. **Notification** - Individual notification component with auto-dismiss logic
4. **useNotification** - Hook to access notification methods from any component


