import './Footer.css';
export default function Footer() {
    return (<footer className="footer">
            <div className="container footer-content">
                <div className="footer-brand">
                    <h3>GramTour</h3>
                    <p>Discover Hidden Rural India. Connect with authentic village life, cultural experiences, and traditional artisans.</p>
                </div>
                <div className="footer-links">
                    <h4>Explore</h4>
                    <ul>
                        <li><a href="/explore">Villages</a></li>
                        <li><a href="/marketplace">Marketplace</a></li>
                        <li><a href="/ai-planner">AI Planner</a></li>
                    </ul>
                </div>
                <div className="footer-links">
                    <h4>About</h4>
                    <ul>
                        <li><a href="#">Our Mission</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Terms & Conditions</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} GramTour. All rights reserved.</p>
            </div>
        </footer>);
}
