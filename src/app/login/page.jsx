import './login.css';
import LoginForm from './LoginForm';

export const metadata = {
    title: 'Login - GramTour',
    description: 'Log in to GramTour as Admin, Tourist, or Creator',
};

export default function LoginPage() {
    return (
        <main className="login-main">
            <div className="login-container">
                <div className="login-visuals">
                    <div className="brand-logo">GramTour</div>
                    <h2>Discover Authentic India</h2>
                    <p>Join us in promoting rural tourism, empowering artisans, and exploring untouched heritage.</p>
                </div>
                <div className="login-form-wrapper">
                    <LoginForm />
                </div>
            </div>
        </main>
    );
}
