import { render, screen } from '@testing-library/react';
import SelectField from './SelectField';
import type { SelectFieldConfig } from '../types';

describe('SelectField', () => {
  const baseOptions = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
  ];

  const baseConfig: SelectFieldConfig = {
    type: 'select',
    name: 'country',
    label: 'Country',
    options: baseOptions,
  };

  describe('Rendering', () => {
    it('renders select dropdown with label', () => {
      render(<SelectField config={baseConfig} />);

      expect(screen.getByLabelText('Country')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders with correct name attribute', () => {
      render(<SelectField config={baseConfig} />);

      expect(screen.getByLabelText('Country')).toHaveAttribute('name', 'country');
    });

    it('renders with correct id', () => {
      render(<SelectField config={baseConfig} />);

      expect(screen.getByLabelText('Country')).toHaveAttribute('id', 'country');
    });

    it('renders default empty option with label', () => {
      render(<SelectField config={baseConfig} />);

      expect(screen.getByRole('option', { name: 'Country' })).toBeInTheDocument();
    });

    it('renders all provided options', () => {
      render(<SelectField config={baseConfig} />);

      expect(screen.getByRole('option', { name: 'United States' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'United Kingdom' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Canada' })).toBeInTheDocument();
    });

    it('renders options with correct values', () => {
      render(<SelectField config={baseConfig} />);

      const usOption = screen.getByRole('option', { name: 'United States' });
      const ukOption = screen.getByRole('option', { name: 'United Kingdom' });

      expect(usOption).toHaveValue('us');
      expect(ukOption).toHaveValue('uk');
    });

    it('renders correct number of options (including empty option)', () => {
      render(<SelectField config={baseConfig} />);

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(4); // 3 options + 1 empty option
    });
  });

  describe('Options', () => {
    it('handles empty options array', () => {
      const config: SelectFieldConfig = {
        ...baseConfig,
        options: [],
      };

      render(<SelectField config={config} />);

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(1); // Only empty option
    });

    it('handles single option', () => {
      const config: SelectFieldConfig = {
        ...baseConfig,
        options: [{ value: 'us', label: 'United States' }],
      };

      render(<SelectField config={config} />);

      expect(screen.getByRole('option', { name: 'United States' })).toBeInTheDocument();
    });

    it('handles many options', () => {
      const manyOptions = Array.from({ length: 50 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
      }));

      const config: SelectFieldConfig = {
        ...baseConfig,
        options: manyOptions,
      };

      render(<SelectField config={config} />);

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(51); // 50 options + 1 empty option
    });

    it('handles options with special characters', () => {
      const config: SelectFieldConfig = {
        ...baseConfig,
        options: [
          { value: 'special', label: 'Value with "quotes" & symbols!' },
        ],
      };

      render(<SelectField config={config} />);

      expect(screen.getByRole('option', { name: /Value with "quotes" & symbols!/ })).toBeInTheDocument();
    });
  });

  describe('Required Field', () => {
    it('shows asterisk for required fields', () => {
      const config: SelectFieldConfig = {
        ...baseConfig,
        required: true,
      };

      render(<SelectField config={config} />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('applies required attribute', () => {
      const config: SelectFieldConfig = {
        ...baseConfig,
        required: true,
      };

      render(<SelectField config={config} />);
      expect(screen.getByLabelText(/Country/)).toBeRequired();
    });

    it('does not show asterisk for optional fields', () => {
      const config: SelectFieldConfig = {
        ...baseConfig,
        required: false,
      };

      render(<SelectField config={config} />);
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables select when disabled prop is true', () => {
      render(<SelectField config={baseConfig} disabled={true} />);

      expect(screen.getByLabelText('Country')).toBeDisabled();
    });

    it('disables select when config.disabled is true', () => {
      const config: SelectFieldConfig = {
        ...baseConfig,
        disabled: true,
      };

      render(<SelectField config={config} />);
      expect(screen.getByLabelText('Country')).toBeDisabled();
    });

    it('enables select by default', () => {
      render(<SelectField config={baseConfig} />);

      expect(screen.getByLabelText('Country')).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('associates label with select', () => {
      render(<SelectField config={baseConfig} />);

      const select = screen.getByLabelText('Country');
      expect(select).toHaveAttribute('id', 'country');
    });

    it('is keyboard accessible', () => {
      render(<SelectField config={baseConfig} />);

      const select = screen.getByLabelText('Country');
      select.focus();
      expect(select).toHaveFocus();
    });

    it('has combobox role', () => {
      render(<SelectField config={baseConfig} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });
});

