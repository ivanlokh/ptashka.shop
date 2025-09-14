import { render, screen } from '@testing-library/react';

// Simple test component
function SimpleComponent({ title }: { title: string }) {
  return <div data-testid="simple-component">{title}</div>;
}

describe('Simple Component Tests', () => {
  it('renders with correct title', () => {
    render(<SimpleComponent title="Test Title" />);
    
    const element = screen.getByTestId('simple-component');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Test Title');
  });

  it('renders with different title', () => {
    render(<SimpleComponent title="Another Title" />);
    
    const element = screen.getByTestId('simple-component');
    expect(element).toHaveTextContent('Another Title');
  });
});
