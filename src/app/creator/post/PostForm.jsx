'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { createPost } from '../../actions/postActions';
import { useRouter } from 'next/navigation';
import { ImagePlus, MapPin, DollarSign, AlignLeft, Type } from 'lucide-react';

export default function PostForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData(e.target);
        const result = await createPost(formData);

        setLoading(false);
        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(true);
            e.target.reset();
            setTimeout(() => {
                router.push('/explore');
                router.refresh();
            }, 1500);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="post-card"
        >
            <h3>Create a Post</h3>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Post published successfully! Redirecting...</div>}

            <form onSubmit={handleSubmit} className="post-form">
                <div className="input-group">
                    <label htmlFor="title"><Type size={16} /> Title (Village / Experience Name)</label>
                    <input type="text" id="title" name="title" required placeholder="e.g. Pottery Workshop in Raghurajpur" />
                </div>

                <div className="input-group">
                    <label htmlFor="location"><MapPin size={16} /> Location (State / District)</label>
                    <input type="text" id="location" name="location" required placeholder="e.g. Odisha" />
                </div>

                <div className="input-group">
                    <label htmlFor="imageUrl"><ImagePlus size={16} /> Image URL</label>
                    <input type="url" id="imageUrl" name="imageUrl" required placeholder="https://images.unsplash.com/..." />
                </div>

                <div className="input-group">
                    <label htmlFor="price"><DollarSign size={16} /> Price per person (₹)</label>
                    <input type="number" id="price" name="price" min="0" required placeholder="e.g. 1500" />
                </div>

                <div className="input-group">
                    <label htmlFor="description"><AlignLeft size={16} /> Description (Tell your story)</label>
                    <textarea id="description" name="description" rows="5" required placeholder="Describe the authentic experience, culture, and what tourists can expect..."></textarea>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="post-btn"
                    disabled={loading}
                >
                    {loading ? 'Publishing...' : 'Publish Post'}
                </motion.button>
            </form>
        </motion.div>
    );
}
