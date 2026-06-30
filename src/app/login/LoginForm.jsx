'use client';
import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { login } from '../actions/authActions';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

function LoginFormContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Field touch states for validation trigger
    const [emailTouched, setEmailTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();

    // Inline errors
    const emailError = emailTouched && (!email ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address' : null);
    const passwordError = passwordTouched && (!password ? 'Password is required' : password.length < 6 ? 'Password must be at least 6 characters' : null);
    
    const isFormValid = email && password && !emailError && !passwordError;

    useEffect(() => {
        const prefill = searchParams.get('prefill');
        if (prefill === 'admin') {
            setEmail('admin@gramtour.com');
            setPassword('password123');
            // Trigger touched states for correct visual layout
            setEmailTouched(true);
            setPasswordTouched(true);
            
            if (typeof window !== 'undefined') {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, [searchParams]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setEmailTouched(true);
        setPasswordTouched(true);

        if (!isFormValid) {
            setError('Please correct the validation errors before signing in.');
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
            } else {
                setSuccess(true);
                setTimeout(() => {
                    if (result.user?.role === 'admin') {
                        router.push('/admin');
                    } else {
                        router.push('/');
                    }
                    router.refresh();
                }, 800);
            }
        } catch (err) {
            setLoading(false);
            setError(err.message || 'Network error. Please try again.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="login-card"
        >
            <h3>Welcome Back</h3>
            <p>Log in to your account</p>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="error-message"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.25rem' }}
                    >
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', color: '#059669', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.25rem' }}
                    >
                        <CheckCircle size={16} />
                        <span>Authentication successful! Redirecting...</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="login-form" noValidate>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onBlur={() => setEmailTouched(true)}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="admin@gramtour.com"
                        style={{ borderColor: emailError ? '#ef4444' : '' }}
                    />
                    {emailError && (
                        <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{emailError}</span>
                    )}
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onBlur={() => setPasswordTouched(true)}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        style={{ borderColor: passwordError ? '#ef4444' : '' }}
                    />
                    {passwordError && (
                        <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{passwordError}</span>
                    )}
                </div>

                <motion.button
                    whileHover={{ scale: isFormValid && !loading ? 1.02 : 1 }}
                    whileTap={{ scale: isFormValid && !loading ? 0.98 : 1 }}
                    type="submit"
                    className="login-btn"
                    disabled={loading || !isFormValid}
                    style={{ opacity: isFormValid && !loading ? 1 : 0.6, cursor: isFormValid && !loading ? 'pointer' : 'not-allowed', marginTop: '0.5rem' }}
                >
                    {loading ? 'Logging in...' : 'Sign In'}
                </motion.button>
            </form>

            <div className="test-credentials">
                <p><strong>Demo Roles:</strong></p>
                <p>Admin: admin@gramtour.com</p>
                <p>Tourist: tourist@gramtour.com</p>
                <p>Creator: creator@gramtour.com</p>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                <p>Don&apos;t have an account? <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Sign up here</Link></p>
            </div>
        </motion.div>
    );
}

export default function LoginForm() {
    return (
        <Suspense fallback={<div className="login-card" style={{ textAlign: 'center', padding: '3rem' }}>Loading LoginForm...</div>}>
            <LoginFormContent />
        </Suspense>
    );
}
