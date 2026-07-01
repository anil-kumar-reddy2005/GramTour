'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../actions/authActions';
import { ShieldCheck, Lock, User, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e?.preventDefault();
        
        if (!email || !password) {
            setError('Please fill in both email and password.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const result = await login(email, password);
            setLoading(false);

            if (result.error) {
                setError(result.error);
            } else if (result.user?.role !== 'admin') {
                setError('Access Denied. This portal is strictly restricted to platform administrators.');
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/admin');
                    router.refresh();
                }, 800);
            }
        } catch (err) {
            setLoading(false);
            setError('Connection failed. Please try again.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #1b3524 0%, #0d1a11 100%)',
            padding: '2rem',
            fontFamily: 'var(--font-body)',
            color: '#f3f4f6',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decorative rings */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(46, 139, 87, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 69, 19, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}>
                {/* Back to Home Link */}
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = '#9ca3af'}>
                    <ArrowLeft size={16} /> Return to Homepage
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{
                        background: 'rgba(18, 30, 23, 0.75)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(46, 139, 87, 0.3)',
                        borderRadius: '24px',
                        padding: '2.5rem 2rem',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Header Portal Title */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'inline-flex', background: 'rgba(46, 139, 87, 0.15)', border: '1px solid rgba(46, 139, 87, 0.4)', borderRadius: '50%', padding: '0.75rem', color: '#4ade80', marginBottom: '1rem' }}>
                            <ShieldCheck size={36} />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 0.5rem', color: 'white', letterSpacing: '-0.5px' }}>Admin Portal</h1>
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>Restricted access for system administrators only</p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.4)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.4 }}
                            >
                                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.5rem' }}
                            >
                                <ShieldCheck size={16} />
                                <span>Security cleared. Initializing control panel...</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="email" style={{ fontSize: '0.875rem', color: '#d1d5db', fontWeight: '500' }}>Admin Email</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="admin@gramtour.com"
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem 1rem 0.85rem 2.75rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(46, 139, 87, 0.6)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="password" style={{ fontSize: '0.875rem', color: '#d1d5db', fontWeight: '500' }}>Access Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="password"
                                    id="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem 1rem 0.85rem 2.75rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(46, 139, 87, 0.6)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '1rem',
                                background: '#10b981',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s, transform 0.1s',
                                marginTop: '0.75rem'
                            }}
                            onMouseOver={e => e.target.style.backgroundColor = '#059669'}
                            onMouseOut={e => e.target.style.backgroundColor = '#10b981'}
                        >
                            <LogIn size={18} />
                            {loading ? 'Authenticating...' : 'Secure Authorization'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
