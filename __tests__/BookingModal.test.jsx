import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BookingModal from '../src/components/BookingModal';
import React from 'react';

// Mock routing and next hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('../src/components/SmartImage', () => ({
  default: () => <div data-testid="smart-image">Image</div>,
}));

describe('BookingModal Component', () => {
  const mockItem = {
    id: 1,
    title: 'Pottery Workshop',
    price: 450,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <BookingModal isOpen={false} onClose={vi.fn()} targetItem={mockItem} targetType="experience" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows experience title and base price calculation on render', () => {
    render(
      <BookingModal isOpen={true} onClose={vi.fn()} targetItem={mockItem} targetType="experience" villageName="Anegundi" />
    );
    
    expect(screen.getByText(/Pottery Workshop/i)).toBeDefined();
    // Use getAllByText since both base price and total estimate are ₹450
    expect(screen.getAllByText(/₹450/i).length).toBe(2);
  });

  it('calculates total estimated pricing dynamically when guest count changes', () => {
    render(
      <BookingModal isOpen={true} onClose={vi.fn()} targetItem={mockItem} targetType="experience" villageName="Anegundi" />
    );

    const guestInput = screen.getByLabelText(/Number of Persons/i);
    
    // Change guest count to 3
    fireEvent.change(guestInput, { target: { value: 3 } });

    // 450 * 3 = 1350
    expect(screen.getByText(/₹1350/i)).toBeDefined();
  });
});
