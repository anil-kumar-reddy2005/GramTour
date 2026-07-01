'use client';
import { useState, useEffect } from 'react';
import { X, Calendar, Users, Phone, QrCode, MailCheck, IndianRupee, CreditCard, Smartphone, Building, Upload } from 'lucide-react';
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

    // Photo ID states
    const [photoIdUrl, setPhotoIdUrl] = useState('');
    const [uploadingPhotoId, setUploadingPhotoId] = useState(false);
    const [photoIdFileName, setPhotoIdFileName] = useState('');

    // Payment States
    const [paymentMethod, setPaymentMethod] = useState('qr'); // 'qr' | 'upi' | 'card' | 'netbanking'
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [selectedBank, setSelectedBank] = useState('');

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
            setPaymentMethod('qr');
            setUpiId('');
            setCardNumber('');
            setCardExpiry('');
            setCardCvv('');
            setCardName('');
            setSelectedBank('');
            setPhotoIdUrl('');
            setUploadingPhotoId(false);
            setPhotoIdFileName('');
        } else {
            // Fetch dynamic QR code when modal opens
            fetch('/api/admin/settings')
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('Failed to load settings');
                })
                .then(data => {
                    if (data && data.qrCodeUrl) setQrCodeUrl(data.qrCodeUrl);
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

    const isFormValid = date && persons && phone && photoIdUrl && !dateError && !personsError && !phoneError && !uploadingPhotoId;

    const isPaymentValid = () => {
        if (paymentMethod === 'qr') return true;
        if (paymentMethod === 'upi') return upiId.includes('@') && upiId.length > 3;
        if (paymentMethod === 'card') {
            return cardNumber.replace(/\s/g, '').length === 16 && 
                   cardExpiry.length === 5 && 
                   cardCvv.length === 3 && 
                   cardName.trim().length > 2;
        }
        if (paymentMethod === 'netbanking') return selectedBank !== '';
        return false;
    };

    const handlePhotoIdChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPhotoIdFileName(file.name);
        setUploadingPhotoId(true);
        setToast('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/bookings/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setPhotoIdUrl(data.fileUrl);
            } else {
                setToast(data.error || 'Failed to upload photo ID.');
            }
        } catch (err) {
            console.error(err);
            setToast('Error uploading photo ID.');
        } finally {
            setUploadingPhotoId(false);
        }
    };

    const handleProceedToPayment = (e) => {
        e.preventDefault();
        setDateTouched(true);
        setPersonsTouched(true);
        setPhoneTouched(true);

        if (!isFormValid) {
            setToast('Please upload traveler Photo ID and fill in all other fields before proceeding.');
            return;
        }

        setToast('');
        setStep(2);
    };

    const handleConfirmPayment = async () => {
        if (!isPaymentValid()) {
            if (paymentMethod === 'upi') {
                if (!upiId) setToast('UPI ID is required. Please enter your UPI ID.');
                else if (!upiId.includes('@')) setToast('Invalid UPI ID. Must contain @ symbol (e.g. name@upi).');
                else setToast('Please enter a valid UPI ID.');
            } else if (paymentMethod === 'card') {
                if (!cardName.trim()) setToast('Cardholder Name is required.');
                else if (!cardNumber) setToast('Card Number is required.');
                else if (cardNumber.replace(/\s/g, '').length !== 16) setToast('Card Number must be exactly 16 digits.');
                else if (!cardExpiry) setToast('Expiry Date is required.');
                else if (cardExpiry.length !== 5) setToast('Expiry Date must be in MM/YY format.');
                else if (!cardCvv) setToast('CVV is required.');
                else if (cardCvv.length !== 3) setToast('CVV must be exactly 3 digits.');
                else setToast('Please complete all debit/credit card fields.');
            } else if (paymentMethod === 'netbanking') {
                if (!selectedBank) setToast('Please select your bank from the list.');
                else setToast('Please complete banking selection.');
            } else {
                setToast('Please enter valid payment details.');
            }
            return;
        }

        setLoading(true);
        setToast('');
        try {
            const payload = {
                booking_date: date,
                persons: parseInt(persons.toString()),
                contact_phone: phone,
                status: 'confirmed',
                payment_method: paymentMethod,
                photo_id_url: photoIdUrl,
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
                    <h2>Book {title}</h2>
                    <p className="subtitle">{villageName}</p>
                </div>

                {step === 1 && (
                    <form onSubmit={handleProceedToPayment} className="booking-form" noValidate>
                        <div className="form-group">
                            <label htmlFor="booking_date"><Calendar size={16} /> Booking Date</label>
                            <input
                                type="date"
                                id="booking_date"
                                value={date}
                                min={todayStr}
                                onChange={(e) => setDate(e.target.value)}
                                onBlur={() => setDateTouched(true)}
                                className={dateError ? 'error-input' : ''}
                                required
                            />
                            {dateError && <span className="field-error">{dateError}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="persons"><Users size={16} /> Number of Persons</label>
                                <input
                                    type="number"
                                    id="persons"
                                    min="1"
                                    max="10"
                                    value={persons}
                                    onChange={(e) => setPersons(parseInt(e.target.value) || 1)}
                                    onBlur={() => setPersonsTouched(true)}
                                    className={personsError ? 'error-input' : ''}
                                    required
                                />
                                {personsError && <span className="field-error">{personsError}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone"><Phone size={16} /> Contact Phone</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phone}
                                    placeholder="Enter 10-digit phone"
                                    onChange={(e) => setPhone(e.target.value)}
                                    onBlur={() => setPhoneTouched(true)}
                                    className={phoneError ? 'error-input' : ''}
                                    required
                                />
                                {phoneError && <span className="field-error">{phoneError}</span>}
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-main)' }}>
                                <Upload size={16} /> Traveler Photo ID (Required)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                                <input
                                    type="file"
                                    id="photo_id"
                                    accept="image/*,application/pdf"
                                    onChange={handlePhotoIdChange}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('photo_id').click()}
                                    className="btn-outline"
                                    disabled={uploadingPhotoId}
                                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    {uploadingPhotoId ? 'Uploading...' : 'Choose File'}
                                </button>
                                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                    {photoIdFileName || 'No file chosen'}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', margin: 0 }}>Upload Aadhaar, Passport, or Voter ID copy to verify traveler identity.</p>
                        </div>

                        <div className="booking-summary">
                            <div className="summary-row">
                                <span>Base Price:</span>
                                <span>₹{basePrice} / person</span>
                            </div>
                            <div className="summary-row">
                                <span>Guests:</span>
                                <span>{persons}</span>
                            </div>
                            <div className="summary-row total">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><IndianRupee size={18} />Total Price:</span>
                                <span>₹{totalEstimated}</span>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-100" disabled={!isFormValid}>
                            Proceed to Payment
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <div className="payment-step" style={{ padding: '0.5rem 0' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-main)', textAlign: 'center' }}>Choose Payment Method</h3>
                        
                        {/* Payment Selector Tabs */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '1.5rem' }}>
                            <button 
                                type="button" 
                                onClick={() => { setPaymentMethod('qr'); setToast(''); }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.5rem 0.25rem',
                                    borderRadius: '8px',
                                    border: `2px solid ${paymentMethod === 'qr' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    background: paymentMethod === 'qr' ? 'var(--color-bg-base)' : 'var(--color-surface)',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    color: 'var(--color-text-main)',
                                    fontWeight: '600'
                                }}
                            >
                                <QrCode size={18} />
                                QR Code
                            </button>
                            <button 
                                type="button" 
                                onClick={() => { setPaymentMethod('upi'); setToast(''); }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.5rem 0.25rem',
                                    borderRadius: '8px',
                                    border: `2px solid ${paymentMethod === 'upi' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    background: paymentMethod === 'upi' ? 'var(--color-bg-base)' : 'var(--color-surface)',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    color: 'var(--color-text-main)',
                                    fontWeight: '600'
                                }}
                            >
                                <Smartphone size={18} />
                                UPI ID
                            </button>
                            <button 
                                type="button" 
                                onClick={() => { setPaymentMethod('card'); setToast(''); }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.5rem 0.25rem',
                                    borderRadius: '8px',
                                    border: `2px solid ${paymentMethod === 'card' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    background: paymentMethod === 'card' ? 'var(--color-bg-base)' : 'var(--color-surface)',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    color: 'var(--color-text-main)',
                                    fontWeight: '600'
                                }}
                            >
                                <CreditCard size={18} />
                                Card
                            </button>
                            <button 
                                type="button" 
                                onClick={() => { setPaymentMethod('netbanking'); setToast(''); }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.5rem 0.25rem',
                                    borderRadius: '8px',
                                    border: `2px solid ${paymentMethod === 'netbanking' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    background: paymentMethod === 'netbanking' ? 'var(--color-bg-base)' : 'var(--color-surface)',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    color: 'var(--color-text-main)',
                                    fontWeight: '600'
                                }}
                            >
                                <Building size={18} />
                                Banking
                            </button>
                        </div>

                        {/* QR Code Section */}
                        {paymentMethod === 'qr' && (
                            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                                <div
                                    style={{
                                        background: 'white',
                                        padding: '1rem',
                                        display: 'inline-block',
                                        borderRadius: '1rem',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        border: '1px solid var(--color-border)',
                                        marginBottom: '1rem'
                                    }}
                                >
                                    {qrCodeUrl ? (
                                        <div style={{ width: '180px', height: '180px' }}>
                                            <SmartImage src={qrCodeUrl} alt="UPI QR Code" objectFit="contain" />
                                        </div>
                                    ) : (
                                        <div style={{ width: '180px', height: '180px', background: 'repeating-linear-gradient(45deg, #000, #000 10px, #fff 10px, #fff 20px)', opacity: 0.1, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <QrCode size={64} style={{ color: 'var(--color-primary)' }} />
                                        </div>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>Use any UPI app to scan and pay.</p>
                            </div>
                        )}

                        {/* UPI ID Section */}
                        {paymentMethod === 'upi' && (
                            <div style={{ textAlign: 'left', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label htmlFor="upi_id" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-main)' }}>UPI ID / VPA</label>
                                <input 
                                    type="text" 
                                    id="upi_id"
                                    value={upiId} 
                                    onChange={(e) => setUpiId(e.target.value)} 
                                    placeholder="yourname@upi" 
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>A request will be sent to your UPI app for confirmation.</p>
                            </div>
                        )}

                        {/* Debit/Credit Card Section */}
                        {paymentMethod === 'card' && (
                            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-main)' }}>Cardholder Name</label>
                                    <input 
                                        type="text" 
                                        value={cardName} 
                                        onChange={(e) => setCardName(e.target.value)} 
                                        placeholder="John Doe" 
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-main)' }}>Card Number</label>
                                    <input 
                                        type="text" 
                                        value={cardNumber} 
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                            const formatted = val.replace(/(.{4})/g, '$1 ').trim();
                                            setCardNumber(formatted);
                                        }} 
                                        placeholder="4111 2222 3333 4444" 
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-main)' }}>Expiry Date</label>
                                        <input 
                                            type="text" 
                                            value={cardExpiry} 
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                if (val.length >= 2) {
                                                    setCardExpiry(val.slice(0, 2) + '/' + val.slice(2));
                                                } else {
                                                    setCardExpiry(val);
                                                }
                                            }} 
                                            placeholder="MM/YY" 
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-main)' }}>CVV</label>
                                        <input 
                                            type="password" 
                                            value={cardCvv} 
                                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} 
                                            placeholder="•••" 
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Net Banking Section */}
                        {paymentMethod === 'netbanking' && (
                            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-main)' }}>Select Bank</label>
                                <select 
                                    value={selectedBank} 
                                    onChange={(e) => setSelectedBank(e.target.value)} 
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                                >
                                    <option value="">-- Choose Your Bank --</option>
                                    <option value="sbi">State Bank of India (SBI)</option>
                                    <option value="hdfc">HDFC Bank</option>
                                    <option value="icici">ICICI Bank</option>
                                    <option value="axis">Axis Bank</option>
                                    <option value="kotak">Kotak Mahindra Bank</option>
                                </select>
                            </div>
                        )}

                        <div className="booking-summary" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                            <div className="summary-row total">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><IndianRupee size={18} />Amount Due:</span>
                                <span>₹{totalEstimated}</span>
                            </div>
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
