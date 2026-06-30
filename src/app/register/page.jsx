import '../login/login.css';
import RegisterForm from './RegisterForm';

export const metadata = {
    title: 'Register - GramTour',
    description: 'Create an account on GramTour',
};

export default function RegisterPage() {
    return (
        <main className="login-main">
            <div className="login-container">
                <div className="login-visuals">
                    <div className="brand-logo">GramTour</div>
                    <h2>Join the Journey</h2>
                    <p>Create an account to book experiences, save your favorite villages, and leave reviews.</p>
                </div>
                <div className="login-form-wrapper">
                    <RegisterForm />
                </div>
            </div>
        </main>
    );
}
