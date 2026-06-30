'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin, Filter, Navigation as NavIcon, Image as ImageIcon, Search, Star, RefreshCw, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SmartImage from '../../components/SmartImage';
import ShimmerSkeleton from '../../components/ShimmerSkeleton';
import '../../components/skeleton.css';
import './explore.css';

export default function Explore() {
    const [villages, setVillages] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Core search & suggestion states
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // Filtering states
    const [stateFilter, setStateFilter] = useState('');
    const [maxPrice, setMaxPrice] = useState(5000);
    const [minRating, setMinRating] = useState(0);
    const [selectedActivity, setSelectedActivity] = useState('');
    const [activeTab, setActiveTab] = useState('villages'); // 'villages' | 'posts'
    
    // Mobile bottom sheet state
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    
    const suggestionRef = useRef(null);

    // Debounce searchQuery
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Fetch villages and posts
    useEffect(() => {
        Promise.all([
            fetch('/api/villages').then(res => res.json()),
            fetch('/api/creator_posts').then(res => res.json())
        ]).then(([villagesData, postsData]) => {
            if (Array.isArray(villagesData)) {
                // Add mock rating & activities dynamically if not in DB to support rich filters
                const extendedVillages = villagesData.map((v, i) => ({
                    ...v,
                    rating: i % 3 === 0 ? 4.8 : i % 3 === 1 ? 4.5 : 4.2,
                    activities: i % 3 === 0 ? ['Weaving', 'Pottery'] : i % 3 === 1 ? ['Cooking', 'Folk Dance'] : ['Boating', 'Village Walk']
                }));
                setVillages(extendedVillages);
            }
            if (Array.isArray(postsData)) setPosts(postsData);
            setLoading(false);
        }).catch(err => {
            console.error("Error fetching data:", err);
            setLoading(false);
        });
    }, []);

    // Close suggestions dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter villages
    const filteredVillages = villages.filter(v => {
        const matchesState = stateFilter ? v.state === stateFilter : true;
        const matchesSearch = debouncedQuery ? (
            v.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            v.short_description.toLowerCase().includes(debouncedQuery.toLowerCase())
        ) : true;
        const matchesPrice = v.homestay_price <= maxPrice;
        const matchesRating = v.rating >= minRating;
        const matchesActivity = selectedActivity ? v.activities.includes(selectedActivity) : true;

        return matchesState && matchesSearch && matchesPrice && matchesRating && matchesActivity;
    });

    // Filter posts
    const filteredPosts = posts.filter(p => {
        const matchesState = stateFilter ? p.location.includes(stateFilter) : true;
        const matchesSearch = debouncedQuery ? (
            p.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(debouncedQuery.toLowerCase())
        ) : true;
        const matchesPrice = p.price <= maxPrice;

        return matchesState && matchesSearch && matchesPrice;
    });

    const uniqueStates = Array.from(new Set(villages.map(v => v.state)));
    const allActivities = ['Weaving', 'Pottery', 'Cooking', 'Folk Dance', 'Boating', 'Village Walk'];

    // Autocomplete Suggestions
    const suggestions = searchQuery.length >= 2 
        ? villages.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
        : [];

    const handleResetFilters = () => {
        setStateFilter('');
        setMaxPrice(5000);
        setMinRating(0);
        setSelectedActivity('');
        setSearchQuery('');
    };

    // Text highlighting helper
    const highlightText = (text, highlight) => {
        if (!highlight.trim()) return <span>{text}</span>;
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) => 
                    regex.test(part) 
                        ? <mark key={i} style={{ background: '#fef08a', color: '#1e3a8a', padding: '0 2px', borderRadius: '2px' }}>{part}</mark>
                        : part
                )}
            </span>
        );
    };

    // Filter sidebar rendering
    const renderFilterControls = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="filter-group">
                <label className="filter-label">Region / State</label>
                <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="filter-select">
                    <option value="">All Regions</option>
                    {uniqueStates.map(state => (<option key={state} value={state}>{state}</option>))}
                </select>
            </div>

            <div className="filter-group">
                <label className="filter-label">Max Price (₹{maxPrice} / night)</label>
                <input 
                    type="range" 
                    min="500" 
                    max="5000" 
                    step="100" 
                    value={maxPrice} 
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    <span>₹500</span>
                    <span>₹5,000</span>
                </div>
            </div>

            <div className="filter-group">
                <label className="filter-label">Minimum Rating</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[0, 4.0, 4.5].map((stars) => (
                        <button
                            key={stars}
                            type="button"
                            onClick={() => setMinRating(stars)}
                            className={`tab-btn ${minRating === stars ? 'active' : ''}`}
                            style={{ 
                                flex: 1, 
                                padding: '0.5rem', 
                                border: '1px solid var(--color-border)', 
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                background: minRating === stars ? 'var(--color-primary)' : 'var(--color-bg-white)',
                                color: minRating === stars ? 'white' : 'var(--color-text-main)',
                                cursor: 'pointer'
                            }}
                        >
                            {stars === 0 ? 'All' : `${stars} ★`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-group">
                <label className="filter-label">Activities Offered</label>
                <select value={selectedActivity} onChange={(e) => setSelectedActivity(e.target.value)} className="filter-select">
                    <option value="">All Activities</option>
                    {allActivities.map(act => (<option key={act} value={act}>{act}</option>))}
                </select>
            </div>

            <button 
                type="button" 
                onClick={handleResetFilters} 
                className="btn-outline w-100"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', marginTop: '1rem' }}
            >
                <RefreshCw size={16} /> Reset Filters
            </button>
        </div>
    );

    return (
        <div className="explore-page" style={{ paddingTop: '80px', minHeight: '100vh' }}>
            <div className="explore-header" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, background: 'linear-gradient(rgba(46, 139, 87, 0.85), rgba(46, 139, 87, 0.95))' }}></div>
                <SmartImage 
                    src="https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=2000" 
                    alt="Travel India road background" 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
                />
                
                <div className="container header-container" style={{ position: 'relative', zIndex: 2 }}>
                    <h1 style={{ color: 'white', fontWeight: '700' }}>Explore Rural India</h1>
                    <p style={{ color: 'rgba(255,255,255,0.9)' }}>Discover authentic communities, homestays, and experiences shared by our creators.</p>

                    {/* Suggestions search bar wrapper */}
                    <div ref={suggestionRef} className="search-bar-container" style={{ maxWidth: '600px', margin: '2rem auto 0', position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', zIndex: 3 }} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab === 'villages' ? 'villages' : 'posts'} by name or state...`}
                            value={searchQuery}
                            onFocus={() => setShowSuggestions(true)}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(true);
                            }}
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                borderRadius: '30px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.15)',
                                color: 'white',
                                fontSize: '1rem',
                                backdropFilter: 'blur(10px)',
                                outline: 'none',
                                zIndex: 2
                            }}
                        />
                        
                        {/* Auto-suggestions list dropdown */}
                        <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    style={{
                                        position: 'absolute',
                                        top: '110%',
                                        left: 0,
                                        right: 0,
                                        background: 'var(--color-bg-white)',
                                        borderRadius: '16px',
                                        boxShadow: 'var(--shadow-lg)',
                                        zIndex: 10,
                                        overflow: 'hidden',
                                        textAlign: 'left',
                                        border: '1px solid var(--color-border)'
                                    }}
                                >
                                    {suggestions.map((v) => (
                                        <Link 
                                            key={v.id} 
                                            href={`/villages/${v.id}`}
                                            onClick={() => setShowSuggestions(false)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '1rem',
                                                textDecoration: 'none',
                                                color: 'var(--color-text-main)',
                                                borderBottom: '1px solid var(--color-border)',
                                                transition: 'background 0.2s'
                                            }}
                                            className="suggestion-item"
                                        >
                                            <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
                                            <div>
                                                <strong style={{ display: 'block', fontSize: '0.9rem' }}>{v.name}</strong>
                                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{v.state} • ₹{v.homestay_price}/night</span>
                                            </div>
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="tab-container" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2.5rem', position: 'relative', zIndex: 2 }}>
                    <button
                        className={`tab-btn ${activeTab === 'villages' ? 'active' : ''}`}
                        onClick={() => setActiveTab('villages')}
                        style={{ padding: '1rem 2rem', fontStyle: 'normal', fontSize: '1.1rem', background: 'none', border: 'none', borderBottom: activeTab === 'villages' ? '3px solid #eab308' : '3px solid transparent', color: activeTab === 'villages' ? 'white' : 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 0.3s' }}
                    >
                        <NavIcon size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                        Villages
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('posts')}
                        style={{ padding: '1rem 2rem', fontStyle: 'normal', fontSize: '1.1rem', background: 'none', border: 'none', borderBottom: activeTab === 'posts' ? '3px solid #eab308' : '3px solid transparent', color: activeTab === 'posts' ? 'white' : 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 0.3s' }}
                    >
                        <ImageIcon size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                        Creator Posts
                    </button>
                </div>
            </div>

            {/* Mobile filter toggle float button */}
            <div className="mobile-filter-bar" style={{ display: 'none', padding: '1rem', background: 'var(--color-bg-white)', borderBottom: '1px solid var(--color-border)', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Showing {activeTab === 'villages' ? filteredVillages.length : filteredPosts.length} items</span>
                <button 
                    onClick={() => setShowMobileFilters(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer' }}
                >
                    <SlidersHorizontal size={14} /> Filters
                </button>
            </div>

            <div className="container explore-content" style={{ marginTop: '2rem' }}>
                {/* Desktop Sidebar */}
                <aside className="filters-sidebar" style={{ background: 'var(--color-bg-white)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem', fontSize: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', color: 'var(--color-primary)' }}>
                        <Filter size={18} /> Filters
                    </h3>
                    {renderFilterControls()}
                </aside>

                <main className="results-area">
                    {loading ? (
                        <ShimmerSkeleton variant="grid" count={6} />
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab + JSON.stringify(debouncedQuery) + stateFilter}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="villages-grid"
                            >
                                {activeTab === 'villages' && (
                                    <>
                                        {filteredVillages.map(village => (
                                            <Link href={`/villages/${village.id}`} key={village.id} className="card village-card">
                                                <div className="card-image" style={{ position: 'relative', overflow: 'hidden' }}>
                                                    <SmartImage src={village.hero_image} alt={village.name} />
                                                </div>
                                                <div className="card-content">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                        <div className="location"><MapPin size={14} /> {village.state}</div>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                                                            ★ {village.rating}
                                                        </span>
                                                    </div>
                                                    <h3>{highlightText(village.name, debouncedQuery)}</h3>
                                                    <p>{village.short_description}</p>
                                                    
                                                    {/* Tags list */}
                                                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', margin: '0.75rem 0' }}>
                                                        {village.activities?.map(act => (
                                                            <span key={act} style={{ fontSize: '0.7rem', background: 'var(--color-bg-base)', color: 'var(--color-text-muted)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{act}</span>
                                                        ))}
                                                    </div>

                                                    <div className="price-tag">From ₹{village.homestay_price} / night</div>
                                                </div>
                                            </Link>
                                        ))}
                                        {filteredVillages.length === 0 && (
                                            <div className="no-results" style={{ textAlign: 'center', padding: '4rem' }}>
                                                <Search size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
                                                <h3>No villages match your filters</h3>
                                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Try clearing filters or adjusting your price slider.</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeTab === 'posts' && (
                                    <>
                                        {filteredPosts.map(post => (
                                            <div key={post.id} className="card village-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                                <div className="card-image" style={{ position: 'relative', overflow: 'hidden' }}>
                                                    <SmartImage src={post.image_url} alt={post.title} />
                                                </div>
                                                <div className="card-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                        <div className="location"><MapPin size={14} /> {post.location}</div>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-base)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>By {post.creator_name}</span>
                                                    </div>
                                                    <h3>{highlightText(post.title, debouncedQuery)}</h3>
                                                    <p style={{ flex: 1 }}>{post.description}</p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                                        <div className="price-tag" style={{ margin: 0 }}>₹{post.price} / person</div>
                                                        <button
                                                            onClick={() => alert(`Connect with ${post.creator_name} on creator dashboard!`)}
                                                            className="btn-accent"
                                                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                        >
                                                            Book Now
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {filteredPosts.length === 0 && (
                                            <div className="no-results" style={{ textAlign: 'center', padding: '4rem' }}>
                                                <Search size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
                                                <h3>No creator posts match your filters</h3>
                                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Try modifying your search query or location settings.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </main>
            </div>

            {/* Mobile Filters Drawer / Bottom Sheet */}
            <AnimatePresence>
                {showMobileFilters && (
                    <>
                        {/* Overlay backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMobileFilters(false)}
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'black', zIndex: 100 }}
                        />
                        {/* Drawer body */}
                        <motion.div 
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{ 
                                position: 'fixed', 
                                bottom: 0, 
                                left: 0, 
                                right: 0, 
                                background: 'var(--color-bg-white)', 
                                borderTopLeftRadius: '24px', 
                                borderTopRightRadius: '24px', 
                                padding: '2rem 1.5rem', 
                                maxHeight: '80vh', 
                                overflowY: 'auto',
                                zIndex: 101 
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary)' }}>Filters</h3>
                                <button 
                                    onClick={() => setShowMobileFilters(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                                    aria-label="Close filters drawer"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            {renderFilterControls()}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
