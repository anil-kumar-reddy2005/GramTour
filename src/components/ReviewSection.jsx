'use client';
import { useState, useEffect } from 'react';
import { Star, Send } from 'lucide-react';
import './ReviewSection.css';

export default function ReviewSection({ targetId, targetType }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reviewsRes, userRes] = await Promise.all([
                    fetch(`/api/reviews?target_id=${targetId}&target_type=${targetType}`),
                    fetch('/api/auth/me')
                ]);

                const reviewsData = await reviewsRes.json();
                const userData = await userRes.json();

                setReviews(Array.isArray(reviewsData) ? reviewsData : []);
                setUser(userData.user);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching reviews:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [targetId, targetType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    target_id: targetId,
                    target_type: targetType,
                    rating: newReview.rating,
                    comment: newReview.comment
                })
            });

            if (res.ok) {
                const addedReview = await res.json();
                setReviews([
                    { ...addedReview, user_name: user.name, created_at: new Date().toISOString() },
                    ...reviews
                ]);
                setNewReview({ rating: 5, comment: '' });
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating, interactive = false) => {
        return (
            <div className="stars">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        size={18}
                        className={s <= rating ? 'star-filled' : 'star-empty'}
                        onClick={() => interactive && setNewReview({ ...newReview, rating: s })}
                        style={{ cursor: interactive ? 'pointer' : 'default' }}
                    />
                ))}
            </div>
        );
    };

    if (loading) return <div className="loading-reviews">Loading reviews...</div>;

    return (
        <div className="review-section">
            <h3>Reviews & Ratings</h3>

            {user ? (
                <form className="add-review-form" onSubmit={handleSubmit}>
                    <h4>Add a Review</h4>
                    <div className="form-group">
                        <label>Rating</label>
                        {renderStars(newReview.rating, true)}
                    </div>
                    <div className="form-group">
                        <label>Comment</label>
                        <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            placeholder="Share your experience..."
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={submitting}>
                        <Send size={16} /> {submitting ? 'Submitting...' : 'Post Review'}
                    </button>
                </form>
            ) : (
                <div className="login-prompt">
                    <p>Please log in to leave a review.</p>
                </div>
            )}

            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <p className="no-reviews">No reviews yet. Be the first to review!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="review-item">
                            <div className="review-header">
                                <div className="user-info">
                                    <div className="avatar">{review.user_name?.[0] || 'U'}</div>
                                    <div className="name-date">
                                        <span className="user-name">{review.user_name}</span>
                                        <span className="review-date">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                {renderStars(review.rating)}
                            </div>
                            <p className="review-comment">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
