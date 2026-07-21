import { render, screen } from '@testing-library/react';
import NumberField from './NumberField';
import type { NumberFieldConfig } from '../types';

describe('NumberField', () => {
  const baseConfig: NumberFieldConfig = {
    type: 'number',
    name: 'age',
    label: 'Age',
  };

  describe('Rendering', () => {
    it('renders number input with label', () => {
      render(<NumberField config={baseConfig} />);

      expect(screen.getByLabelText('Age')).toBeInTheDocument();
      expect(screen.getByLabelText('Age')).toHaveAttribute('type', 'number');
    });

    it('renders with correct name attribute', () => {
      render(<NumberField config={baseConfig} />);

      expect(screen.getByLabelText('Age')).toHaveAttribute('name', 'age');
    });

    it('renders with correct id', () => {
      render(<NumberField config={baseConfig} />);

      expect(screen.getByLabelText('Age')).toHaveAttribute('id', 'age');
    });

    it('renders with placeholder', () => {
      const config: NumberFieldConfig = {
        ...baseConfig,
        placeholder: 'Enter your age',
      };

      render(<NumberField config={config} />);
      expect(screen.getByPlaceholderText('Enter your age')).toBeInTheDocument();
    });
  });

  describe('Number Constraints', () => {
    it('applies min attribute', () => {
      const config: NumberFieldConfig = {
        ...baseConfig,
        min: 18,
      };

      render(<NumberField config={config} />);
      expect(screen.getByLabelText('Age')).toHaveAttribute('min', '18');
    });

    it('applies max attribute', () => {
      const config: NumberFieldConfig = {
        ...baseConfig,
        max: 100,
      };

      render(<NumberField config={config} />);
      expect(screen.getByLabelText('Age')).toHaveAttribute('max', '100');
    });

    it('applies step attribute', () => {
      const config: NumberFieldConfig = {
        ...baseConfig,
        step: 5,
      };

      render(<NumberField config={config} />);
      expect(screen.getByLabelText('Age')).toHaveAttribute('step', '5');
    });

    it('applies all constraints together', () => {
      const config: NumberFieldConfig = {
        ...baseConfig,
        min: 0,
        max: 120,
        step: 1,
      };

      render(<NumberField config={config} />);
      const input = screen.getByLabelText('Age');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '120');
      expect(input).toHaveAttribute('step', '1');
    });

    it('does not apply constraints when not provided', () => {
      render(<NumberField config={baseConfig} />);

      const input = screen.getByLabelText('Age');
      expect(input).not.toHaveAttribute('min');
      expect(input).not.toHaveAttribute('max');
      expect(input).not.toHaveAttribute('step');
    });
  });

  describe('Required Field', () => {
    it('shows asterisk for required fields', () => {
      const config: NumberFieldConfig = {
        ...baseConfig,
        required: true,
      };

      render(<NumberField config={config} />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('applies required attribute', () => {
      const config: NumberFieldConfig = {
        ...baseConfig,
        required: true,
      };

      render(<NumberField config={config} />);
      expect(screen.getByLabelText(/Age/)).toBeRequired();
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<NumberField config={baseConfig} disabled={true} />);

      expect(screen.getByLabelText('Age')).toBeDisabled();
    });

    it('disables input when config.disabled is true', () => {
      const config: NumberFieldConfig = {
        ...baseConfig,
        disabled: true,
      };

      render(<NumberField config={config} />);
      expect(screen.getByLabelText('Age')).toBeDisabled();
    });

    it('enables input by default', () => {
      render(<NumberField config={baseConfig} />);

      expect(screen.getByLabelText('Age')).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('associates label with input', () => {
      render(<NumberField config={baseConfig} />);

      const input = screen.getByLabelText('Age');
      expect(input).toHaveAttribute('id', 'age');
    });

    it('is keyboard accessible', () => {
      render(<NumberField config={baseConfig} />);

      const input = screen.getByLabelText('Age');
      input.focus();
      expect(input).toHaveFocus();
    });
  });
});

