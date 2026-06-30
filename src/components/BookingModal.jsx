'use client';
import { useState, useEffect } from 'react';
import { X, Calendar, Users, Phone, QrCode, MailCheck, IndianRupee } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SmartImage from './SmartImage';
import './Modal.css';

export default function BookingModal({ isOpen, onClose, targetItem, targetType = 'experience', villageName }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [date, setDate] = useState('');
    const [persons, setPersons] = useState(1);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState(null);

    // Form touch tracking
    const [dateTouched, setDateTouched] = useState(false);
    const [personsTouched, setPersonsTouched] = useState(false);
    const [phoneTouched, setPhoneTouched] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setDate('');
            setPersons(1);
            setPhone('');
            setToast('');
            setDateTouched(false);
            setPersonsTouched(false);
            setPhoneTouched(false);
        } else {
            // Fetch dynamic QR code when modal opens
            fetch('/api/admin/settings')
                .then(res => res.json())
                .then(data => {
                    if (data.qrCodeUrl) setQrCodeUrl(data.qrCodeUrl);
                })
                .catch(err => console.error("Could not fetch QR code settings", err));
        }
    }, [isOpen]);

    if (!isOpen || !targetItem) return null;

    // Pricing
    const basePrice = targetType === 'village' ? targetItem.homestay_price : targetItem.price;
    const title = targetType === 'village' ? targetItem.name : targetItem.title;
    const totalEstimated = basePrice * persons;

    // Date validator
    const getTodayDateString = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    const todayStr = getTodayDateString();

    // Inline error messages
    const dateError = dateTouched && (!date ? 'Booking date is required' : date < todayStr ? 'Date cannot be in the past' : null);
    const personsError = personsTouched && (!persons ? 'Number of guests is required' : persons < 1 || persons > 10 ? 'Guests must be between 1 and 10' : null);
    
    // Clean phone number from standard separators and check if it has 10 digits
    const cleanedPhone = phone.replace(/[\s-+()]/g, '');
    const phoneError = phoneTouched && (!phone ? 'Contact phone is required' : cleanedPhone.length < 10 ? 'Enter a valid phone number (at least 10 digits)' : null);

    const isFormValid = date && persons && phone && !dateError && !personsError && !phoneError;

    const handleProceedToPayment = (e) => {
        e.preventDefault();
        setDateTouched(true);
        setPersonsTouched(true);
        setPhoneTouched(true);

        if (!isFormValid) {
            setToast('Please correct validation errors before proceeding.');
            return;
        }

        setToast('');
        setStep(2);
    };

    const handleConfirmPayment = async () => {
        setLoading(true);
        setToast('');
        try {
            const payload = {
                booking_date: date,
                persons: parseInt(persons.toString()),
                contact_phone: phone,
                status: 'confirmed',
            };

            if (targetType === 'village') {
                payload.village_id = targetItem.id;
            } else {
                payload.experience_id = targetItem.id;
            }

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            if (res.ok) {
                const data = await res.json();
                onClose();
                router.push(`/booking-confirmation?id=${data.id}`);
            } else {
                const errData = await res.json();
                setToast(errData.error || 'Failed to submit booking.');
            }
        } catch (err) {
            console.error(err);
            setToast('Failed to process payment. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <button className="modal-close" onClick={onClose} aria-label="Close booking modal"><X size={20} /></button>

                {toast && <div className="toast error" style={{ background: '#dc3545', color: 'white', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{toast}</div>}

                <div className="modal-header">
                    <h2>{targetType === 'village' ? 'Book Village Stay' : 'Book Experience'}</h2>
                    <p>{targetType === 'village' ? `Plan your visit to ${title}` : `${title} in ${villageName}`}</p>

                    {/* Stepper */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
                        <div style={{ height: '4px', flex: 1, backgroundColor: step >= 1 ? 'var(--color-primary)' : '#e2e8f0', borderRadius: '2px' }} />
                        <div style={{ height: '4px', flex: 1, backgroundColor: step >= 2 ? 'var(--color-primary)' : '#e2e8f0', borderRadius: '2px' }} />
                    </div>
                </div>

                {step === 1 && (
                    <form onSubmit={handleProceedToPayment} className="booking-form" noValidate>
                        <div className="form-group">
                            <label htmlFor="booking_date"><Calendar size={16} /> Booking Date</label>
                            <input 
                                type="date" 
                                id="booking_date"
                                required 
                                min={todayStr}
                                value={date} 
                                onBlur={() => setDateTouched(true)}
                                onChange={e => setDate(e.target.value)} 
                                style={{ borderColor: dateError ? '#ef4444' : '' }}
                            />
                            {dateError && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{dateError}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="persons"><Users size={16} /> Number of Persons</label>
                            <input 
                                type="number" 
                                id="persons"
                                min="1" 
                                max="10" 
                                required 
                                value={persons} 
                                onBlur={() => setPersonsTouched(true)}
                                onChange={e => setPersons(Number(e.target.value))} 
                                style={{ borderColor: personsError ? '#ef4444' : '' }}
                            />
                            {personsError && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{personsError}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone"><Phone size={16} /> Contact Phone</label>
                            <input 
                                type="tel" 
                                id="phone"
                                required 
                                value={phone} 
                                onBlur={() => setPhoneTouched(true)}
                                onChange={e => setPhone(e.target.value)} 
                                placeholder="+91 xxxxx xxxxx" 
                                style={{ borderColor: phoneError ? '#ef4444' : '' }}
                            />
                            {phoneError && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{phoneError}</span>}
                        </div>

                        <div className="booking-summary">
                            <div className="summary-row">
                                <span>Price per person:</span>
                                <span>₹{basePrice}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total Estimated:</span>
                                <span>₹{totalEstimated}</span>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-100" disabled={!isFormValid}>
                            Proceed to Payment
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <div className="payment-step" style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-main)' }}>Scan to Pay</h3>
                        <div
                            style={{
                                background: 'white',
                                padding: '1rem',
                                display: 'inline-block',
                                borderRadius: '1rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                border: '1px solid var(--color-border)',
                                marginBottom: '1.5rem'
                            }}
                        >
                            {qrCodeUrl ? (
                                <div style={{ width: '200px', height: '200px' }}>
                                    <SmartImage src={qrCodeUrl} alt="UPI QR Code" objectFit="contain" />
                                </div>
                            ) : (
                                <div style={{ width: '200px', height: '200px', background: 'repeating-linear-gradient(45deg, #000, #000 10px, #fff 10px, #fff 20px)', opacity: 0.1, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <QrCode size={64} style={{ color: 'var(--color-primary)' }} />
                                </div>
                            )}
                        </div>

                        <div className="booking-summary" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                            <div className="summary-row total">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><IndianRupee size={18} />Amount Due:</span>
                                <span>₹{totalEstimated}</span>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>Use any UPI app to scan and pay.</p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="button" onClick={() => setStep(1)} className="btn-outline" style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                Back
                            </button>
                            <button type="button" onClick={handleConfirmPayment} className="btn-primary" disabled={loading} style={{ flex: 2 }}>
                                {loading ? 'Processing...' : 'Confirm Payment'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
