'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addExperience } from '../../../actions/adminActions';
import '../../admin.css';

export default function NewExperiencePage() {
    const router = useRouter();
    const [villages, setVillages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/villages')
            .then(res => res.json())
            .then(data => {
                setVillages(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load villages.');
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const formData = new FormData(e.target);

        try {
            const res = await addExperience(formData);
            if (res.error) {
                setError(res.error);
                setSubmitting(false);
            } else {
                router.push('/admin?tab=experiences');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading villages...</div>;

    return (
        <div className="admin-page" style={{ paddingTop: '80px' }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1>Add New Experience</h1>
                    <Link href="/admin?tab=experiences" className="btn-outline" style={{ padding: '0.5rem 1rem' }}>Cancel</Link>
                </div>

                {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Village</label>
                        <select name="village_id" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                            <option value="">Select a village...</option>
                            {villages.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title</label>
                        <input type="text" name="title" required placeholder="e.g. Traditional Pottery Making" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                        <textarea name="description" required rows="4" placeholder="Describe the experience..." style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}></textarea>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Duration (Hours)</label>
                            <input type="number" name="duration_hours" required placeholder="e.g. 2" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price (₹)</label>
                            <input type="number" name="price" required placeholder="e.g. 500" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Image URL</label>
                        <input type="text" name="image" placeholder="https://example.com/image.jpg" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                    </div>

                    <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                        {submitting ? 'Adding...' : 'Add Experience'}
                    </button>
                </form>
            </div>
        </div>
    );
}
