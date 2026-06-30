'use client';
import './skeleton.css';

export default function ShimmerSkeleton({
    variant = 'rect', // 'rect' | 'circle' | 'text' | 'card' | 'grid'
    width,
    height,
    count = 1,
    className = '',
    style = {}
}) {
    const getStyle = () => {
        const baseStyle = { ...style };
        if (width) baseStyle.width = typeof width === 'number' ? `${width}px` : width;
        if (height) baseStyle.height = typeof height === 'number' ? `${height}px` : height;
        return baseStyle;
    };

    if (variant === 'grid') {
        return (
            <div className="skeleton-grid">
                {Array.from({ length: count }).map((_, idx) => (
                    <div key={idx} className="skeleton-card">
                        <div className="skeleton skeleton-image" />
                        <div className="skeleton skeleton-title" style={{ width: '60%' }} />
                        <div className="skeleton skeleton-text" />
                        <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'card') {
        return (
            <div className={`skeleton-card ${className}`} style={getStyle()}>
                <div className="skeleton skeleton-image" />
                <div className="skeleton skeleton-title" style={{ width: '60%' }} />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text" style={{ width: '40%' }} />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: width || '100%' }}>
            {Array.from({ length: count }).map((_, idx) => {
                let computedClass = 'skeleton';
                if (variant === 'circle') computedClass += ' skeleton-circle';
                if (variant === 'text') computedClass += ' skeleton-text';

                const inlineStyle = getStyle();
                if (variant === 'circle') {
                    inlineStyle.borderRadius = '50%';
                    if (!inlineStyle.width) inlineStyle.width = inlineStyle.height || '40px';
                    if (!inlineStyle.height) inlineStyle.height = inlineStyle.width || '40px';
                }

                return (
                    <div 
                        key={idx} 
                        className={`${computedClass} ${className}`} 
                        style={inlineStyle} 
                    />
                );
            })}
        </div>
    );
}
