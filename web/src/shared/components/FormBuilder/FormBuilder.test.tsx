import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormBuilder from './FormBuilder';
import type { FieldConfig } from './types';

describe('FormBuilder', () => {
  describe('Basic Rendering', () => {
    it('renders a form with text fields', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username' },
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('renders multiple fields', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username' },
        { type: 'email', name: 'email', label: 'Email' },
        { type: 'password', name: 'password', label: 'Password' },
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('renders custom submit label', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username' },
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} submitLabel="Save Changes" />);

      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });

    it('hides delete button by default', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username' },
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('renders delete button when enabled', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username' },
      ];
      const onSubmit = jest.fn();
      const onDelete = jest.fn();

      render(
        <FormBuilder
          fields={fields}
          onSubmit={onSubmit}
          showDeleteButton
          deleteLabel="Delete Deck"
          onDelete={onDelete}
        />,
      );

      expect(screen.getByRole('button', { name: 'Delete Deck' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with form values when submitted', async () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username' },
        { type: 'email', name: 'email', label: 'Email' },
      ];
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'john_doe' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });

      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          username: 'john_doe',
          email: 'john@example.com',
        });
      });
    });

    it('handles checkbox values correctly', async () => {
      const fields: FieldConfig[] = [
        { type: 'checkbox', name: 'terms', label: 'I agree to terms' },
      ];
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      const checkbox = screen.getByLabelText('I agree to terms');
      fireEvent.click(checkbox);
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ terms: true });
      });
    });

    it('handles number values correctly', async () => {
      const fields: FieldConfig[] = [
        { type: 'number', name: 'age', label: 'Age' },
      ];
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      fireEvent.change(screen.getByLabelText('Age'), { target: { value: '25' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ age: 25 });
      });
    });

    it('resets form after submission when resetOnSubmit is true', async () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username' },
      ];
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(<FormBuilder fields={fields} onSubmit={onSubmit} resetOnSubmit={true} />);

      const input = screen.getByLabelText('Username') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'john_doe' } });
      expect(input.value).toBe('john_doe');

      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('does not reset form after submission when resetOnSubmit is false', async () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username' },
      ];
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(<FormBuilder fields={fields} onSubmit={onSubmit} resetOnSubmit={false} />);

      const input = screen.getByLabelText('Username') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'john_doe' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });

      expect(input.value).toBe('john_doe');
    });

    it('calls onDelete when delete button is clicked', async () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username' },
      ];
      const onSubmit = jest.fn();
      const onDelete = jest.fn().mockResolvedValue(undefined);

      render(
        <FormBuilder
          fields={fields}
          onSubmit={onSubmit}
          showDeleteButton
          onDelete={onDelete}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when provided', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username' },
      ];
      const onSubmit = jest.fn();

      render(
        <FormBuilder
          fields={fields}
          onSubmit={onSubmit}
          errorMessage="Invalid credentials"
        />
      );

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('does not display error message when not provided', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username' },
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('disables all fields during submission', async () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username' },
        { type: 'email', name: 'email', label: 'Email' },
      ];
      let resolveSubmit: () => void;
      const onSubmit = jest.fn(() => new Promise<void>(resolve => {
        resolveSubmit = resolve;
      }));

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      const usernameInput = screen.getByLabelText('Username');
      const emailInput = screen.getByLabelText('Email');

      fireEvent.change(usernameInput, { target: { value: 'john' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(usernameInput).toBeDisabled();
        expect(emailInput).toBeDisabled();
      });

      resolveSubmit!();
    });

    it('shows loading state on submit button', async () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username' },
      ];
      let resolveSubmit: () => void;
      const onSubmit = jest.fn(() => new Promise<void>(resolve => {
        resolveSubmit = resolve;
      }));

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'john' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      resolveSubmit!();
    });
  });

  describe('Field Types', () => {
    it('renders all field types correctly', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username' },
        { type: 'email', name: 'email', label: 'Email' },
        { type: 'password', name: 'password', label: 'Password' },
        { type: 'number', name: 'age', label: 'Age' },
        { type: 'textarea', name: 'bio', label: 'Biography' },
        { type: 'select', name: 'country', label: 'Country', options: [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
        ]},
        { type: 'checkbox', name: 'terms', label: 'I agree to terms' },
        { type: 'radio', name: 'gender', label: 'Gender', options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
        ]},
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      expect(screen.getByLabelText('Username')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText('Age')).toHaveAttribute('type', 'number');
      expect(screen.getByLabelText('Biography')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByLabelText('I agree to terms')).toHaveAttribute('type', 'checkbox');
      expect(screen.getByLabelText('Male')).toHaveAttribute('type', 'radio');
    });
  });

  describe('Required Fields', () => {
    it('marks required fields with asterisk', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username', required: true },
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('applies required attribute to required fields', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username', required: true },
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      expect(screen.getByLabelText(/Username/)).toBeRequired();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty fields array', () => {
      const onSubmit = jest.fn();

      render(<FormBuilder fields={[]} onSubmit={onSubmit} />);

      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('handles undefined values in form submission', async () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'Username', required: false },
      ];
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ username: undefined });
      });
    });

    it('handles number field with non-numeric input', async () => {
      const fields: FieldConfig[] = [
        { type: 'number', name: 'age', label: 'Age' },
      ];
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      // Browser input type="number" prevents non-numeric input, so test empty submission
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ age: undefined });
      });
    });
  });
});
