// ============================================
// App Footer — Shared footer for all pages
// ============================================
function AppFooter({ onNavigate }) {
    const { isLoggedIn } = useAuth();

    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-grid">
                    {/* Brand Column */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <img src="assets/logo.png" alt="DrugsSearch" />
                            <span>DrugsSearch</span>
                        </div>
                        <p className="footer-tagline">Your trusted platform for medical report analysis and drug information. Built with care for patients and healthcare professionals.</p>
                        <div className="footer-social">
                            <a href="#" className="social-icon" title="Facebook"><span className="material-icons-outlined">public</span></a>
                            <a href="#" className="social-icon" title="Email"><span className="material-icons-outlined">mail</span></a>
                            <a href="#" className="social-icon" title="Phone"><span className="material-icons-outlined">phone</span></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-links">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate(isLoggedIn ? 'dashboard' : 'login'); }}>Home</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate(isLoggedIn ? 'drug-search' : 'login'); }}>Drug Search</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate(isLoggedIn ? 'upload' : 'login'); }}>Upload Report</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate(isLoggedIn ? 'history' : 'login'); }}>Report History</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="footer-links">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate(isLoggedIn ? 'about' : 'landing'); }}>About Us</a></li>

                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-links">
                        <h4>Contact</h4>
                        <ul>
                            <li><span className="material-icons-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '6px' }}>mail</span>support@drugssearch.com</li>
                            <li><span className="material-icons-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '6px' }}>location_on</span>SIMATS University, Chennai</li>
                            <li><span className="material-icons-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '6px' }}>schedule</span>24/7 Online Access</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© 2026 DrugsSearch — Powered by SIMATS Engineering. For informational purposes only. Not a substitute for medical advice.</p>
            </div>
        </footer>
    );
}
