import './post.css';
import PostForm from './PostForm';

export const metadata = {
    title: 'Creator Studio - GramTour',
    description: 'Post your village or experience to tourists.',
};

export default function CreatorPostPage() {
    return (
        <main className="creator-main">
            <div className="creator-container">
                <div className="creator-header">
                    <h2>Creator Studio</h2>
                    <p>Share the beauty of your village, attract tourists, and offer authentic experiences.</p>
                </div>
                <div className="creator-form-wrapper">
                    <PostForm />
                </div>
            </div>
        </main>
    );
}
