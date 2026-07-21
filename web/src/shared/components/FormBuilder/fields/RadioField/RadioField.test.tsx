import { render, screen } from '@testing-library/react';
import RadioField from './RadioField';
import type { RadioFieldConfig } from '../types';

describe('RadioField', () => {
  const baseOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const baseConfig: RadioFieldConfig = {
    type: 'radio',
    name: 'gender',
    label: 'Gender',
    options: baseOptions,
  };

  describe('Rendering', () => {
    it('renders radio group with legend', () => {
      render(<RadioField config={baseConfig} />);

      expect(screen.getByText('Gender')).toBeInTheDocument();
      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('renders all radio options', () => {
      render(<RadioField config={baseConfig} />);

      expect(screen.getByLabelText('Male')).toBeInTheDocument();
      expect(screen.getByLabelText('Female')).toBeInTheDocument();
      expect(screen.getByLabelText('Other')).toBeInTheDocument();
    });

    it('renders radio inputs with correct type', () => {
      render(<RadioField config={baseConfig} />);

      expect(screen.getByLabelText('Male')).toHaveAttribute('type', 'radio');
      expect(screen.getByLabelText('Female')).toHaveAttribute('type', 'radio');
      expect(screen.getByLabelText('Other')).toHaveAttribute('type', 'radio');
    });

    it('all radios share the same name', () => {
      render(<RadioField config={baseConfig} />);

      expect(screen.getByLabelText('Male')).toHaveAttribute('name', 'gender');
      expect(screen.getByLabelText('Female')).toHaveAttribute('name', 'gender');
      expect(screen.getByLabelText('Other')).toHaveAttribute('name', 'gender');
    });

    it('renders radios with correct values', () => {
      render(<RadioField config={baseConfig} />);

      expect(screen.getByLabelText('Male')).toHaveAttribute('value', 'male');
      expect(screen.getByLabelText('Female')).toHaveAttribute('value', 'female');
      expect(screen.getByLabelText('Other')).toHaveAttribute('value', 'other');
    });

    it('renders radios with unique ids', () => {
      render(<RadioField config={baseConfig} />);

      expect(screen.getByLabelText('Male')).toHaveAttribute('id', 'gender-male');
      expect(screen.getByLabelText('Female')).toHaveAttribute('id', 'gender-female');
      expect(screen.getByLabelText('Other')).toHaveAttribute('id', 'gender-other');
    });
  });

  describe('Options', () => {
    it('handles two options', () => {
      const config: RadioFieldConfig = {
        ...baseConfig,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      };

      render(<RadioField config={config} />);

      expect(screen.getByLabelText('Yes')).toBeInTheDocument();
      expect(screen.getByLabelText('No')).toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(2);
    });

    it('handles many options', () => {
      const manyOptions = Array.from({ length: 10 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
      }));

      const config: RadioFieldConfig = {
        ...baseConfig,
        options: manyOptions,
      };

      render(<RadioField config={config} />);

      expect(screen.getAllByRole('radio')).toHaveLength(10);
    });

    it('handles options with special characters in labels', () => {
      const config: RadioFieldConfig = {
        ...baseConfig,
        options: [
          { value: 'special', label: 'Option with "quotes" & symbols!' },
        ],
      };

      render(<RadioField config={config} />);

      expect(screen.getByLabelText(/Option with "quotes" & symbols!/)).toBeInTheDocument();
    });
  });

  describe('Required Field', () => {
    it('shows asterisk for required fields', () => {
      const config: RadioFieldConfig = {
        ...baseConfig,
        required: true,
      };

      render(<RadioField config={config} />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('applies required attribute to all radio inputs', () => {
      const config: RadioFieldConfig = {
        ...baseConfig,
        required: true,
      };

      render(<RadioField config={config} />);

      expect(screen.getByLabelText('Male')).toBeRequired();
      expect(screen.getByLabelText('Female')).toBeRequired();
      expect(screen.getByLabelText('Other')).toBeRequired();
    });

    it('does not show asterisk for optional fields', () => {
      const config: RadioFieldConfig = {
        ...baseConfig,
        required: false,
      };

      render(<RadioField config={config} />);
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables all radios when disabled prop is true', () => {
      render(<RadioField config={baseConfig} disabled={true} />);

      expect(screen.getByLabelText('Male')).toBeDisabled();
      expect(screen.getByLabelText('Female')).toBeDisabled();
      expect(screen.getByLabelText('Other')).toBeDisabled();
    });

    it('disables all radios when config.disabled is true', () => {
      const config: RadioFieldConfig = {
        ...baseConfig,
        disabled: true,
      };

      render(<RadioField config={config} />);

      expect(screen.getByLabelText('Male')).toBeDisabled();
      expect(screen.getByLabelText('Female')).toBeDisabled();
      expect(screen.getByLabelText('Other')).toBeDisabled();
    });

    it('enables all radios by default', () => {
      render(<RadioField config={baseConfig} />);

      expect(screen.getByLabelText('Male')).not.toBeDisabled();
      expect(screen.getByLabelText('Female')).not.toBeDisabled();
      expect(screen.getByLabelText('Other')).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('uses fieldset and legend for grouping', () => {
      render(<RadioField config={baseConfig} />);

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('Gender')).toBeInTheDocument();
    });

    it('associates labels with radio inputs', () => {
      render(<RadioField config={baseConfig} />);

      const maleRadio = screen.getByLabelText('Male');
      expect(maleRadio).toHaveAttribute('id', 'gender-male');
    });

    it('all radios are keyboard accessible', () => {
      render(<RadioField config={baseConfig} />);

      const maleRadio = screen.getByLabelText('Male');
      maleRadio.focus();
      expect(maleRadio).toHaveFocus();
    });

    it('has radio role for all options', () => {
      render(<RadioField config={baseConfig} />);

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(3);
    });
  });

  describe('Selection Behavior', () => {
    it('all radios are unchecked by default', () => {
      render(<RadioField config={baseConfig} />);

      expect(screen.getByLabelText('Male')).not.toBeChecked();
      expect(screen.getByLabelText('Female')).not.toBeChecked();
      expect(screen.getByLabelText('Other')).not.toBeChecked();
    });
  });
});

