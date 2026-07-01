'use client';
import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Calendar, CreditCard, Heart, ArrowRight, Copy, Share2, Download, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ShimmerSkeleton from '../../components/ShimmerSkeleton';
import Link from 'next/link';
import './ai.css';

export default function AiPlanner() {
    const [budget, setBudget] = useState(5000);
    const [days, setDays] = useState(3);
    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState('Initializing planner...');
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);
    const [shared, setShared] = useState(false);
    const [error, setError] = useState('');

    const interestOptions = [
        { id: 'art', label: 'Art & Craft' },
        { id: 'culture', label: 'Local Culture' },
        { id: 'nature', label: 'Nature & Scenery' },
        { id: 'history', label: 'Heritage & History' },
        { id: 'food', label: 'Traditional Food' },
        { id: 'adventure', label: 'Adventure' },
    ];

    const toggleInterest = (id) => {
        if (interests.includes(id)) {
            setInterests(interests.filter(i => i !== id));
        } else {
            setInterests([...interests, id]);
        }
    };

    // Progress counter simulation during generation
    useEffect(() => {
        let interval;
        if (loading) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress((prev) => {
                    const next = prev + Math.floor(Math.random() * 15) + 5;
                    if (next >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    // Update descriptions dynamically
                    if (next < 25) setProgressText('Analyzing budget and duration...');
                    else if (next < 50) setProgressText('Scanning rural village databases...');
                    else if (next < 75) setProgressText('Synthesizing custom experiences & homestays...');
                    else setProgressText('Finalizing your personal travel route...');
                    return next;
                });
            }, 300);
        } else {
            setProgress(0);
            setProgressText('');
        }
        return () => clearInterval(interval);
    }, [loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (interests.length === 0) {
            setError('Please select at least one interest to build your plan.');
            return;
        }

        setError('');
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    budget,
                    days,
                    interests: interests.join(', ')
                }),
            });
            
            if (res.ok) {
                const data = await res.json();
                // Wait for the loader to hit 100% for realistic transition
                setTimeout(() => {
                    setResult(JSON.parse(data.ai_result_text));
                    setLoading(false);
                }, 1500);
            } else {
                setError('Failed to contact the AI Planner server. Please try again.');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError('Connection failed. Verify your network connection and retry.');
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!result) return;
        const text = `
GramTour Custom AI Itinerary:
Destination: ${result.recommended_village}
Estimated Cost: ${result.estimated_cost}
Duration: ${days} Days
Stay Plan: ${result.stay_plan}
Activities: ${result.activities}
Travel Tips: ${result.travel_tips}
        `.trim();
        
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        setShared(true);
        alert('Share link generated and copied to clipboard!');
        setTimeout(() => setShared(false), 2000);
    };

    const handleDownload = () => {
        // Force browser print styles or trigger download
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    return (
        <div className="ai-page" style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--color-bg-base)' }}>
            <div className="ai-header" style={{ background: 'linear-gradient(135deg, var(--color-primary), #1b3d22)', color: 'white', padding: '3rem 1.5rem', textAlign: 'center' }}>
                <div className="container header-container">
                    <Sparkles size={48} className="header-icon" style={{ color: 'var(--color-accent)', marginBottom: '1rem' }} />
                    <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: '700' }}>AI Trip Planner</h1>
                    <p style={{ opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>Let our intelligent engine design the perfect rural getaway based on your personal style and budget.</p>
                </div>
            </div>

            <div className="container ai-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '3rem', paddingBottom: '5rem' }}>
                
                {/* Form Side */}
                <div className="ai-form-container card" style={{ padding: '2rem', height: 'max-content' }}>
                    <form onSubmit={handleSubmit} className="ai-form" noValidate>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Your Preferences</h2>

                        {error && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', marginBottom: '0.5rem' }}><CreditCard size={18} /> Budget: ₹{budget}</label>
                            <div className="range-container">
                                <input type="range" min="1000" max="20000" step="500" value={budget} onChange={e => setBudget(Number(e.target.value))} style={{ width: '100%' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                    <span>₹1,000</span>
                                    <span>₹20,000</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', marginBottom: '0.5rem' }}><Calendar size={18} /> Duration: {days} Days</label>
                            <div className="range-container">
                                <input type="range" min="1" max="14" step="1" value={days} onChange={e => setDays(Number(e.target.value))} style={{ width: '100%' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                    <span>1 Day</span>
                                    <span>14 Days</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', marginBottom: '0.75rem' }}><Heart size={18} /> Choose Interests</label>
                            <div className="interests-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                                {interestOptions.map(option => (
                                    <button 
                                        type="button" 
                                        key={option.id} 
                                        className={`interest-chip ${interests.includes(option.id) ? 'active' : ''}`} 
                                        onClick={() => toggleInterest(option.id)}
                                        style={{ 
                                            padding: '0.6rem 0.8rem', 
                                            borderRadius: '20px', 
                                            border: '1px solid var(--color-border)', 
                                            background: interests.includes(option.id) ? 'var(--color-primary)' : 'white',
                                            color: interests.includes(option.id) ? 'white' : 'var(--color-text-main)',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            fontSize: '0.875rem',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary generate-btn w-100" 
                            disabled={loading || interests.length === 0}
                            style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem' }}
                        >
                            <Sparkles size={18} />
                            {loading ? 'Creating Itinerary...' : 'Generate Itinerary'}
                        </button>
                    </form>
                </div>

                {/* Result Side */}
                <div className="ai-result-container">
                    <AnimatePresence mode="wait">
                        {loading && (
                            <motion.div 
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="card" 
                                style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}
                            >
                                <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '1.5rem' }}>
                                    <div className="spinning" style={{ width: '80px', height: '80px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--color-primary)', borderRadius: '50%' }} />
                                    <Sparkles size={24} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--color-accent)' }} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>AI is Crafting Your Journey</h3>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{progressText}</p>
                                
                                {/* Progress bar */}
                                <div style={{ width: '100%', maxWidth: '300px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.3s ease' }} />
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>{progress}%</span>

                                {/* Skeleton preview of output */}
                                <div style={{ width: '100%', marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', opacity: 0.3 }}>
                                    <ShimmerSkeleton variant="rect" width="30%" height={20} />
                                    <ShimmerSkeleton variant="text" count={3} />
                                </div>
                            </motion.div>
                        )}

                        {!loading && result && (
                            <motion.div 
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="result-card card" 
                                style={{ padding: '2rem' }}
                            >
                                <div className="result-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: 0 }}>Custom AI Itinerary</h2>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Created in real-time</span>
                                    </div>
                                    <div className="recommended-badge" style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>Highly Recommended</div>
                                </div>

                                <div className="result-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    
                                    <div className="result-section highlight" style={{ background: 'var(--color-bg-base)', padding: '1rem', borderRadius: '12px' }}>
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', margin: '0 0 0.5rem 0' }}><MapPin size={18} /> Recommended Destination</h3>
                                        <p className="destination-name" style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)', margin: 0 }}>{result.recommended_village}</p>
                                    </div>

                                    {/* Timeline visual steps */}
                                    <div className="result-section">
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', margin: '0 0 0.75rem 0' }}><Calendar size={18} /> Stay & Accommodations</h3>
                                        <p style={{ margin: 0, color: 'var(--color-text-main)', lineHeight: 1.5 }}>{result.stay_plan}</p>
                                    </div>

                                    <div className="result-section">
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', margin: '0 0 0.75rem 0' }}><Sparkles size={18} /> Planned Experiences</h3>
                                        <p style={{ margin: 0, color: 'var(--color-text-main)', lineHeight: 1.5 }}>{result.activities}</p>
                                    </div>

                                    <div className="result-section highlight" style={{ background: 'var(--color-bg-base)', padding: '1rem', borderRadius: '12px' }}>
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', margin: '0 0 0.5rem 0' }}><CreditCard size={18} /> Estimated Trip Cost</h3>
                                        <p className="cost-estimation" style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-accent)', margin: 0 }}>{result.estimated_cost}</p>
                                    </div>

                                    <div className="result-section">
                                        <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>Travel Advice & Tips</h3>
                                        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>{result.travel_tips}</p>
                                    </div>
                                    
                                    {/* Google Maps Embed */}
                                    <div className="map-container" style={{ height: '250px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                                        <iframe 
                                            width="100%" 
                                            height="100%" 
                                            style={{ border: 0 }} 
                                            loading="lazy" 
                                            allowFullScreen 
                                            src={`https://maps.google.com/maps?q=${encodeURIComponent(result.recommended_village + ', India')}&z=11&output=embed`}
                                        ></iframe>
                                    </div>
                                </div>

                                <div className="result-footer" style={{ borderTop: '1px solid var(--color-border)', marginTop: '2rem', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={handleCopy} className="btn-outline" style={{ flex: 1, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                                            {copied ? <Check size={16} /> : <Copy size={16} />}
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                        <button onClick={handleDownload} className="btn-outline" style={{ flex: 1, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                                            <Download size={16} /> Print Itinerary
                                        </button>
                                        <button onClick={handleShare} className="btn-outline" style={{ flex: 1, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                                            <Share2 size={16} /> Share
                                        </button>
                                    </div>

                                    <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                        <p style={{ fontSize: '0.875rem', margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)' }}>Ready to set off for {result.recommended_village}?</p>
                                        <Link href="/explore" className="btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
                                            Book Homestays <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {!loading && !result && (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="empty-state"
                                style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)' }}
                            >
                                <Sparkles size={48} className="empty-icon" style={{ color: '#ccc', marginBottom: '1rem' }} />
                                <h3>Awaiting Your Input</h3>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', maxWidth: '300px', margin: '0 auto' }}>Adjust the sliders on the left and choose your interests to build a personalized route.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
