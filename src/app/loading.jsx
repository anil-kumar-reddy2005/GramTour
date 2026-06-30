import '../components/skeleton.css';

export default function Loading() {
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p style={{ color: '#666', fontWeight: 500, marginTop: '1rem' }}>Loading content...</p>
        </div>
    );
}
