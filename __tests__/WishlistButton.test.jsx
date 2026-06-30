import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WishlistButton from '../src/components/WishlistButton';
import React from 'react';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Heart: ({ fill, size }) => <div data-testid="heart-icon" data-fill={fill} data-size={size}>Heart</div>,
}));

describe('WishlistButton Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders loading state initially, then button after load', async () => {
    // Mock user info fetch
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ user: { id: 1, name: 'Test User' } }),
    });

    const { container } = render(<WishlistButton itemId={5} itemType="village" />);
    
    // Check loading indicator or skeleton exists initially
    expect(container.querySelector('.wishlist-skeleton')).not.toBeNull();

    // Check button is shown after load
    await waitFor(() => {
      expect(screen.getByTitle(/Add to Wishlist/i)).toBeDefined();
    });
  });

  it('reads from LocalStorage on mount', async () => {
    // Populate localStorage cache
    localStorage.setItem('wishlist_user_1', JSON.stringify([{ item_id: 5, item_type: 'village' }]));

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({ json: () => Promise.resolve({ user: { id: 1 } }) });
      }
      if (url.includes('/api/wishlist')) {
        return Promise.resolve({ json: () => Promise.resolve([{ item_id: 5, item_type: 'village' }]) });
      }
      return Promise.reject(new Error('Unknown url'));
    });

    render(<WishlistButton itemId={5} itemType="village" />);

    // Wait for the button to update its visual active state
    await waitFor(() => {
      const btn = screen.getByTitle(/Remove from Wishlist/i);
      expect(btn).toBeDefined();
    });
  });

  it('toggles wishlist item in LocalStorage on click', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({ json: () => Promise.resolve({ user: { id: 1 } }) });
      }
      if (url.includes('/api/wishlist')) {
        return Promise.resolve({ json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ json: () => Promise.resolve({ success: true }) });
    });

    render(<WishlistButton itemId={5} itemType="village" />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTitle(/Add to Wishlist/i)).not.toBeNull();
    });

    const button = screen.getByTitle(/Add to Wishlist/i);
    
    // Click button to add
    fireEvent.click(button);
    
    // Check local storage updated
    const cache = JSON.parse(localStorage.getItem('wishlist_user_1') || '[]');
    expect(cache.some(item => item.item_id === 5 && item.item_type === 'village')).toBe(true);
  });
});
