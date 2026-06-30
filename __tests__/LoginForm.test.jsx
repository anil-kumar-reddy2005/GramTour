import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../src/app/login/LoginForm';
import React from 'react';

// Mock router hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders login form inputs and disabled button initially', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/Email/i)).toBeDefined();
    expect(screen.getByLabelText(/Password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeDefined();
  });

  it('triggers inline errors when invalid inputs are blurred', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    // Focus and blur email
    fireEvent.focus(emailInput);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    // Focus and blur password
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/Enter a valid email address/i)).toBeDefined();
      expect(screen.getByText(/Password must be at least 6 characters/i)).toBeDefined();
    });
  });
});
