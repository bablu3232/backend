// ============================================
// About Page (also serves as FAQ & Privacy)
// ============================================
function AboutPage({ onNavigate }) {
    const [tab, setTab] = React.useState('about');

    return (
        <div className="page-content">
            <h2 className="mb-24">Information</h2>

            <div className="tabs mb-24">
                {['about', 'faq', 'privacy'].map(t => (
                    <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                        {t === 'about' ? 'About App' : t === 'faq' ? 'FAQ' : 'Privacy Policy'}
                    </div>
                ))}
            </div>

            {tab === 'about' && (
                <div className="card">
                    <div className="card-body">
                        <div className="text-center mb-24">
                            <div style={{ width: 80, height: 80, borderRadius: 20, overflow: 'hidden', margin: '0 auto 16px' }}><img src="assets/logo.png" alt="DrugSearch" style={{ width: '80px', height: '80px', objectFit: 'cover' }} /></div>
                            <h2>DrugSearch</h2>
                            <p className="text-sm text-muted">Version 1.0.0</p>
                        </div>
                        <div style={{ maxWidth: 600, margin: '0 auto' }}>
                            <p style={{ textAlign: 'center', lineHeight: 1.8 }}>
                                DrugSearch is a comprehensive medical report analyzer that helps you understand your lab results.
                                Upload your reports, get instant analysis, and search for drug information — all in one place.
                            </p>
                            <div className="grid grid-3 mt-24">
                                <div className="text-center"><span className="material-icons-outlined" style={{ fontSize: 36, color: 'var(--primary)' }}>upload_file</span><h4 className="mt-8">OCR Scanning</h4><p className="text-sm">Auto-extract lab values</p></div>
                                <div className="text-center"><span className="material-icons-outlined" style={{ fontSize: 36, color: 'var(--success)' }}>analytics</span><h4 className="mt-8">Smart Analysis</h4><p className="text-sm">Risk levels & insights</p></div>
                                <div className="text-center"><span className="material-icons-outlined" style={{ fontSize: 36, color: 'var(--warning)' }}>medication</span><h4 className="mt-8">Drug Info</h4><p className="text-sm">Search 200+ drugs</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'faq' && (
                <div>
                    {[
                        { q: 'How do I upload a report?', a: 'Go to Upload Report, select an image or PDF of your lab report, and click "Upload & Analyze". The OCR engine will extract your values automatically.' },
                        { q: 'What file formats are supported?', a: 'JPG, JPEG, PNG, HEIC, and PDF files are supported. For best results, use files under 1MB.' },
                        { q: 'How accurate is the OCR?', a: 'OCR accuracy depends on image quality. Clear, well-lit photos of printed reports give the best results. You can always edit values on the review screen.' },
                        { q: 'Can I enter values manually?', a: 'Yes! Use the Manual Entry option to type in your lab values by selecting a category like Blood Count, Lipid Profile, etc.' },
                        { q: 'Is my data secure?', a: 'Your data is stored securely on the server and is only accessible with your login credentials.' },
                        { q: 'How do I view past reports?', a: 'Go to Report History from the sidebar to see all your previously analyzed reports.' },
                    ].map((item, i) => (
                        <div key={i} className="card mb-16">
                            <div className="card-body">
                                <h4 style={{ marginBottom: 8 }}>{item.q}</h4>
                                <p>{item.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'privacy' && (
                <div className="card">
                    <div className="card-body" style={{ lineHeight: 1.8 }}>
                        <h3 className="mb-16">Privacy Policy</h3>
                        <p className="mb-16">Your privacy is important to us. This policy describes how we handle your personal information.</p>
                        <h4 className="mb-8">Data Collection</h4>
                        <p className="mb-16">We collect your name, email, phone number, and medical report data that you voluntarily upload or enter.</p>
                        <h4 className="mb-8">Data Usage</h4>
                        <p className="mb-16">Your data is used solely for providing health analysis and drug information services. We do not sell or share your data with third parties.</p>
                        <h4 className="mb-8">Data Security</h4>
                        <p className="mb-16">We implement appropriate security measures to protect your personal information from unauthorized access or disclosure.</p>
                        <h4 className="mb-8">Your Rights</h4>
                        <p>You can update or delete your account and associated data at any time through the Profile settings.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
