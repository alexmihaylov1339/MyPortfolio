# FormBuilder Component

A flexible, reusable form builder component that supports multiple field types with built-in validation and loading states.

## Features

- ✅ Multiple field types (text, email, password, number, textarea, select, checkbox, radio)
- ✅ Built-in loading states with `useTransition`
- ✅ Automatic form reset on submit (configurable)
- ✅ Error message display
- ✅ TypeScript type safety
- ✅ Consistent styling across all fields
- ✅ Easy to extend with new field types

## Installation

Already installed! Import from:

```typescript
import { FormBuilder, FieldConfig } from "@shared/components";
```

## Basic Usage

```typescript
import { FormBuilder, FieldConfig } from "@shared/components";

const fields: FieldConfig[] = [
  {
    type: "text",
    name: "username",
    label: "Username",
    required: true,
  },
  {
    type: "email",
    name: "email",
    label: "Email",
    required: true,
  },
];

function MyForm() {
  const handleSubmit = async (formData: FormData) => {
    const data = Object.fromEntries(formData.entries());
    await fetch("/api/endpoint", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  return (
    <FormBuilder
      fields={fields}
      onSubmit={handleSubmit}
      submitLabel="Create Account"
      resetOnSubmit={true}
    />
  );
}
```

## Field Types

### Text Fields

```typescript
{
  type: 'text' | 'email' | 'password',
  name: 'fieldName',
  label: 'Field Label',
  required?: boolean,
  placeholder?: string,
  disabled?: boolean,
}
```

### Number Field

```typescript
{
  type: 'number',
  name: 'age',
  label: 'Age',
  min?: number,
  max?: number,
  step?: number,
}
```

### Textarea

```typescript
{
  type: 'textarea',
  name: 'bio',
  label: 'Biography',
  rows?: number,
  cols?: number,
}
```

### Select Dropdown

```typescript
{
  type: 'select',
  name: 'country',
  label: 'Country',
  options: [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
  ],
}
```

### Checkbox

```typescript
{
  type: 'checkbox',
  name: 'terms',
  label: 'I agree to the terms',
  defaultChecked?: boolean,
}
```

### Radio Buttons

```typescript
{
  type: 'radio',
  name: 'plan',
  label: 'Choose a plan',
  options: [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
  ],
}
```

## Props

### FormBuilder Props

| Prop            | Type                                            | Default     | Description                        |
| --------------- | ----------------------------------------------- | ----------- | ---------------------------------- |
| `fields`        | `FieldConfig[]`                                 | required    | Array of field configurations      |
| `onSubmit`      | `(formData: FormData) => Promise<void> \| void` | required    | Submit handler function            |
| `submitLabel`   | `string`                                        | `'Submit'`  | Text for submit button             |
| `errorMessage`  | `string`                                        | `undefined` | Error message to display           |
| `resetOnSubmit` | `boolean`                                       | `true`      | Reset form after successful submit |

## Examples

See `examples.tsx` for complete examples including:

- Simple text forms
- Contact forms with multiple field types
- Card creation forms
- Survey forms with radio buttons

## Extending with New Field Types

1. Add the field type to `FieldType` in `types.ts`
2. Create a config interface extending `BaseFieldConfig`
3. Add to the `FieldConfig` union type
4. Create a new component in `fields/`
5. Add a case in `FormBuilder.tsx` `renderField()` switch statement

## File Structure

```
FormBuilder/
├── FormBuilder.tsx       # Main component
├── types.ts             # TypeScript definitions
├── index.ts             # Exports
├── examples.tsx         # Usage examples
├── README.md           # This file
└── fields/
    ├── TextField.tsx
    ├── NumberField.tsx
    ├── TextareaField.tsx
    ├── SelectField.tsx
    ├── CheckboxField.tsx
    └── RadioField.tsx
```

## Migration from Old Form

Before:

```typescript
<form onSubmit={handleSubmit}>
  <input name="name" required />
  <input name="email" type="email" />
  <button>Submit</button>
</form>
```

After:

```typescript
<FormBuilder
  fields={[
    { type: "text", name: "name", label: "Name", required: true },
    { type: "email", name: "email", label: "Email" },
  ]}
  onSubmit={handleSubmit}
/>
```

## Notes

- All fields automatically receive loading state during submission
- Form data is provided as `FormData` object in `onSubmit`
- Convert to object with: `Object.fromEntries(formData.entries())`
- Required fields show a red asterisk (\*)
- Submit button shows "Submitting..." during async operations
