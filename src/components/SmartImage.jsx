'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, RefreshCw } from 'lucide-react';
import './skeleton.css';

export default function SmartImage({
    src,
    alt,
    className = '',
    style = {},
    objectFit = 'cover',
    fallbackSrc = '/placeholder-village.jpg',
    ...props
}) {
    const [imgSrc, setImgSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        // Reset state when src changes
        setImgSrc(src);
        setIsLoading(true);
        setIsError(false);
        setRetryCount(0);
    }, [src]);

    const handleLoad = () => {
        setIsLoading(false);
        setIsError(false);
    };

    const handleError = () => {
        if (retryCount < 3) {
            setTimeout(() => {
                setRetryCount(prev => prev + 1);
                // Trick to force reload by appending a random query parameter
                const separator = src.includes('?') ? '&' : '?';
                setImgSrc(`${src}${separator}retry=${retryCount + 1}`);
            }, 1000);
        } else {
            setIsLoading(false);
            setIsError(true);
            setImgSrc(fallbackSrc);
        }
    };

    // If image is a color string or gradient placeholder rather than a URL
    const isGradient = src && (src.startsWith('linear-gradient') || src.startsWith('radial-gradient') || src.startsWith('#'));

    if (isGradient) {
        return (
            <div 
                className={className} 
                style={{ 
                    ...style, 
                    background: src,
                    width: '100%',
                    height: '100%'
                }} 
                {...props} 
            />
        );
    }

    return (
        <div 
            style={{ 
                position: 'relative', 
                overflow: 'hidden', 
                width: '100%', 
                height: '100%',
                display: 'block',
                ...style 
            }}
            className={`smart-image-container ${className}`}
        >
            {/* Shimmer loading skeleton */}
            {isLoading && (
                <div 
                    className="skeleton" 
                    style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%',
                        zIndex: 2,
                        borderRadius: style.borderRadius || '0'
                    }} 
                />
            )}

            {/* Main Image */}
            <img
                ref={(el) => {
                    if (el && el.complete && el.naturalWidth > 0) {
                        setIsLoading(false);
                        setIsError(false);
                    }
                }}
                src={imgSrc || fallbackSrc}
                alt={alt || 'GramTour Image'}
                loading="lazy"
                onLoad={handleLoad}
                onError={handleError}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: objectFit,
                    display: 'block',
                    opacity: isLoading ? 0 : 1,
                    transition: 'opacity 0.4s ease-in-out'
                }}
                {...props}
            />

            {/* Error state fallback UI */}
            {isError && (
                <div 
                    style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        background: '#f3f4f6', 
                        color: '#9ca3af',
                        padding: '1rem',
                        textAlign: 'center',
                        zIndex: 1
                    }}
                >
                    <ImageIcon size={32} style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.75rem' }}>Image Unavailable</span>
                </div>
            )}
        </div>
    );
}
