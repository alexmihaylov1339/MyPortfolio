import { render, screen } from '@testing-library/react';
import EmailField from './EmailField';
import type { EmailFieldConfig } from './types';

describe('EmailField', () => {
  const baseConfig: EmailFieldConfig = {
    type: 'email',
    name: 'email',
    label: 'Email Address',
  };

  describe('Rendering', () => {
    it('renders email input with label', () => {
      render(<EmailField config={baseConfig} />);

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toHaveAttribute('type', 'email');
    });

    it('renders with correct name attribute', () => {
      render(<EmailField config={baseConfig} />);

      expect(screen.getByLabelText('Email Address')).toHaveAttribute('name', 'email');
    });

    it('renders with correct id', () => {
      render(<EmailField config={baseConfig} />);

      expect(screen.getByLabelText('Email Address')).toHaveAttribute('id', 'email');
    });

    it('renders with placeholder', () => {
      const config: EmailFieldConfig = {
        ...baseConfig,
        placeholder: 'user@example.com',
      };

      render(<EmailField config={config} />);
      expect(screen.getByPlaceholderText('user@example.com')).toBeInTheDocument();
    });
  });

  describe('Required Field', () => {
    it('shows asterisk for required fields', () => {
      const config: EmailFieldConfig = {
        ...baseConfig,
        required: true,
      };

      render(<EmailField config={config} />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('applies required attribute', () => {
      const config: EmailFieldConfig = {
        ...baseConfig,
        required: true,
      };

      render(<EmailField config={config} />);
      expect(screen.getByLabelText(/Email Address/)).toBeRequired();
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<EmailField config={baseConfig} disabled={true} />);

      expect(screen.getByLabelText('Email Address')).toBeDisabled();
    });

    it('disables input when config.disabled is true', () => {
      const config: EmailFieldConfig = {
        ...baseConfig,
        disabled: true,
      };

      render(<EmailField config={config} />);
      expect(screen.getByLabelText('Email Address')).toBeDisabled();
    });

    it('enables input by default', () => {
      render(<EmailField config={baseConfig} />);

      expect(screen.getByLabelText('Email Address')).not.toBeDisabled();
    });
  });

  describe('Email Validation', () => {
    it('has email type for native browser validation', () => {
      render(<EmailField config={baseConfig} />);

      const input = screen.getByLabelText('Email Address');
      expect(input).toHaveAttribute('type', 'email');
    });
  });

  describe('Accessibility', () => {
    it('associates label with input', () => {
      render(<EmailField config={baseConfig} />);

      const input = screen.getByLabelText('Email Address');
      expect(input).toHaveAttribute('id', 'email');
    });

    it('is keyboard accessible', () => {
      render(<EmailField config={baseConfig} />);

      const input = screen.getByLabelText('Email Address');
      input.focus();
      expect(input).toHaveFocus();
    });
  });
});

