'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Calendar, Users, Phone, Navigation, Clock, CheckCircle, MapPin, Heart, Star, Trash2, User, X, HelpCircle, ChevronDown, ChevronUp, Key, FileCheck } from 'lucide-react';
import SmartImage from '../../components/SmartImage';
import ShimmerSkeleton from '../../components/ShimmerSkeleton';
import './dashboard.css';
export default function Dashboard() {
    return (
        <Suspense fallback={<div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>Loading dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'wishlist' | 'reviews' | 'profile' | 'support'
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    
    // Profile settings states
    const [profileData, setProfileData] = useState({ name: '', email: '' });
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [preferencesData, setPreferencesData] = useState({ bookingAlerts: true, newsletter: false });
    const [profileUpdating, setProfileUpdating] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    
    // Support tab states
    const [supportCategory, setSupportCategory] = useState('booking');
    const [supportMessageText, setSupportMessageText] = useState('');
    const [supportSubmitted, setSupportSubmitted] = useState(false);
    const [faqOpen, setFaqOpen] = useState({});

    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    useEffect(() => {
        if (tabParam && ['bookings', 'wishlist', 'reviews', 'profile', 'support'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const userRes = await fetch('/api/auth/me');
                const userData = await userRes.json();
                setUser(userData.user);

                if (userData.user) {
                    setProfileData({ name: userData.user.name, email: userData.user.email });
                    
                    // Optimistic instant prefill from LocalStorage
                    const cachedWishlist = localStorage.getItem(`wishlist_user_${userData.user.id}`);
                    if (cachedWishlist) {
                        try {
                            setWishlist(JSON.parse(cachedWishlist));
                        } catch (e) {}
                    }

                    const [bookingsRes, wishlistRes, reviewsRes] = await Promise.all([
                        fetch(`/api/bookings?user_id=${userData.user.id}`),
                        fetch(`/api/wishlist?user_id=${userData.user.id}`),
                        fetch(`/api/reviews?user_id=${userData.user.id}`)
                    ]);

                    const bData = await bookingsRes.json();
                    const wData = await wishlistRes.json();
                    
                    const bDataParsed = Array.isArray(bData) ? bData : [];
                    setBookings(bDataParsed.filter(b => b.status !== 'pending'));
                    
                    if (Array.isArray(wData)) {
                        setWishlist(wData);
                        localStorage.setItem(`wishlist_user_${userData.user.id}`, JSON.stringify(wData));
                    }

                    const rData = await reviewsRes.json();
                    setReviews(Array.isArray(rData) ? rData : []);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const removeWishlistItem = async (itemId, itemType) => {
        if (!user) return;
        try {
            await fetch(`/api/wishlist?user_id=${user.id}&item_id=${itemId}&item_type=${itemType}`, {
                method: 'DELETE'
            });
            setWishlist(wishlist.filter(item => !(item.item_id === itemId && item.item_type === itemType)));
        } catch (error) {
            console.error("Error removing from wishlist:", error);
        }
    };

    const handleCancelClick = (bookingId) => {
        setBookingToCancel(bookingId);
        setCancelReason('');
        setCancelModalVisible(true);
    };

    const confirmCancelBooking = async () => {
        if (cancelReason.trim() === '') {
            alert('A reason is required to cancel your booking.');
            return;
        }

        try {
            const res = await fetch(`/api/bookings?id=${bookingToCancel}&reason=${encodeURIComponent(cancelReason.trim())}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Remove the cancelled booking from the UI without reloading
                setBookings(bookings.filter(b => b.id !== bookingToCancel));
                setCancelModalVisible(false);
                setBookingToCancel(null);
            } else {
                alert(data.error || 'Failed to cancel booking.');
            }
        } catch (error) {
            console.error("Error cancelling booking:", error);
            alert('An error occurred while canceling your booking.');
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileUpdating(true);
        setProfileMessage('');

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });
            const data = await res.json();

            if (res.ok) {
                setUser(data.user);
                setProfileMessage('Profile updated successfully!');
            } else {
                setProfileMessage(data.error || 'Failed to update profile.');
            }
        } catch (error) {
            console.error("Profile update error:", error);
            setProfileMessage('An error occurred while updating.');
        } finally {
            setProfileUpdating(false);
            setTimeout(() => setProfileMessage(''), 4000);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordMessage('');
        if (passwordData.new !== passwordData.confirm) {
            setPasswordMessage('Error: New passwords do not match.');
            return;
        }
        if (passwordData.new.length < 6) {
            setPasswordMessage('Error: Password must be at least 6 characters.');
            return;
        }

        // Mock password update
        setPasswordMessage('Password updated successfully!');
        setPasswordData({ current: '', new: '', confirm: '' });
        setTimeout(() => setPasswordMessage(''), 4000);
    };

    const handleSupportSubmit = (e) => {
        e.preventDefault();
        setSupportSubmitted(true);
        setSupportMessageText('');
    };

    const toggleFaq = (idx) => {
        setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return <span className="status-badge confirmed"><CheckCircle size={14} /> Confirmed</span>;
            case 'completed': return <span className="status-badge completed">Completed</span>;
            case 'cancelled': return <span className="status-badge" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}><Clock size={14} /> Cancelled</span>;
            default: return <span className="status-badge pending"><Clock size={14} /> Pending</span>;
        }
    };
    return (<div className="dashboard-page">
        <div className="dashboard-header">
            <div className="container">
                <h1>My Dashboard</h1>
                <p>Welcome back, {user ? user.name : 'Adventurer'}! Manage your upcoming rural experiences.</p>
            </div>
        </div>

        <div className="container dashboard-content">
            <aside className="dashboard-sidebar">
                <nav className="dashboard-nav">
                    <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
                        <Navigation size={18} /> My Bookings
                    </button>
                    <button className={activeTab === 'wishlist' ? 'active' : ''} onClick={() => setActiveTab('wishlist')}>
                        <Heart size={18} /> My Wishlist
                    </button>
                    <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
                        <Star size={18} /> My Reviews
                    </button>
                    <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                        <User size={18} /> Profile Settings
                    </button>
                    <button className={activeTab === 'support' ? 'active' : ''} onClick={() => setActiveTab('support')}>
                        <HelpCircle size={18} /> Support Center
                    </button>
                </nav>
            </aside>

            <main className="dashboard-main">
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                        <ShimmerSkeleton variant="rect" width="40%" height={32} style={{ marginBottom: '1rem' }} />
                        <ShimmerSkeleton variant="rect" width="100%" height={160} count={2} style={{ borderRadius: '16px' }} />
                    </div>
                ) : !user ? (
                    <div className="login-prompt card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <h3>Please Log In</h3>
                        <p>You need to be logged in to view your dashboard.</p>
                        <Link href="/login" className="btn-primary">Go to Login</Link>
                    </div>
                ) : (
                    <>
                        {activeTab === 'bookings' && (
                            <>
                                <h2>My Bookings</h2>
                                {bookings.length === 0 ? (
                                    <div className="empty-bookings card">
                                        <Navigation size={48} className="empty-icon" />
                                        <h3>No Bookings Yet</h3>
                                        <p>You haven&apos;t booked any experiences. Explore our authentic villages to get started!</p>
                                        <Link href="/explore" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>Explore Villages</Link>
                                    </div>
                                ) : (
                                    <div className="bookings-list">
                                        {bookings.map(booking => (
                                            <div key={booking.id} className="card booking-card">
                                                <div className="booking-header">
                                                    <div>
                                                        <span className="booking-id">Booking #{booking.id.toString().padStart(4, '0')}</span>
                                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            {booking.display_title}
                                                            {booking.village_id && !booking.experience_id && <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--color-accent)', color: 'white', borderRadius: '1rem' }}>Village Stay</span>}
                                                        </h3>
                                                        <div className="booking-village"><MapPin size={14} /> {booking.village_name}</div>
                                                    </div>
                                                    <div className="booking-status">
                                                        {getStatusBadge(booking.status)}
                                                    </div>
                                                </div>

                                                <div className="booking-details">
                                                    <div className="detail-item">
                                                        <Calendar size={18} />
                                                        <div>
                                                            <strong>Date</strong>
                                                            <p>{booking.booking_date}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <Users size={18} />
                                                        <div>
                                                            <strong>Guests</strong>
                                                            <p>{booking.persons} Persons</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <Phone size={18} />
                                                        <div>
                                                            <strong>Contact</strong>
                                                            <p>{booking.contact_phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <Clock size={18} />
                                                        <div>
                                                            <strong>Booked On</strong>
                                                            <p>{new Date(booking.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {booking.photo_id_url && (
                                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                                        <FileCheck size={18} style={{ color: 'var(--color-primary)' }} />
                                                        <span style={{ color: 'var(--color-text-muted)' }}>Traveler Photo ID:</span>
                                                        <a 
                                                            href={booking.photo_id_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}
                                                        >
                                                            View ID Copy
                                                        </a>
                                                    </div>
                                                )}
                                                {booking.status === 'confirmed' && (
                                                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={() => handleCancelClick(booking.id)}
                                                            className="btn-accent btn-small"
                                                            style={{ backgroundColor: 'transparent', color: '#dc3545', border: '1px solid #dc3545', padding: '0.5rem 1rem' }}
                                                        >
                                                            Cancel Booking
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'wishlist' && (
                            <>
                                <h2>My Wishlist</h2>
                                {wishlist.length === 0 ? (
                                    <div className="empty-state card" style={{ textAlign: 'center', padding: '3rem' }}>
                                        <Heart size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
                                        <h3>Your wishlist is empty</h3>
                                        <p>Save your favorite villages and experiences to plan your next trip.</p>
                                        <Link href="/explore" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Explore Villages</Link>
                                    </div>
                                ) : (
                                    <div className="wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                        {wishlist.map(item => (
                                            <div key={`${item.item_type}-${item.item_id}`} className="card wishlist-card" style={{ overflow: 'hidden' }}>
                                                <div className="item-image" style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
                                                    <SmartImage src={item.image} alt={item.name} fallbackSrc="https://images.unsplash.com/photo-1544322444-6a84742a7c47?q=80&w=800" />
                                                    <button
                                                        onClick={() => removeWishlistItem(item.item_id, item.item_type)}
                                                        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'white', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10 }}
                                                        title="Remove from Wishlist"
                                                    >
                                                        <Trash2 size={16} color="#ef4444" />
                                                    </button>
                                                </div>
                                                <div className="item-info" style={{ padding: '1.25rem' }}>
                                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: '600' }}>{item.item_type}</span>
                                                    <h3 style={{ margin: '0.25rem 0 0.75rem' }}>{item.name}</h3>
                                                    <Link href={`/${item.item_type === 'village' ? 'villages' : 'experiences'}/${item.item_id}`} className="btn-accent" style={{ display: 'block', textAlign: 'center', fontSize: '0.875rem' }}>View Details</Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'reviews' && (
                            <>
                                <h2>My Reviews</h2>
                                {reviews.length === 0 ? (
                                    <div className="empty-state card" style={{ textAlign: 'center', padding: '3rem' }}>
                                        <Star size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
                                        <h3>No Reviews Yet</h3>
                                        <p>You haven&apos;t left any reviews. Share your thoughts on experiences you&apos;ve completed!</p>
                                    </div>
                                ) : (
                                    <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {reviews.map(review => (
                                            <div key={review.id} className="card review-card" style={{ padding: '1.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                    <div>
                                                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: '600' }}>{review.target_type} Review</span>
                                                        <h3 style={{ margin: '0' }}>{review.target_name || 'Review'}</h3>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <Star key={s} size={16} fill={s <= review.rating ? 'currentColor' : 'none'} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p style={{ margin: '0', fontStyle: 'italic', color: '#4b5563' }}>&quot;{review.comment}&quot;</p>
                                                <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: '#9ca3af' }}>
                                                    Posted on {new Date(review.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'profile' && (
                            <>
                                <h2>Profile Settings</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
                                    {/* Section 1: Account Details */}
                                    <div className="card" style={{ padding: '2rem' }}>
                                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}><User size={20} /> Account Details</h3>
                                        <form onSubmit={handleProfileUpdate}>
                                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email Address</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                                                />
                                            </div>
                                            <button type="submit" className="btn-primary" disabled={profileUpdating}>
                                                {profileUpdating ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </form>
                                        {profileMessage && (
                                            <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '4px', backgroundColor: profileMessage.includes('error') || profileMessage.includes('Failed') ? '#fee2e2' : '#dcfce7', color: profileMessage.includes('error') || profileMessage.includes('Failed') ? '#dc2626' : '#166534' }}>
                                                {profileMessage}
                                            </div>
                                        )}
                                    </div>

                                    {/* Section 2: Password Security */}
                                    <div className="card" style={{ padding: '2rem' }}>
                                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}><Key size={20} /> Password & Security</h3>
                                        <form onSubmit={handlePasswordUpdate}>
                                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Current Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwordData.current}
                                                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                                    placeholder="••••••••"
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                                                />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                                <div className="form-group">
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>New Password</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        value={passwordData.new}
                                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                        placeholder="Min 6 characters"
                                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        value={passwordData.confirm}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                        placeholder="••••••••"
                                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                                                    />
                                                </div>
                                            </div>
                                            <button type="submit" className="btn-primary">
                                                Update Password
                                            </button>
                                        </form>
                                        {passwordMessage && (
                                            <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '4px', backgroundColor: passwordMessage.includes('Error') ? '#fee2e2' : '#dcfce7', color: passwordMessage.includes('Error') ? '#dc2626' : '#166534' }}>
                                                {passwordMessage}
                                            </div>
                                        )}
                                    </div>

                                    {/* Section 3: Traveler Preferences */}
                                    <div className="card" style={{ padding: '2rem' }}>
                                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}><Clock size={20} /> Traveler Preferences</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={preferencesData.bookingAlerts} 
                                                    onChange={e => setPreferencesData({ ...preferencesData, bookingAlerts: e.target.checked })}
                                                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                                                />
                                                <span>Receive instant booking confirmation and receipt updates via email</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={preferencesData.newsletter} 
                                                    onChange={e => setPreferencesData({ ...preferencesData, newsletter: e.target.checked })}
                                                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                                                />
                                                <span>Send me handpicked rural travel recommendations and new artisan arrivals monthly</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'support' && (
                            <>
                                <h2>Support Center</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        {/* Contact Form */}
                                        <div className="card" style={{ padding: '2rem' }}>
                                            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--color-primary)' }}>Submit a Support Ticket</h3>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Have questions about a booking, payment issue, or need help matching a village? Our response team is here to assist.</p>
                                            
                                            {supportSubmitted ? (
                                                <div style={{ padding: '2rem 1rem', textAlign: 'center', backgroundColor: 'rgba(46, 139, 87, 0.05)', border: '1px dashed var(--color-primary)', borderRadius: '12px' }}>
                                                    <CheckCircle size={40} color="var(--color-primary)" style={{ margin: '0 auto 1rem' }} />
                                                    <h4 style={{ margin: '0 0 0.5rem', color: 'var(--color-primary)' }}>Ticket Submitted Successfully!</h4>
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>Reference ID: #GT-{Math.floor(100000 + Math.random() * 900000)}. We will contact you at {user?.email} shortly.</p>
                                                </div>
                                            ) : (
                                                <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                    <div className="form-group">
                                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Topic Category</label>
                                                        <select 
                                                            value={supportCategory}
                                                            onChange={e => setSupportCategory(e.target.value)}
                                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                                                        >
                                                            <option value="booking">Booking / Postponing Help</option>
                                                            <option value="payment">Refunds & Payments</option>
                                                            <option value="village">Artisan Workshops & Village Queries</option>
                                                            <option value="other">Other Account Inquiries</option>
                                                        </select>
                                                    </div>
                                                    <div className="form-group">
                                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Describe Your Request</label>
                                                        <textarea 
                                                            required
                                                            value={supportMessageText}
                                                            onChange={e => setSupportMessageText(e.target.value)}
                                                            placeholder="Please share details to help us resolve your query faster..."
                                                            style={{ width: '100%', minHeight: '120px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontFamily: 'inherit', resize: 'vertical' }}
                                                        />
                                                    </div>
                                                    <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                                                        Send Support Ticket
                                                    </button>
                                                </form>
                                            )}
                                        </div>

                                        {/* FAQ accordion */}
                                        <div className="card" style={{ padding: '2rem' }}>
                                            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Frequently Asked Questions</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {[
                                                    { q: "How do I cancel or modify my village booking?", a: "Navigate to the 'My Bookings' tab, locate the booking card, and click the red 'Cancel Booking' button. Confirmations or alterations can be requested by raising a support ticket." },
                                                    { q: "What should I bring to my rural homestay?", a: "Most village homestays include local meals and clean bedding. We recommend bringing personal toiletries, any personal prescriptions, mosquito repellent, and modest traditional clothing." },
                                                    { q: "How is the payment split with local artisans?", a: "GramTour is a community-first platform. 85% of all booking prices and artisan product purchases are paid directly to local hosts and artisan cooperatives, ensuring authentic tourism remains sustainable." }
                                                ].map((item, idx) => {
                                                    const isOpen = !!faqOpen[idx];
                                                    return (
                                                        <div key={idx} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                                                            <button 
                                                                type="button"
                                                                onClick={() => toggleFaq(idx)}
                                                                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', padding: '0.5rem 0', fontWeight: '600', textAlign: 'left', cursor: 'pointer', color: 'var(--color-text-main)' }}
                                                            >
                                                                <span>{item.q}</span>
                                                                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                            </button>
                                                            {isOpen && (
                                                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                                                                    {item.a}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sidebar Information Box */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)' }}>
                                            <h4 style={{ marginTop: 0, marginBottom: '0.75rem', color: 'var(--color-primary)' }}>Live Support Hours</h4>
                                            <p style={{ fontSize: '0.875rem', margin: '0 0 0.5rem', fontWeight: '500' }}>Monday - Friday</p>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: '0 0 1rem' }}>9:00 AM - 6:00 PM IST</p>
                                            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                                                <p style={{ fontSize: '0.8125rem', margin: '0 0 0.25rem', color: 'var(--color-text-muted)' }}>Average Response Time:</p>
                                                <p style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-primary)', margin: 0 }}>&lt; 15 Minutes</p>
                                            </div>
                                        </div>

                                        <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--color-border)' }}>
                                            <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Urgent Assistance?</h4>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 1rem', lineHeight: 1.4 }}>If you are currently traveling and require emergency directions or booking assistance, contact hotlines directly.</p>
                                            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-primary)', margin: 0 }}>📞 +91 98765 43210</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>
        </div>

        {cancelModalVisible && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                <div className="modal-content card" style={{ maxWidth: '450px', width: '90%', padding: '2rem', position: 'relative' }}>
                    <button
                        onClick={() => {
                            setCancelModalVisible(false);
                            setBookingToCancel(null);
                        }}
                        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                    <h3 style={{ marginTop: 0 }}>Cancel Booking</h3>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>Please provide a short reason for why you are cancelling this booking. This action cannot be undone and will permanently remove the booking from your dashboard.</p>
                    <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Reason for cancellation..."
                        style={{ width: '100%', minHeight: '100px', margin: '1rem 0', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', resize: 'vertical', fontFamily: 'inherit' }}
                    />
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button
                            style={{ backgroundColor: 'transparent', color: '#4b5563', border: '1px solid var(--color-border)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                            onClick={() => {
                                setCancelModalVisible(false);
                                setBookingToCancel(null);
                            }}
                        >
                            Dismiss
                        </button>
                        <button
                            style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                            onClick={confirmCancelBooking}
                        >
                            Confirm Cancellation
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>);
}
