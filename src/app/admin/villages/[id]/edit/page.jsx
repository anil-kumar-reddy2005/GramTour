'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { editVillage } from '../../../../actions/adminActions';
import '../../../admin.css';
import { use } from 'react';

export default function EditVillage({ params }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [village, setVillage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/villages')
            .then(res => res.json())
            .then(data => {
                const found = data.find(v => v.id === parseInt(resolvedParams.id));
                setVillage(found);
                setInitialLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch village", err);
                setInitialLoading(false);
            });
    }, [resolvedParams.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.target);
        const result = await editVillage(resolvedParams.id, formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push('/admin');
            router.refresh();
        }
    };

    if (initialLoading) return <div className="loading" style={{ padding: '4rem', textAlign: 'center' }}>Loading village data...</div>;
    if (!village) return <div className="error" style={{ padding: '4rem', textAlign: 'center' }}>Village not found</div>;

    return (
        <div className="admin-page">
            <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <h2>Edit Village: {village.name}</h2>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>Update the details of this destination.</p>

                    {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Village Name</label>
                                <input name="name" type="text" defaultValue={village.name} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>State</label>
                                <input name="state" type="text" defaultValue={village.state} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Latitude</label>
                                <input name="latitude" type="number" step="any" defaultValue={village.latitude} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Longitude</label>
                                <input name="longitude" type="number" step="any" defaultValue={village.longitude} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Price / Night (₹)</label>
                                <input name="homestay_price" type="number" defaultValue={village.homestay_price} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Short Description</label>
                            <input name="short_description" type="text" defaultValue={village.short_description} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Long Description</label>
                            <textarea name="long_description" rows="4" defaultValue={village.long_description} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}></textarea>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Main Image URL</label>
                                <input name="main_image" type="url" defaultValue={village.main_image} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Hero Image URL</label>
                                <input name="hero_image" type="url" defaultValue={village.hero_image} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Experiences Overview</label>
                            <textarea name="experiences_overview" rows="2" defaultValue={village.experiences_overview} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}></textarea>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Community Impact</label>
                            <textarea name="community_impact" rows="2" defaultValue={village.community_impact} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
                                {loading ? 'Saving...' : 'Update Village'}
                            </button>
                            <button type="button" onClick={() => router.push('/admin')} className="btn-outline" style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer' }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
