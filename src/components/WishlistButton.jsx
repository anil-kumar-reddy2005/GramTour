'use client';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import './WishlistButton.css';

export default function WishlistButton({ itemId, itemType }) {
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Dynamic LocalStorage Keys based on current user
    const getStorageKey = (userId) => userId ? `wishlist_user_${userId}` : 'wishlist_guest';

    useEffect(() => {
        const checkWishlist = async () => {
            let userId = null;
            try {
                // Get current user session
                const userRes = await fetch('/api/auth/me');
                const userData = await userRes.json();
                
                if (userData.user) {
                    setUser(userData.user);
                    userId = userData.user.id;
                }
            } catch (error) {
                console.error('Error fetching user for wishlist:', error);
            }

            // Read from LocalStorage immediately (fast path)
            const storageKey = getStorageKey(userId);
            const localWishlist = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const isLocalFound = localWishlist.some(item => 
                item.item_id === parseInt(itemId) && item.item_type === itemType
            );
            setIsInWishlist(isLocalFound);
            setLoading(false);

            // Fetch from database to ensure sync (if logged in)
            if (userId) {
                try {
                    const res = await fetch(`/api/wishlist?user_id=${userId}`);
                    const serverWishlist = await res.json();
                    
                    if (Array.isArray(serverWishlist)) {
                        const isServerFound = serverWishlist.some(item => 
                            item.item_id === parseInt(itemId) && item.item_type === itemType
                        );
                        
                        // Update UI if out of sync
                        setIsInWishlist(isServerFound);
                        
                        // Write the full synced list back to LocalStorage
                        localStorage.setItem(storageKey, JSON.stringify(serverWishlist));
                    }
                } catch (serverErr) {
                    console.error('Sync wishlist error:', serverErr);
                }
            }
        };

        checkWishlist();
    }, [itemId, itemType]);

    const toggleWishlist = async () => {
        // Optimistic UI update
        const nextState = !isInWishlist;
        setIsInWishlist(nextState);

        const storageKey = getStorageKey(user?.id);
        let localWishlist = JSON.parse(localStorage.getItem(storageKey) || '[]');

        if (nextState) {
            // Add item
            if (!localWishlist.some(item => item.item_id === parseInt(itemId) && item.item_type === itemType)) {
                localWishlist.push({ item_id: parseInt(itemId), item_type: itemType });
            }
        } else {
            // Remove item
            localWishlist = localWishlist.filter(item => 
                !(item.item_id === parseInt(itemId) && item.item_type === itemType)
            );
        }
        localStorage.setItem(storageKey, JSON.stringify(localWishlist));

        // Sync with server if logged in
        if (user) {
            try {
                if (isInWishlist) {
                    // Remove from db
                    await fetch(`/api/wishlist?user_id=${user.id}&item_id=${itemId}&item_type=${itemType}`, {
                        method: 'DELETE'
                    });
                } else {
                    // Add to db
                    await fetch('/api/wishlist', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: user.id,
                            item_id: parseInt(itemId),
                            item_type: itemType
                        })
                    });
                }
            } catch (error) {
                console.error('Database sync error on wishlist toggle:', error);
                // Rollback on database failure
                setIsInWishlist(!nextState);
            }
        } else {
            alert('Added to guest wishlist! Log in to save it permanently to your account.');
        }
    };

    if (loading) return <div className="wishlist-skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ececec', animation: 'shine 1.5s infinite' }}></div>;

    return (
        <button
            className={`wishlist-button ${isInWishlist ? 'active' : ''}`}
            onClick={toggleWishlist}
            title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                background: nextState => isInWishlist ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                color: isInWishlist ? '#ef4444' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            }}
        >
            <Heart size={18} fill={isInWishlist ? 'currentColor' : 'none'} style={{ transition: 'transform 0.15s ease' }} />
        </button>
    );
}
