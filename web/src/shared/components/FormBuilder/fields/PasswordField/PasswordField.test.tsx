import { render, screen } from '@testing-library/react';
import PasswordField from './PasswordField';
import type { PasswordFieldConfig } from './types';

describe('PasswordField', () => {
  const baseConfig: PasswordFieldConfig = {
    type: 'password',
    name: 'password',
    label: 'Password',
  };

  describe('Rendering', () => {
    it('renders password input with label', () => {
      render(<PasswordField config={baseConfig} />);

      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });

    it('renders with correct name attribute', () => {
      render(<PasswordField config={baseConfig} />);

      expect(screen.getByLabelText('Password')).toHaveAttribute('name', 'password');
    });

    it('renders with correct id', () => {
      render(<PasswordField config={baseConfig} />);

      expect(screen.getByLabelText('Password')).toHaveAttribute('id', 'password');
    });

    it('renders with placeholder', () => {
      const config: PasswordFieldConfig = {
        ...baseConfig,
        placeholder: 'Enter your password',
      };

      render(<PasswordField config={config} />);
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    });

    it('has autocomplete attribute for password managers', () => {
      render(<PasswordField config={baseConfig} />);

      expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
    });
  });

  describe('Required Field', () => {
    it('shows asterisk for required fields', () => {
      const config: PasswordFieldConfig = {
        ...baseConfig,
        required: true,
      };

      render(<PasswordField config={config} />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('applies required attribute', () => {
      const config: PasswordFieldConfig = {
        ...baseConfig,
        required: true,
      };

      render(<PasswordField config={config} />);
      expect(screen.getByLabelText(/Password/)).toBeRequired();
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<PasswordField config={baseConfig} disabled={true} />);

      expect(screen.getByLabelText('Password')).toBeDisabled();
    });

    it('disables input when config.disabled is true', () => {
      const config: PasswordFieldConfig = {
        ...baseConfig,
        disabled: true,
      };

      render(<PasswordField config={config} />);
      expect(screen.getByLabelText('Password')).toBeDisabled();
    });

    it('enables input by default', () => {
      render(<PasswordField config={baseConfig} />);

      expect(screen.getByLabelText('Password')).not.toBeDisabled();
    });
  });

  describe('Security Features', () => {
    it('masks input text', () => {
      render(<PasswordField config={baseConfig} />);

      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  describe('Accessibility', () => {
    it('associates label with input', () => {
      render(<PasswordField config={baseConfig} />);

      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('id', 'password');
    });

    it('is keyboard accessible', () => {
      render(<PasswordField config={baseConfig} />);

      const input = screen.getByLabelText('Password');
      input.focus();
      expect(input).toHaveFocus();
    });
  });
});

