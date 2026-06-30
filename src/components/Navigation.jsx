'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { Home, Compass, CalendarCheck, LogIn, PlusCircle, User, ArrowLeft, Sun, Moon } from 'lucide-react';
import './Navigation.css';
import { getUser } from '../app/actions/authActions';
import LogoutButton from './LogoutButton';
import AdminButton from './AdminButton';
import BackButton from './BackButton';

export default function Navigation() {
    return (
        <Suspense fallback={<nav className="navbar"><div className="container nav-container"></div></nav>}>
            <NavigationContent />
        </Suspense>
    );
}

function NavigationContent() {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('light');
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') || 'light';
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            const u = await getUser();
            setUser(u);
        };
        fetchUser();
    }, [pathname, searchParams]);

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BackButton />
                    <Link href="/" className="logo">
                        GramTour
                    </Link>
                </div>

                <div className="nav-links desktop-only">
                    <Link href="/"><Home size={18} /> Home</Link>
                    <Link href="/explore"><Compass size={18} /> Explore Villages</Link>

                    {/* Role specific links */}
                    {user?.role === 'creator' && (
                        <Link href="/creator/post"><PlusCircle size={18} /> Studio</Link>
                    )}
                    {user && (
                        <Link href="/dashboard"><CalendarCheck size={18} /> My Bookings</Link>
                    )}
                </div>

                <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Theme Toggle Button */}
                    <button 
                        onClick={toggleTheme} 
                        style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: 'var(--color-text-main)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            cursor: 'pointer', 
                            padding: '0.5rem', 
                            borderRadius: '50%',
                            transition: 'background-color 0.2s',
                            outline: 'none'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {user ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Link
                                    href="/dashboard?tab=profile"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '38px',
                                        height: '38px',
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white',
                                        borderRadius: '50%',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        fontSize: '1.1rem',
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    }}
                                    className="profile-avatar"
                                    title="View Profile"
                                >
                                    {user.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
                                </Link>
                                {user.role === 'admin' && (
                                    <AdminButton />
                                )}
                                <LogoutButton />
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link href="/login" className="btn-accent" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                <LogIn size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                                Login
                            </Link>
                            <Link href="/admin/login" className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                                Admin Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="mobile-nav">
                <Link href="/"><Home size={20} /><span>Home</span></Link>
                <Link href="/explore"><Compass size={20} /><span>Explore</span></Link>
                {user ? (
                    <Link href="/dashboard"><CalendarCheck size={20} /><span>Bookings</span></Link>
                ) : (
                    <Link href="/login"><LogIn size={20} /><span>Login</span></Link>
                )}
            </div>
        </nav>
    );
}
