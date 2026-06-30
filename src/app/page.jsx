'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, Sparkles, MapPin, ArrowRight, Paintbrush, Heart, Music, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import SmartImage from '../components/SmartImage';

export default function Home() {
    const categories = [
        { name: 'Arts & Crafts', desc: 'Handicrafts, painting, pottery', image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800&q=80', icon: Paintbrush },
        { name: 'Culture', desc: 'Music, dance, festivals', image: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=800&q=80', icon: Music },
        { name: 'Nature', desc: 'Valleys, backwaters, green fields', image: 'https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?auto=format&fit=crop&w=800&q=80', icon: Sun },
        { name: 'Tribal Heritage', desc: 'Indigenous lifestyle, folklore', image: 'https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&w=800&q=80', icon: Heart }
    ];

    const featuredDestinations = [
        { id: 1, name: 'Pochampally', state: 'Telangana', desc: 'Ikat weaving heritage village known as the Silk City.', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', price: 1500 },
        { id: 2, name: 'Araku Valley', state: 'Andhra Pradesh', desc: 'Tribal valley famous for organic coffee and rich culture.', image: 'https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?auto=format&fit=crop&w=800&q=80', price: 2000 },
        { id: 3, name: 'Raghurajpur', state: 'Odisha', desc: 'Heritage crafts village renowned for Pattachitra art.', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80', price: 1800 }
    ];

    // Stagger container animation
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
    };

    return (
        <div style={{ background: 'var(--color-bg-base)', minHeight: '100vh' }}>
            
            {/* Hero Section */}
            <section className="hero" style={{ position: 'relative', height: '85vh', minHeight: '550px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white', overflow: 'hidden' }}>
                <SmartImage 
                    src="https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=1920&q=80" 
                    alt="Rural India Fields Backdrop"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
                />
                
                {/* Visual overlay gradient for maximum text contrast */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(27, 61, 34, 0.75) 0%, rgba(13, 26, 17, 0.85) 100%)', zIndex: 1 }} />

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="hero-content" 
                    style={{ position: 'relative', zIndex: 2, padding: '0 1.5rem', maxWidth: '800px' }}
                >
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1.5rem', color: 'white', textShadow: '0 4px 15px rgba(0,0,0,0.4)', lineHeight: 1.1 }}
                    >
                        Discover Hidden Rural India
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        style={{ fontSize: '1.25rem', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '2.5rem', textShadow: '0 2px 8px rgba(0,0,0,0.3)', fontWeight: '400', lineHeight: 1.6 }}
                    >
                        Immerse yourself in authentic village life, handcrafted arts, and local heritage off the beaten path.
                    </motion.p>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="hero-actions" 
                        style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
                    >
                        <Link href="/explore" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                            <Compass size={20} /> Explore Villages
                        </Link>
                        <Link href="/ai-planner" className="btn-accent ai-btn" style={{ padding: '1rem 2rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                            <Sparkles size={20} /> AI Trip Planner
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Categories Theme Section */}
            <section className="container categories-section" style={{ padding: '6rem 1.5rem' }}>
                <h2 className="section-title" style={{ fontSize: '2.25rem', textAlign: 'center', marginBottom: '3rem', fontWeight: '700' }}>Experiences by Theme</h2>
                
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="categories-grid" 
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.75rem' }}
                >
                    {categories.map((cat, idx) => {
                        const IconComponent = cat.icon;
                        return (
                            <motion.div 
                                key={cat.name}
                                variants={cardVariants}
                                whileHover={{ scale: 1.03, y: -5 }}
                                className="category-card" 
                                style={{ 
                                    position: 'relative', 
                                    height: '240px', 
                                    borderRadius: '16px', 
                                    overflow: 'hidden', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    justifyContent: 'flex-end', 
                                    padding: '2rem 1.5rem', 
                                    boxShadow: 'var(--shadow-md)', 
                                    cursor: 'pointer' 
                                }}
                            >
                                <SmartImage 
                                    src={cat.image} 
                                    alt={cat.name} 
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
                                />
                                {/* Bottom vignette gradient overlay */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.2) 70%, transparent 100%)', zIndex: 1 }} />
                                
                                <div style={{ position: 'relative', zIndex: 2, color: 'white' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: '#facc15' }}>
                                        <IconComponent size={18} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Theme</span>
                                    </div>
                                    <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{cat.name}</h3>
                                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', margin: '0.25rem 0 0', lineHeight: 1.3 }}>{cat.desc}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </section>

            {/* Featured destinations Section */}
            <section className="container featured-section" style={{ padding: '0 1.5rem 6rem' }}>
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <h2 className="section-title" style={{ fontSize: '2.25rem', margin: 0, fontWeight: '700' }}>Featured Destinations</h2>
                    <Link href="/explore" className="view-all" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>
                        View All <ArrowRight size={18} />
                    </Link>
                </div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="featured-grid" 
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}
                >
                    {featuredDestinations.map((dest) => (
                        <motion.div 
                            key={dest.id}
                            variants={cardVariants}
                            whileHover={{ y: -8 }}
                            transition={{ type: 'spring', stiffness: 150 }}
                            style={{ display: 'flex' }}
                        >
                            <Link href={`/villages/${dest.id}`} className="card village-card" style={{ display: 'flex', flexDirection: 'column', flex: 1, textDecoration: 'none', overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                                <div className="card-image" style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                                    <SmartImage 
                                        src={dest.image} 
                                        alt={dest.name} 
                                    />
                                </div>
                                <div className="card-content" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div className="location" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
                                        <MapPin size={14} /> {dest.state}
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: '0 0 0.5rem', fontWeight: '700' }}>{dest.name}</h3>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0 0 1.25rem', flex: 1, lineHeight: 1.4 }}>{dest.desc}</p>
                                    <div className="price-tag" style={{ fontWeight: '700', color: 'var(--color-accent)', fontSize: '1.1rem' }}>From ₹{dest.price} / night</div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Premium CTA Section */}
            <section className="cta-section" style={{ background: 'linear-gradient(135deg, var(--color-primary), #1b3d22)', padding: '5rem 1.5rem', color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.15, background: 'url("https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1500") center/cover' }} />
                <div className="container cta-content" style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.25rem', color: 'white', fontWeight: '700', marginBottom: '1rem' }}>Not sure where to start?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.5 }}>Let our AI Travel Planner design the perfect customized route and activities for your budget and travel style.</p>
                    <Link href="/ai-planner" className="btn-accent ai-cta-btn" style={{ padding: '1rem 2.25rem', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}>
                        Try AI Planner <Sparkles size={20} />
                    </Link>
                </div>
            </section>

        </div>
    );
}
