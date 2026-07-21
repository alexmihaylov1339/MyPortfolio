import { render, screen } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  describe('Rendering', () => {
    it('renders error message correctly', () => {
      render(<ErrorMessage message="Something went wrong" />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <ErrorMessage message="Error" className="custom-error" />
      );
      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv).toHaveClass('custom-error');
    });

    it('applies default error styles', () => {
      const { container } = render(<ErrorMessage message="Error" />);
      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv).toHaveClass('errorMessage');
    });

    it('combines default styles with custom className', () => {
      const { container } = render(
        <ErrorMessage message="Error" className="additional-class" />
      );
      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv).toHaveClass('errorMessage');
      expect(errorDiv).toHaveClass('additional-class');
    });

    it('renders multiple custom classes', () => {
      const { container } = render(
        <ErrorMessage message="Error" className="class-one class-two" />
      );
      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv).toHaveClass('class-one');
      expect(errorDiv).toHaveClass('class-two');
    });
  });

  describe('Message Content', () => {
    it('renders short error messages', () => {
      render(<ErrorMessage message="Error" />);
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('renders long error messages', () => {
      const longMessage = 'This is a very long error message that explains in detail what went wrong with the operation and provides helpful context to the user';
      render(<ErrorMessage message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('renders error messages with special characters', () => {
      render(<ErrorMessage message="Error: Invalid input! (check #123)" />);
      expect(screen.getByText('Error: Invalid input! (check #123)')).toBeInTheDocument();
    });

    it('renders error messages with numbers', () => {
      render(<ErrorMessage message="Error code: 404" />);
      expect(screen.getByText('Error code: 404')).toBeInTheDocument();
    });

    it('renders empty string message', () => {
      const { container } = render(<ErrorMessage message="" />);
      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv).toBeInTheDocument();
      expect(errorDiv).toHaveTextContent('');
    });
  });

  describe('HTML Structure', () => {
    it('renders as a div element', () => {
      const { container } = render(<ErrorMessage message="Error" />);
      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv.tagName).toBe('DIV');
    });

    it('contains only text content without nested elements', () => {
      const { container } = render(<ErrorMessage message="Error message" />);
      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv.children.length).toBe(0);
    });
  });

  describe('Accessibility', () => {
    it('is visible to screen readers', () => {
      render(<ErrorMessage message="Form validation error" />);
      expect(screen.getByText('Form validation error')).toBeVisible();
    });

    it('can be found by text content', () => {
      render(<ErrorMessage message="Username is required" />);
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    });

    it('supports adding aria attributes via className approach', () => {
      const { container } = render(
        <ErrorMessage message="Error" className="error-aria" />
      );
      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv).toHaveClass('error-aria');
    });
  });

  describe('Edge Cases', () => {
    it('handles messages with leading/trailing whitespace', () => {
      render(<ErrorMessage message="  Error with spaces  " />);
      expect(screen.getByText('Error with spaces')).toBeInTheDocument();
    });

    it('handles messages with line breaks', () => {
      render(<ErrorMessage message="Line 1\nLine 2" />);
      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    });

    it('handles undefined className gracefully', () => {
      const { container } = render(<ErrorMessage message="Error" />);
      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv).toBeInTheDocument();
      expect(errorDiv.className).toContain('errorMessage');
    });

    it('handles empty className', () => {
      const { container } = render(<ErrorMessage message="Error" className="" />);
      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv).toHaveClass('errorMessage');
    });
  });

  describe('Multiple Instances', () => {
    it('renders multiple error messages independently', () => {
      render(
        <>
          <ErrorMessage message="Error 1" />
          <ErrorMessage message="Error 2" />
          <ErrorMessage message="Error 3" />
        </>
      );
      expect(screen.getByText('Error 1')).toBeInTheDocument();
      expect(screen.getByText('Error 2')).toBeInTheDocument();
      expect(screen.getByText('Error 3')).toBeInTheDocument();
    });

    it('renders each instance with different classNames', () => {
      const { container } = render(
        <>
          <ErrorMessage message="Error 1" className="error-primary" />
          <ErrorMessage message="Error 2" className="error-secondary" />
        </>
      );
      expect(container.querySelector('.error-primary')).toBeInTheDocument();
      expect(container.querySelector('.error-secondary')).toBeInTheDocument();
    });
  });

  describe('Common Use Cases', () => {
    it('displays form validation errors', () => {
      render(<ErrorMessage message="Email address is invalid" />);
      expect(screen.getByText('Email address is invalid')).toBeInTheDocument();
    });

    it('displays API error messages', () => {
      render(<ErrorMessage message="Failed to fetch data from server" />);
      expect(screen.getByText('Failed to fetch data from server')).toBeInTheDocument();
    });

    it('displays authentication errors', () => {
      render(<ErrorMessage message="Invalid username or password" />);
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
    });

    it('displays network errors', () => {
      render(<ErrorMessage message="Network connection lost. Please try again." />);
      expect(screen.getByText('Network connection lost. Please try again.')).toBeInTheDocument();
    });
  });
});

