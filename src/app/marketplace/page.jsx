'use client';
import { useState, useEffect } from 'react';
import { Search, MapPin, ShoppingBag } from 'lucide-react';
import SmartImage from '../../components/SmartImage';
import './marketplace.css';

export default function Marketplace() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            });
    }, []);

    const filteredProducts = products.filter(p => 
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.artisan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.village_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="marketplace-page">
            <div className="marketplace-header container">
                <div className="header-text">
                    <h1>Artisan Marketplace</h1>
                    <p>Support rural artisans directly. Discover authentic, handcrafted products from our village communities.</p>
                </div>

                <div className="search-bar">
                    <Search size={20} className="search-icon"/>
                    <input 
                        type="text" 
                        placeholder="Search by product, artisan, or village..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="container marketplace-content">
                {loading ? (
                    <div className="loading">Loading products...</div>
                ) : (
                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="card product-card">
                                <div className="product-image" style={{ position: 'relative', overflow: 'hidden' }}>
                                    <SmartImage src={product.image} alt={product.product_name} fallbackSrc="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=800" />
                                </div>
                                <div className="product-details">
                                    <div className="village-badge">
                                        <MapPin size={12}/> {product.village_name}
                                    </div>
                                    <h3>{product.product_name}</h3>
                                    <div className="artisan-info">
                                        <span className="artisan-name">By {product.artisan_name}</span>
                                    </div>
                                    <p className="description">{product.description}</p>
                                    <div className="product-footer">
                                        <div className="price">₹{product.price}</div>
                                        <button className="btn-primary buy-btn">
                                            <ShoppingBag size={16}/> Connect
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="no-results">No products found matching your search.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
