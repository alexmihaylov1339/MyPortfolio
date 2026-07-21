import { render, screen } from '@testing-library/react';
import TextareaField from './TextareaField';
import type { TextareaFieldConfig } from '../types';

describe('TextareaField', () => {
  const baseConfig: TextareaFieldConfig = {
    type: 'textarea',
    name: 'bio',
    label: 'Biography',
  };

  describe('Rendering', () => {
    it('renders textarea with label', () => {
      render(<TextareaField config={baseConfig} />);

      expect(screen.getByLabelText('Biography')).toBeInTheDocument();
      expect(screen.getByLabelText('Biography').tagName).toBe('TEXTAREA');
    });

    it('renders with correct name attribute', () => {
      render(<TextareaField config={baseConfig} />);

      expect(screen.getByLabelText('Biography')).toHaveAttribute('name', 'bio');
    });

    it('renders with correct id', () => {
      render(<TextareaField config={baseConfig} />);

      expect(screen.getByLabelText('Biography')).toHaveAttribute('id', 'bio');
    });

    it('renders with placeholder', () => {
      const config: TextareaFieldConfig = {
        ...baseConfig,
        placeholder: 'Tell us about yourself',
      };

      render(<TextareaField config={config} />);
      expect(screen.getByPlaceholderText('Tell us about yourself')).toBeInTheDocument();
    });
  });

  describe('Textarea Dimensions', () => {
    it('applies default rows when not specified', () => {
      render(<TextareaField config={baseConfig} />);

      expect(screen.getByLabelText('Biography')).toHaveAttribute('rows', '4');
    });

    it('applies custom rows attribute', () => {
      const config: TextareaFieldConfig = {
        ...baseConfig,
        rows: 10,
      };

      render(<TextareaField config={config} />);
      expect(screen.getByLabelText('Biography')).toHaveAttribute('rows', '10');
    });

    it('applies cols attribute when provided', () => {
      const config: TextareaFieldConfig = {
        ...baseConfig,
        cols: 50,
      };

      render(<TextareaField config={config} />);
      expect(screen.getByLabelText('Biography')).toHaveAttribute('cols', '50');
    });

    it('does not apply cols when not provided', () => {
      render(<TextareaField config={baseConfig} />);

      expect(screen.getByLabelText('Biography')).not.toHaveAttribute('cols');
    });

    it('applies both rows and cols', () => {
      const config: TextareaFieldConfig = {
        ...baseConfig,
        rows: 8,
        cols: 60,
      };

      render(<TextareaField config={config} />);
      const textarea = screen.getByLabelText('Biography');
      expect(textarea).toHaveAttribute('rows', '8');
      expect(textarea).toHaveAttribute('cols', '60');
    });
  });

  describe('Required Field', () => {
    it('shows asterisk for required fields', () => {
      const config: TextareaFieldConfig = {
        ...baseConfig,
        required: true,
      };

      render(<TextareaField config={config} />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('applies required attribute', () => {
      const config: TextareaFieldConfig = {
        ...baseConfig,
        required: true,
      };

      render(<TextareaField config={config} />);
      expect(screen.getByLabelText(/Biography/)).toBeRequired();
    });
  });

  describe('Disabled State', () => {
    it('disables textarea when disabled prop is true', () => {
      render(<TextareaField config={baseConfig} disabled={true} />);

      expect(screen.getByLabelText('Biography')).toBeDisabled();
    });

    it('disables textarea when config.disabled is true', () => {
      const config: TextareaFieldConfig = {
        ...baseConfig,
        disabled: true,
      };

      render(<TextareaField config={config} />);
      expect(screen.getByLabelText('Biography')).toBeDisabled();
    });

    it('enables textarea by default', () => {
      render(<TextareaField config={baseConfig} />);

      expect(screen.getByLabelText('Biography')).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('associates label with textarea', () => {
      render(<TextareaField config={baseConfig} />);

      const textarea = screen.getByLabelText('Biography');
      expect(textarea).toHaveAttribute('id', 'bio');
    });

    it('is keyboard accessible', () => {
      render(<TextareaField config={baseConfig} />);

      const textarea = screen.getByLabelText('Biography');
      textarea.focus();
      expect(textarea).toHaveFocus();
    });
  });
});

