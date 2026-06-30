'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { register } from '../actions/authActions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('tourist');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Touch triggers
    const [nameTouched, setNameTouched] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

    // Inline errors
    const nameError = nameTouched && !name ? 'Full name is required' : null;
    const emailError = emailTouched && (!email ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address' : null);
    const passwordError = passwordTouched && (!password ? 'Password is required' : password.length < 6 ? 'Password must be at least 6 characters' : null);

    const isFormValid = name && email && password && !nameError && !emailError && !passwordError;

    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        setNameTouched(true);
        setEmailTouched(true);
        setPasswordTouched(true);

        if (!isFormValid) {
            setError('Please correct the validation errors first.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const result = await register(name, email, password, role);
            setLoading(false);
            
            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard');
                    router.refresh();
                }, 800);
            }
        } catch (err) {
            setLoading(false);
            setError(err.message || 'Registration failed. Try again.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="login-card"
        >
            <h3>Create an Account</h3>
            <p>Sign up to start exploring</p>

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
                        <span>Registration successful! Directing to dashboard...</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleRegister} className="login-form" noValidate>
                <div className="input-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onBlur={() => setNameTouched(true)}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="John Doe"
                        style={{ borderColor: nameError ? '#ef4444' : '' }}
                    />
                    {nameError && (
                        <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{nameError}</span>
                    )}
                </div>

                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onBlur={() => setEmailTouched(true)}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="john@example.com"
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

                <div className="input-group">
                    <label htmlFor="role">I am a...</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', width: '100%', fontFamily: 'inherit', color: 'var(--color-text-main)' }}
                    >
                        <option value="tourist">Tourist (Booking & reviews)</option>
                        <option value="creator">Creator (Posting experiences)</option>
                    </select>
                </div>

                <motion.button
                    whileHover={{ scale: isFormValid && !loading ? 1.02 : 1 }}
                    whileTap={{ scale: isFormValid && !loading ? 0.98 : 1 }}
                    type="submit"
                    className="login-btn"
                    disabled={loading || !isFormValid}
                    style={{ opacity: isFormValid && !loading ? 1 : 0.6, cursor: isFormValid && !loading ? 'pointer' : 'not-allowed', marginTop: '1.5rem' }}
                >
                    {loading ? 'Creating account...' : 'Sign Up'}
                </motion.button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                <p>Already have an account? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Log in here</Link></p>
            </div>
        </motion.div>
    );
}
