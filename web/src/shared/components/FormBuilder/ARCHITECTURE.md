# FormBuilder Architecture

## Design Principles

This component follows **SOLID principles** for clean, maintainable code:

### Single Responsibility Principle (SRP)

Each component has ONE clear responsibility:

- **FormBuilder** - Manages form state, submission, and loading
- **Field** - Maps field configs to appropriate field components
- **TextField/EmailField/PasswordField** - Each renders ONE specific input type
- **NumberField/TextareaField/etc** - Each handles ONE field type

### Open/Closed Principle (OCP)

- Open for extension: Easy to add new field types
- Closed for modification: Adding fields doesn't change existing code

### Component Hierarchy

```
FormBuilder (Form logic + state)
    └── Field (Mapping/Routing logic)
        ├── TextField (Renders text input)
        ├── EmailField (Renders email input)
        ├── PasswordField (Renders password input)
        ├── NumberField (Renders number input)
        ├── TextareaField (Renders textarea)
        ├── SelectField (Renders dropdown)
        ├── CheckboxField (Renders checkbox)
        └── RadioField (Renders radio group)
```

## Why Separate Text/Email/Password?

### Before (Bad):

```typescript
// One component handling 3 types - violates SRP
<TextField type="text" />
<TextField type="email" />
<TextField type="password" />
```

**Problems:**

- TextField has 3 responsibilities
- Hard to add field-specific features (e.g., password strength meter)
- Mixing concerns

### After (Good):

```typescript
// Each component has ONE responsibility
<TextField />       // Only handles text
<EmailField />      // Only handles email (can add validation UI)
<PasswordField />   // Only handles password (can add strength meter)
```

**Benefits:**

- ✅ Each field can be customized independently
- ✅ Easier to test
- ✅ Clear separation of concerns
- ✅ Future-proof (add password visibility toggle, email validation, etc.)

## Why Separate Field Component?

### Before (Bad):

```typescript
// FormBuilder.tsx
const renderField = (field: FieldConfig) => {
  switch (field.type) {
    case "text":
      return <TextField />;
    case "email":
      return <EmailField />;
    // ... 20 more lines
  }
};
```

**Problems:**

- FormBuilder does TWO things: form logic + field mapping
- Hard to reuse mapping logic
- Switch statement in component code

### After (Good):

```typescript
// FormBuilder.tsx (clean!)
{
  fields.map((field) => <Field config={field} />);
}

// Field.tsx (dedicated mapper)
switch (config.type) {
  case "text":
    return <TextField />;
  case "email":
    return <EmailField />;
}
```

**Benefits:**

- ✅ FormBuilder focused on form logic only
- ✅ Field component reusable
- ✅ Easy to test mapping logic independently
- ✅ Follows SRP

## File Structure

```
FormBuilder/
├── FormBuilder.tsx          # Form logic (submission, loading)
├── Field.tsx                # Field routing/mapping
├── types.ts                 # Type definitions
├── index.ts                 # Exports
├── README.md               # Usage documentation
├── ARCHITECTURE.md         # This file
└── fields/
    ├── TextField.tsx       # Text input only
    ├── EmailField.tsx      # Email input only
    ├── PasswordField.tsx   # Password input only
    ├── NumberField.tsx     # Number input
    ├── TextareaField.tsx   # Textarea
    ├── SelectField.tsx     # Dropdown
    ├── CheckboxField.tsx   # Checkbox
    └── RadioField.tsx      # Radio group
```

## Adding a New Field Type

1. **Create config type** in `types.ts`:

```typescript
export interface DateFieldConfig extends BaseFieldConfig {
  type: "date";
  min?: string;
  max?: string;
}
```

2. **Create field component** in `fields/DateField.tsx`:

```typescript
export default function DateField({ config, disabled }: DateFieldProps) {
  return <input type="date" min={config.min} max={config.max} />;
}
```

3. **Add to Field.tsx** mapping:

```typescript
case 'date':
  return <DateField config={config} disabled={disabled} />;
```

4. **Done!** - FormBuilder doesn't change at all

## Benefits of This Architecture

1. **Maintainable** - Each file has one clear purpose
2. **Testable** - Each component can be tested in isolation
3. **Extensible** - Add new fields without modifying existing code
4. **Reusable** - Field component can be used elsewhere
5. **Type-safe** - TypeScript ensures correct config for each field
6. **SOLID** - Follows all SOLID principles

## Example: Adding Password Strength

With this architecture, it's easy:

```typescript
// PasswordField.tsx
export default function PasswordField({
  config,
  disabled,
}: PasswordFieldProps) {
  const [strength, setStrength] = useState(0);

  return (
    <>
      <input
        type="password"
        onChange={(e) => setStrength(calculateStrength(e.target.value))}
      />
      <PasswordStrengthMeter strength={strength} />
    </>
  );
}
```

**No other files need to change!** That's the power of SRP.
