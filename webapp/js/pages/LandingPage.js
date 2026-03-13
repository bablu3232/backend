// ============================================
// Landing Page — Public introduction before login
// ============================================
function LandingPage({ onNavigate }) {
    const { isLoggedIn } = useAuth();

    const capabilities = [
        { icon: 'biotech', label: 'Report Analysis', desc: 'Upload and analyze medical lab reports with AI-powered insights', bg: 'var(--primary-light)', color: 'var(--primary)' },
        { icon: 'medication', label: 'Drug Search', desc: 'Search comprehensive drug information, dosages, and interactions', bg: 'var(--success-light)', color: 'var(--success)' },
        { icon: 'favorite', label: 'Health Tracking', desc: 'Track health parameters over time and monitor trends', bg: 'var(--warning-light)', color: 'var(--warning)' },
        { icon: 'security', label: 'Secure & Private', desc: 'Your health data is encrypted and securely stored', bg: 'var(--accent-light)', color: 'var(--accent)' },
    ];

    const features = [
        { icon: 'upload_file', label: 'OCR Report Scanning', desc: 'Upload lab reports and our OCR engine extracts all parameters automatically — no manual entry needed.', bg: 'var(--primary-light)', color: 'var(--primary)' },
        { icon: 'analytics', label: 'Smart Analysis', desc: 'Get instant risk assessments, normal/abnormal classification, and personalized health recommendations.', bg: 'var(--success-light)', color: 'var(--success)' },
        { icon: 'local_pharmacy', label: 'Drug Information', desc: 'Search thousands of drugs with details on dosage, side effects, interactions, and safety warnings.', bg: 'var(--warning-light)', color: 'var(--warning)' },
        { icon: 'history', label: 'Report History', desc: 'Store all your reports securely and compare them over time to track your health improvements.', bg: 'var(--danger-light)', color: 'var(--danger)' },
        { icon: 'edit_note', label: 'Manual Entry', desc: 'Manually enter lab values if you prefer typing — our system analyzes them just as effectively.', bg: 'var(--accent-light)', color: 'var(--accent)' },
        { icon: 'admin_panel_settings', label: 'Admin Dashboard', desc: 'Powerful admin tools for managing users, reports, drugs, and lab parameters efficiently.', bg: 'var(--primary-light)', color: 'var(--primary-dark)' },
    ];

    const handleFeatureClick = (page) => {
        if (isLoggedIn) {
            onNavigate(page);
        } else {
            onNavigate('login');
        }
    };

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-nav-logo">
                    <img src="assets/logo.png" alt="DrugSearch" />
                    <span>DrugsSearch</span>
                </div>
                <div className="landing-nav-links">
                    <a href="#capabilities" onClick={(e) => { e.preventDefault(); document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
                    <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>How It Works</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleFeatureClick('about'); }}>About</a>
                </div>
                <div className="landing-nav-actions">
                    {isLoggedIn ? (
                        <button className="btn btn-primary" onClick={() => onNavigate('dashboard')}>Go to Dashboard</button>
                    ) : (
                        <>
                            <button className="btn btn-secondary" onClick={() => onNavigate('login')}>Login</button>
                            <button className="btn btn-primary" onClick={() => onNavigate('register')}>Create Account</button>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-content">
                    <div className="landing-hero-text">
                        <h1>Healthy Living Starts with Better Insights</h1>
                        <p>Upload your medical lab reports, get AI-powered analysis, search drug information, and track your health parameters — all in one secure platform.</p>
                        <div className="landing-hero-actions">
                            {isLoggedIn ? (
                                <button className="btn btn-primary btn-lg" onClick={() => onNavigate('dashboard')}>
                                    <span className="material-icons-outlined" style={{ fontSize: '20px' }}>dashboard</span>
                                    Go to Dashboard
                                </button>
                            ) : (
                                <>
                                    <button className="btn btn-primary btn-lg" onClick={() => onNavigate('register')}>
                                        <span className="material-icons-outlined" style={{ fontSize: '20px' }}>person_add</span>
                                        Get Started Free
                                    </button>
                                    <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('login')}>
                                        Sign In
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="landing-hero-image">
                        <div className="landing-hero-visual">
                            <div className="icon-grid">
                                <div className="icon-item">
                                    <span className="material-icons-outlined">biotech</span>
                                    <span>Analysis</span>
                                </div>
                                <div className="icon-item">
                                    <span className="material-icons-outlined">medication</span>
                                    <span>Drugs</span>
                                </div>
                                <div className="icon-item">
                                    <span className="material-icons-outlined">favorite</span>
                                    <span>Health</span>
                                </div>
                                <div className="icon-item">
                                    <span className="material-icons-outlined">description</span>
                                    <span>Reports</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Capabilities */}
            <section className="landing-capabilities" id="capabilities">
                <div className="landing-section-header">
                    <span className="section-tag">Our Capabilities</span>
                    <h2>Everything You Need for Health Management</h2>
                    <p>Powerful tools designed to help you understand and manage your health better.</p>
                </div>
                <div className="capabilities-grid">
                    {capabilities.map((cap, i) => (
                        <div className="capability-card" key={i}>
                            <div className="cap-icon" style={{ background: cap.bg, color: cap.color }}>
                                <span className="material-icons-outlined">{cap.icon}</span>
                            </div>
                            <h3>{cap.label}</h3>
                            <p>{cap.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Showcase */}
            <section className="landing-features" id="how-it-works">
                <div className="landing-section-header">
                    <span className="section-tag">How It Works</span>
                    <h2>Powerful Features at Your Fingertips</h2>
                    <p>From OCR scanning to AI analysis — we've got you covered.</p>
                </div>
                <div className="features-grid">
                    {features.map((feat, i) => (
                        <div className="feature-card" key={i}>
                            <div className="feature-icon" style={{ background: feat.bg, color: feat.color }}>
                                <span className="material-icons-outlined">{feat.icon}</span>
                            </div>
                            <div>
                                <h3>{feat.label}</h3>
                                <p>{feat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="landing-cta">
                <h2>Ready to Take Control of Your Health?</h2>
                <p>Join thousands of users who trust DrugsSearch for their medical report analysis and drug information needs.</p>
                <div className="cta-actions">
                    {isLoggedIn ? (
                        <button className="btn btn-white btn-lg" onClick={() => onNavigate('dashboard')}>
                            <span className="material-icons-outlined" style={{ fontSize: '20px' }}>dashboard</span>
                            Open Dashboard
                        </button>
                    ) : (
                        <>
                            <button className="btn btn-white btn-lg" onClick={() => onNavigate('register')}>
                                <span className="material-icons-outlined" style={{ fontSize: '20px' }}>rocket_launch</span>
                                Create Free Account
                            </button>
                            <button className="btn btn-outline-white btn-lg" onClick={() => onNavigate('login')}>
                                Sign In
                            </button>
                        </>
                    )}
                </div>
            </section>

            {/* Footer */}
            <AppFooter onNavigate={onNavigate} />
        </div>
    );
}
