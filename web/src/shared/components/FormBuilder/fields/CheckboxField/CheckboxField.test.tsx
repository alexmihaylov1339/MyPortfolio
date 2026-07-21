import { render, screen } from '@testing-library/react';
import CheckboxField from './CheckboxField';
import type { CheckboxFieldConfig } from '../types';

describe('CheckboxField', () => {
  const baseConfig: CheckboxFieldConfig = {
    type: 'checkbox',
    name: 'terms',
    label: 'I agree to the terms and conditions',
  };

  describe('Rendering', () => {
    it('renders checkbox with label', () => {
      render(<CheckboxField config={baseConfig} />);

      expect(screen.getByLabelText('I agree to the terms and conditions')).toBeInTheDocument();
      expect(screen.getByLabelText('I agree to the terms and conditions')).toHaveAttribute('type', 'checkbox');
    });

    it('renders with correct name attribute', () => {
      render(<CheckboxField config={baseConfig} />);

      expect(screen.getByLabelText('I agree to the terms and conditions')).toHaveAttribute('name', 'terms');
    });

    it('renders with correct id', () => {
      render(<CheckboxField config={baseConfig} />);

      expect(screen.getByLabelText('I agree to the terms and conditions')).toHaveAttribute('id', 'terms');
    });

    it('renders label text after checkbox', () => {
      const { container } = render(<CheckboxField config={baseConfig} />);

      const label = container.querySelector('label');
      const checkbox = label?.querySelector('input[type="checkbox"]');
      const labelText = label?.textContent;

      expect(checkbox).toBeInTheDocument();
      expect(labelText).toContain('I agree to the terms and conditions');
    });
  });

  describe('Default Checked State', () => {
    it('is unchecked by default', () => {
      render(<CheckboxField config={baseConfig} />);

      expect(screen.getByLabelText('I agree to the terms and conditions')).not.toBeChecked();
    });

    it('is checked when defaultChecked is true', () => {
      const config: CheckboxFieldConfig = {
        ...baseConfig,
        defaultChecked: true,
      };

      render(<CheckboxField config={config} />);
      expect(screen.getByLabelText('I agree to the terms and conditions')).toBeChecked();
    });

    it('is unchecked when defaultChecked is false', () => {
      const config: CheckboxFieldConfig = {
        ...baseConfig,
        defaultChecked: false,
      };

      render(<CheckboxField config={config} />);
      expect(screen.getByLabelText('I agree to the terms and conditions')).not.toBeChecked();
    });
  });

  describe('Required Field', () => {
    it('shows asterisk for required fields', () => {
      const config: CheckboxFieldConfig = {
        ...baseConfig,
        required: true,
      };

      render(<CheckboxField config={config} />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('applies required attribute', () => {
      const config: CheckboxFieldConfig = {
        ...baseConfig,
        required: true,
      };

      render(<CheckboxField config={config} />);
      expect(screen.getByLabelText(/I agree to the terms and conditions/)).toBeRequired();
    });

    it('does not show asterisk for optional fields', () => {
      const config: CheckboxFieldConfig = {
        ...baseConfig,
        required: false,
      };

      render(<CheckboxField config={config} />);
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables checkbox when disabled prop is true', () => {
      render(<CheckboxField config={baseConfig} disabled={true} />);

      expect(screen.getByLabelText('I agree to the terms and conditions')).toBeDisabled();
    });

    it('disables checkbox when config.disabled is true', () => {
      const config: CheckboxFieldConfig = {
        ...baseConfig,
        disabled: true,
      };

      render(<CheckboxField config={config} />);
      expect(screen.getByLabelText('I agree to the terms and conditions')).toBeDisabled();
    });

    it('enables checkbox by default', () => {
      render(<CheckboxField config={baseConfig} />);

      expect(screen.getByLabelText('I agree to the terms and conditions')).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('associates label with checkbox', () => {
      render(<CheckboxField config={baseConfig} />);

      const checkbox = screen.getByLabelText('I agree to the terms and conditions');
      expect(checkbox).toHaveAttribute('id', 'terms');
    });

    it('is keyboard accessible', () => {
      render(<CheckboxField config={baseConfig} />);

      const checkbox = screen.getByLabelText('I agree to the terms and conditions');
      checkbox.focus();
      expect(checkbox).toHaveFocus();
    });

    it('has checkbox role', () => {
      render(<CheckboxField config={baseConfig} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles short labels', () => {
      const config: CheckboxFieldConfig = {
        ...baseConfig,
        label: 'OK',
      };

      render(<CheckboxField config={config} />);
      expect(screen.getByLabelText('OK')).toBeInTheDocument();
    });

    it('handles long labels', () => {
      const config: CheckboxFieldConfig = {
        ...baseConfig,
        label: 'I agree to the very long terms and conditions that might span multiple lines and contain lots of important legal text',
      };

      render(<CheckboxField config={config} />);
      expect(screen.getByLabelText(/I agree to the very long terms/)).toBeInTheDocument();
    });
  });
});

