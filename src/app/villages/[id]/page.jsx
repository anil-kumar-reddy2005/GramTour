'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Calendar, IndianRupee, Clock, BookOpen } from 'lucide-react';
import BookingModal from '../../../components/BookingModal';
import ReviewSection from '../../../components/ReviewSection';
import WishlistButton from '../../../components/WishlistButton';
import SmartImage from '../../../components/SmartImage';
import ShimmerSkeleton from '../../../components/ShimmerSkeleton';
import './village.css';
export default function VillageDetails() {
    const { id } = useParams();
    const [village, setVillage] = useState(null);
    const [experiences, setExperiences] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [targetType, setTargetType] = useState('village');
    const [isModalOpen, setIsModalOpen] = useState(false);
    useEffect(() => {
        Promise.all([
            fetch(`/api/villages?id=${id}`).then(res => res.json()),
            fetch(`/api/experiences?village_id=${id}`).then(res => res.json()),
            fetch(`/api/products?village_id=${id}`).then(res => res.json())
        ]).then(([vData, eData, pData]) => {
            setVillage(vData);
            setExperiences(eData);
            setProducts(pData);
            setLoading(false);
        });
    }, [id]);
    const openModal = (target, type = 'experience') => {
        setTargetType(type);
        setSelectedTarget(target);
        setIsModalOpen(true);
    };
    if (loading) {
        return (
            <div className="village-details" style={{ paddingTop: '80px' }}>
                <div style={{ background: '#f3f4f6', height: '40vh', display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <div className="skeleton" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}></div>
                    <div className="container hero-content" style={{ position: 'relative', zIndex: 1 }}>
                        <ShimmerSkeleton variant="rect" width={120} height={28} style={{ marginBottom: '1rem', borderRadius: '20px' }} />
                        <ShimmerSkeleton variant="rect" width="50%" height={48} style={{ marginBottom: '1rem' }} />
                        <ShimmerSkeleton variant="rect" width="70%" height={20} />
                    </div>
                </div>

                <div className="container content-grid" style={{ marginTop: '3rem' }}>
                    <div className="main-content">
                        <section className="village-section">
                            <ShimmerSkeleton variant="rect" width="30%" height={32} style={{ marginBottom: '1rem' }} />
                            <ShimmerSkeleton variant="text" count={4} />
                        </section>
                        <section className="village-section" style={{ marginTop: '2rem' }}>
                            <ShimmerSkeleton variant="rect" width="25%" height={32} style={{ marginBottom: '1rem' }} />
                            <ShimmerSkeleton variant="text" count={3} />
                        </section>
                    </div>
                    <aside className="sidebar">
                        <div className="card" style={{ padding: '2rem' }}>
                            <ShimmerSkeleton variant="rect" width="60%" height={24} style={{ marginBottom: '1.5rem' }} />
                            <ShimmerSkeleton variant="rect" width="100%" height={20} count={3} style={{ marginBottom: '1rem' }} />
                            <ShimmerSkeleton variant="rect" width="100%" height={50} style={{ marginTop: '1.5rem', borderRadius: '8px' }} />
                        </div>
                    </aside>
                </div>
            </div>
        );
    }
    if (!village || village.error)
        return <div className="no-results">Village not found.</div>;
    return (<div className="village-details">
        <div className="village-hero" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, background: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.6))' }}></div>
            <SmartImage src={village.hero_image} alt={village.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />
            <div className="container hero-content" style={{ position: 'relative', zIndex: 2 }}>
                <div className="location-badge"><MapPin size={16} /> {village.state}</div>
                <div className="hero-title-flex">
                    <h1>{village.name}</h1>
                    <WishlistButton itemId={id} itemType="village" />
                </div>
                <p>{village.short_description}</p>
            </div>
        </div>

        <div className="container content-grid">
            <div className="main-content">
                <section className="village-section">
                    <h2>About {village.name}</h2>
                    <p className="full-description">{village.full_description}</p>
                </section>

                <section className="village-section">
                    <h2>Culture & Heritage</h2>
                    <p>{village.culture}</p>
                </section>

                <section className="village-section">
                    <h2>Experiences</h2>
                    {experiences.length === 0 ? (<p>No experiences available yet.</p>) : (<div className="experiences-list">
                        {experiences.map(exp => (<div key={exp.id} className="experience-card card">
                            <div className="exp-image" style={{ position: 'relative', overflow: 'hidden' }}>
                                <SmartImage src={exp.image} alt={exp.title} fallbackSrc="https://images.unsplash.com/photo-1544322444-6a84742a7c47?q=80&w=800" />
                            </div>
                            <div className="exp-details">
                                <h3>{exp.title}</h3>
                                <p>{exp.description}</p>
                                <div className="exp-meta">
                                    <span><Clock size={16} /> {exp.duration_hours} Hours</span>
                                    <span className="price"><IndianRupee size={16} /> {exp.price} / person</span>
                                </div>
                                <button className="btn-primary" onClick={() => openModal(exp, 'experience')}>Book Experience</button>
                            </div>
                        </div>))}
                    </div>)}
                </section>

                <section className="village-section">
                    <h2>Artisan Products</h2>
                    {products.length === 0 ? (<p>No products available yet.</p>) : (<div className="products-grid">
                        {products.map(prod => (<div key={prod.id} className="product-card card">
                            <div className="prod-image" style={{ position: 'relative', overflow: 'hidden' }}>
                                <SmartImage src={prod.image} alt={prod.product_name} fallbackSrc="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=800" />
                            </div>
                            <div className="prod-info">
                                <h3>{prod.product_name}</h3>
                                <p className="artisan">By {prod.artisan_name}</p>
                                <div className="prod-bottom">
                                    <span className="price">₹{prod.price}</span>
                                    <a href="/marketplace" className="btn-accent" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>View Details</a>
                                </div>
                            </div>
                        </div>))}
                    </div>)}
                </section>

                <ReviewSection targetId={id} targetType="village" />
            </div>

            <aside className="sidebar">
                <div className="info-card card">
                    <h3>Plan Your Visit</h3>

                    <div className="info-item">
                        <Calendar className="icon" size={20} />
                        <div>
                            <strong>Best Time to Visit</strong>
                            <p>{village.best_time}</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <BookOpen className="icon" size={20} />
                        <div>
                            <strong>Homestay Starting Price</strong>
                            <p>₹{village.homestay_price} per night</p>
                        </div>
                    </div>

                    <button
                        className="btn-primary w-100"
                        style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}
                        onClick={() => openModal(village, 'village')}
                    >
                        Book Your Visit
                    </button>

                    <hr />

                    <div className="map-container">
                        <iframe width="100%" height="250" style={{ border: 0, borderRadius: 'var(--radius-md)' }} loading="lazy" allowFullScreen src={`https://maps.google.com/maps?q=${village.latitude},${village.longitude}&z=12&output=embed`}></iframe>
                    </div>
                    <div className="coordinates text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>
                        Lat: {village.latitude}, Lng: {village.longitude}
                    </div>
                </div>
            </aside>
        </div>

        <BookingModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            targetItem={selectedTarget}
            targetType={targetType}
            villageName={village.name}
        />
    </div>);
}
