'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Mail, Home, Calendar, Users, CreditCard, ArrowLeft, Printer, MapPin } from 'lucide-react';

function BookingConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [emailStatus, setEmailStatus] = useState('idle'); // 'idle' | 'sending' | 'sent'
    const [refCode, setRefCode] = useState('');

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        // Generate a random mock reference code like GT-2026-X83K9
        const rand = Math.floor(10000 + Math.random() * 90000);
        setRefCode(`GT-2026-X${rand}`);

        fetch(`/api/bookings?id=${id}`)
            .then(res => res.json())
            .then(data => {
                setBooking(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching booking details:", err);
                setLoading(false);
            });
    }, [id]);

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    const handleMockEmail = () => {
        setEmailStatus('sending');
        setTimeout(() => {
            setEmailStatus('sent');
            alert(`Mock email confirmation dispatched successfully for Booking #${id}!`);
        }, 1200);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '1rem' }}>
                <div className="skeleton" style={{ width: '64px', height: '64px', borderRadius: '50%' }}></div>
                <div className="skeleton" style={{ width: '250px', height: '32px' }}></div>
                <div className="skeleton" style={{ width: '400px', height: '100px' }}></div>
            </div>
        );
    }

    if (!id || !booking) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h2>No Booking Found</h2>
                <p>We couldn't retrieve the details for this booking.</p>
                <Link href="/" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>Return Home</Link>
            </div>
        );
    }

    // Determine pricing: Homestay price vs experience price
    const basePrice = booking.experience_id ? (booking.experience_price || 0) : (booking.homestay_price || 0);
    const amountPaid = basePrice * booking.persons;

    return (
        <div style={{ minHeight: '90vh', background: 'var(--color-bg-base)', padding: '80px 1.5rem 4rem' }}>
            <div style={{ maxWidth: '650px', margin: '0 auto' }}>
                
                {/* Header Go Back */}
                <button 
                    onClick={() => router.push('/dashboard')} 
                    className="no-print"
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontWeight: '500' }}
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                {/* Main Receipt Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}
                >
                    {/* Top Green Banner */}
                    <div style={{ background: 'linear-gradient(135deg, #2e8b57, #1e5a38)', padding: '3rem 2rem', color: 'white', textAlign: 'center', position: 'relative' }}>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            style={{ display: 'inline-flex', background: 'white', color: '#2e8b57', borderRadius: '50%', padding: '0.25rem', marginBottom: '1rem' }}
                        >
                            <CheckCircle size={48} />
                        </motion.div>
                        <h1 style={{ color: 'white', fontSize: '2rem', margin: 0, fontWeight: '700' }}>Booking Confirmed!</h1>
                        <p style={{ margin: '0.5rem 0 0', opacity: 0.9 }}>Thank you for supporting rural tourism communities.</p>
                    </div>

                    {/* Receipt Details Block */}
                    <div style={{ padding: '2.5rem 2rem' }}>
                        
                        {/* Reference / ID header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--color-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>Reference Code</span>
                                <strong style={{ fontSize: '1.125rem', color: 'var(--color-text-main)' }}>{refCode}</strong>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>Booking ID</span>
                                <strong style={{ fontSize: '1.125rem', color: 'var(--color-text-main)' }}>#{booking.id}</strong>
                            </div>
                        </div>

                        {/* Booking Target Info */}
                        <div style={{ background: 'var(--color-bg-base)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.75rem' }}>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                                {booking.experience_id ? 'Experience Stay' : 'Village Visit'}
                            </span>
                            <h2 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--color-primary)' }}>{booking.display_title}</h2>
                            <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                                <MapPin size={14} /> {booking.village_name}
                            </p>
                        </div>

                        {/* Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <Calendar size={18} style={{ color: 'var(--color-primary)', marginTop: '0.15rem' }} />
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Selected Date</span>
                                    <span style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{booking.booking_date}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <Users size={18} style={{ color: 'var(--color-primary)', marginTop: '0.15rem' }} />
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Total Guests</span>
                                    <span style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{booking.persons} {booking.persons > 1 ? 'Persons' : 'Person'}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <CreditCard size={18} style={{ color: 'var(--color-primary)', marginTop: '0.15rem' }} />
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Amount Paid</span>
                                    <span style={{ fontWeight: '700', color: 'var(--color-accent)', fontSize: '1.1rem' }}>₹{amountPaid}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <CheckCircle size={18} style={{ color: 'var(--color-primary)', marginTop: '0.15rem' }} />
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Payment Method</span>
                                    <span style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>UPI QR Code</span>
                                </div>
                            </div>
                            {booking.photo_id_url && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', gridColumn: 'span 2' }}>
                                    <Download size={18} style={{ color: 'var(--color-primary)', marginTop: '0.15rem' }} />
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Traveler Photo ID</span>
                                        <a href={booking.photo_id_url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: '600', color: 'var(--color-primary)', textDecoration: 'none' }} className="no-print">
                                            View Uploaded ID Document
                                        </a>
                                        <span style={{ fontWeight: '600', color: 'var(--color-text-main)', display: 'none' }} className="only-print">
                                            ID Uploaded & Verified
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interactive Buttons */}
                        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px dashed var(--color-border)', paddingTop: '1.75rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                    onClick={handlePrint}
                                    className="btn-outline" 
                                    style={{ flex: 1, padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: 'var(--radius-md)' }}
                                >
                                    <Printer size={18} /> Print / PDF
                                </button>
                                <button 
                                    onClick={handleMockEmail}
                                    className="btn-outline"
                                    disabled={emailStatus === 'sending'}
                                    style={{ flex: 1, padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: 'var(--radius-md)' }}
                                >
                                    <Mail size={18} /> 
                                    {emailStatus === 'idle' && "Email Ticket"}
                                    {emailStatus === 'sending' && "Sending..."}
                                    {emailStatus === 'sent' && "Resend Email"}
                                </button>
                            </div>
                            <Link href="/" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', textDecoration: 'none' }}>
                                <Home size={18} /> Return to Homepage
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function BookingConfirmationPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>Loading Confirmation...</div>}>
            <BookingConfirmationContent />
        </Suspense>
    );
}
