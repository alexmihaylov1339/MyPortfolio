import { render, screen } from '@testing-library/react';
import TextField from './TextField';
import type { TextFieldConfig } from './types';

describe('TextField', () => {
  const baseConfig: TextFieldConfig = {
    type: 'text',
    name: 'username',
    label: 'Username',
  };

  describe('Rendering', () => {
    it('renders text input with label', () => {
      render(<TextField config={baseConfig} />);

      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toHaveAttribute('type', 'text');
    });

    it('renders with correct name attribute', () => {
      render(<TextField config={baseConfig} />);

      expect(screen.getByLabelText('Username')).toHaveAttribute('name', 'username');
    });

    it('renders with correct id matching label', () => {
      render(<TextField config={baseConfig} />);

      const input = screen.getByLabelText('Username');
      expect(input).toHaveAttribute('id', 'username');
    });

    it('renders with placeholder when provided', () => {
      const config: TextFieldConfig = {
        ...baseConfig,
        placeholder: 'Enter your username',
      };

      render(<TextField config={config} />);
      expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    });

    it('renders without placeholder when not provided', () => {
      render(<TextField config={baseConfig} />);

      const input = screen.getByLabelText('Username');
      expect(input).not.toHaveAttribute('placeholder');
    });
  });

  describe('Required Field', () => {
    it('shows asterisk for required fields', () => {
      const config: TextFieldConfig = {
        ...baseConfig,
        required: true,
      };

      render(<TextField config={config} />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('applies required attribute', () => {
      const config: TextFieldConfig = {
        ...baseConfig,
        required: true,
      };

      render(<TextField config={config} />);
      expect(screen.getByLabelText(/Username/)).toBeRequired();
    });

    it('does not show asterisk for optional fields', () => {
      const config: TextFieldConfig = {
        ...baseConfig,
        required: false,
      };

      render(<TextField config={config} />);
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<TextField config={baseConfig} disabled={true} />);

      expect(screen.getByLabelText('Username')).toBeDisabled();
    });

    it('disables input when config.disabled is true', () => {
      const config: TextFieldConfig = {
        ...baseConfig,
        disabled: true,
      };

      render(<TextField config={config} />);
      expect(screen.getByLabelText('Username')).toBeDisabled();
    });

    it('disables input when both disabled prop and config.disabled are true', () => {
      const config: TextFieldConfig = {
        ...baseConfig,
        disabled: true,
      };

      render(<TextField config={config} disabled={true} />);
      expect(screen.getByLabelText('Username')).toBeDisabled();
    });

    it('enables input by default', () => {
      render(<TextField config={baseConfig} />);

      expect(screen.getByLabelText('Username')).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('associates label with input via htmlFor and id', () => {
      render(<TextField config={baseConfig} />);

      const input = screen.getByLabelText('Username');
      expect(input).toHaveAttribute('id', 'username');
    });

    it('is keyboard accessible', () => {
      render(<TextField config={baseConfig} />);

      const input = screen.getByLabelText('Username');
      input.focus();
      expect(input).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty label gracefully', () => {
      const config: TextFieldConfig = {
        ...baseConfig,
        label: '',
      };

      const { container } = render(<TextField config={config} />);
      expect(container.querySelector('input')).toBeInTheDocument();
    });

    it('handles special characters in name', () => {
      const config: TextFieldConfig = {
        ...baseConfig,
        name: 'user-name_123',
      };

      render(<TextField config={config} />);
      expect(screen.getByLabelText('Username')).toHaveAttribute('name', 'user-name_123');
    });

    it('handles long labels', () => {
      const config: TextFieldConfig = {
        ...baseConfig,
        label: 'This is a very long label that might wrap to multiple lines',
      };

      render(<TextField config={config} />);
      expect(screen.getByLabelText(/This is a very long label/)).toBeInTheDocument();
    });
  });
});

