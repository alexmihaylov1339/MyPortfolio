import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('renders with multiple classNames combined', () => {
      render(<Button className="class-one class-two">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('class-one');
      expect(button).toHaveClass('class-two');
    });
  });

  describe('Button Types', () => {
    it('renders with default type="button"', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('renders with type="submit"', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('renders with type="reset"', () => {
      render(<Button type="reset">Reset</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('Loading State', () => {
    it('displays "Loading..." text when isLoading is true', () => {
      render(<Button isLoading>Click me</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Loading...');
    });

    it('disables button when isLoading is true', () => {
      render(<Button isLoading>Click me</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('displays children when isLoading is false', () => {
      render(<Button isLoading={false}>Click me</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('displays children when isLoading is undefined', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });
  });

  describe('Disabled State', () => {
    it('is enabled by default', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('uses pointer cursor affordance for enabled buttons', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('cursor-pointer');
    });

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Button</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('uses disabled cursor affordance for disabled buttons', () => {
      render(<Button disabled>Button</Button>);
      expect(screen.getByRole('button')).toHaveClass(
        'disabled:cursor-not-allowed',
      );
    });

    it('is disabled when both disabled and isLoading are true', () => {
      render(<Button disabled isLoading>Button</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Event Handlers', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} isLoading>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('calls onMouseEnter handler when hovered', () => {
      const handleMouseEnter = jest.fn();
      render(<Button onMouseEnter={handleMouseEnter}>Hover me</Button>);

      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus handler when focused', () => {
      const handleFocus = jest.fn();
      render(<Button onFocus={handleFocus}>Focus me</Button>);

      screen.getByRole('button').focus();
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur handler when blurred', () => {
      const handleBlur = jest.fn();
      render(<Button onBlur={handleBlur}>Blur me</Button>);

      const button = screen.getByRole('button');
      button.focus();
      button.blur();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('HTML Attributes', () => {
    it('spreads additional HTML attributes', () => {
      render(
        <Button
          data-testid="custom-button"
          aria-label="Custom label"
          id="button-id"
        >
          Button
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
      expect(button).toHaveAttribute('id', 'button-id');
    });

    it('accepts standard HTML button attributes', () => {
      render(<Button title="Tooltip text">Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Tooltip text');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<Button>{''}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('');
    });

    it('renders with complex children (JSX elements)', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('IconText');
      expect(button.querySelector('span')).toBeInTheDocument();
    });

    it('handles number as children', () => {
      render(<Button>{42}</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('42');
    });

    it('prioritizes isLoading over complex children', () => {
      render(
        <Button isLoading>
          <span>Complex</span>
          <span>Content</span>
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Loading...');
      expect(button.querySelector('span')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('is accessible by role', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>);
      expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Button aria-describedby="description">Button</Button>
          <div id="description">This is a description</div>
        </>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });

    it('indicates disabled state to screen readers', () => {
      render(<Button disabled>Button</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('indicates loading state via disabled attribute', () => {
      render(<Button isLoading>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Loading...');
    });
  });
});
