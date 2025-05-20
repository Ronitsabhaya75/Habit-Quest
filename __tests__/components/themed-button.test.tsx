import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemedButton } from '../../components/themed-button';

describe('ThemedButton', () => {
  it('renders the button with default props', () => {
    render(<ThemedButton>Click me</ThemedButton>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-gradient-to-r from-[#00ffc8] to-[#00a6ff]');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<ThemedButton variant="secondary">Secondary</ThemedButton>);
    
    let button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('bg-[rgba(0,166,255,0.2)]');
    
    rerender(<ThemedButton variant="outline">Outline</ThemedButton>);
    button = screen.getByRole('button', { name: /outline/i });
    expect(button).toHaveClass('bg-transparent border border-[rgba(0,255,198,0.3)]');
    
    rerender(<ThemedButton variant="ghost">Ghost</ThemedButton>);
    button = screen.getByRole('button', { name: /ghost/i });
    expect(button).toHaveClass('bg-transparent text-[#B8FFF9]');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<ThemedButton size="sm">Small</ThemedButton>);
    
    let button = screen.getByRole('button', { name: /small/i });
    expect(button).toHaveClass('text-xs px-3 py-1.5');
    
    rerender(<ThemedButton size="md">Medium</ThemedButton>);
    button = screen.getByRole('button', { name: /medium/i });
    expect(button).toHaveClass('text-sm px-4 py-2');
    
    rerender(<ThemedButton size="lg">Large</ThemedButton>);
    button = screen.getByRole('button', { name: /large/i });
    expect(button).toHaveClass('text-base px-6 py-3');
  });

  it('applies glow effect when specified', () => {
    render(<ThemedButton glowEffect>Glowing</ThemedButton>);
    
    const button = screen.getByRole('button', { name: /glowing/i });
    expect(button).toHaveClass('after:content-[\'\'] after:absolute after:inset-0');
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<ThemedButton onClick={handleClick}>Click me</ThemedButton>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<ThemedButton disabled>Disabled</ThemedButton>);
    
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50 disabled:pointer-events-none');
  });
}); 