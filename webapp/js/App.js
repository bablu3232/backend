// ============================================
// App — Main Router & Layout
// ============================================
function App() {
    const { isLoggedIn, isAdmin, logout } = useAuth();
    const [page, setPage] = React.useState('login');
    const [pageData, setPageData] = React.useState(null);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const { toasts, addToast, removeToast } = useToast();

    const navigate = (pageName, data = null) => {
        setPage(pageName);
        setPageData(data);
        window.scrollTo(0, 0);
        setSidebarOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('login');
        addToast('Logged out successfully', 'success');
    };

    // Redirect to login if not authenticated for protected pages
    const protectedPages = ['dashboard', 'upload', 'review-values', 'report-analysis', 'history', 'report-detail', 'manual-entry', 'drug-search', 'drug-detail', 'profile', 'change-password', 'about'];
    const adminPages = ['admin-dashboard'];

    React.useEffect(() => {
        if (!isLoggedIn && protectedPages.includes(page)) {
            navigate('login');
        }
        if (isLoggedIn && !isAdmin && (page === 'login' || page === 'register')) {
            navigate('dashboard');
        }
        if (isLoggedIn && isAdmin && page === 'admin-login') {
            navigate('admin-dashboard');
        }
    }, [isLoggedIn, page]);

    const pageTitle = {
        'dashboard': 'Dashboard', 'upload': 'Upload Report', 'review-values': 'Review Values',
        'report-analysis': 'Analysis', 'history': 'Report History', 'report-detail': 'Report Detail',
        'manual-entry': 'Manual Entry', 'drug-search': 'Drug Search', 'drug-detail': 'Drug Detail',
        'profile': 'Profile', 'change-password': 'Change Password', 'about': 'About',
    };

    // Auth pages (no sidebar)
    const authPages = ['login', 'register', 'forgot-password', 'admin-login'];
    const isAuthPage = authPages.includes(page);
    const isAdminPage = page === 'admin-dashboard';

    // Auth pages
    if (isAuthPage) {
        return (
            <>
                <ToastContainer toasts={toasts} removeToast={removeToast} />
                {page === 'login' && <LoginPage onNavigate={navigate} />}
                {page === 'register' && <RegisterPage onNavigate={navigate} />}
                {page === 'forgot-password' && <ForgotPasswordPage onNavigate={navigate} />}
                {page === 'admin-login' && <AdminLoginPage onNavigate={navigate} />}
            </>
        );
    }

    // Admin dashboard
    if (isAdminPage) {
        return (
            <>
                <ToastContainer toasts={toasts} removeToast={removeToast} />
                <AdminDashboardPage onNavigate={navigate} />
            </>
        );
    }

    // Main layout with sidebar
    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="app-layout">
                <Sidebar
                    currentPage={page}
                    onNavigate={navigate}
                    onLogout={handleLogout}
                    sidebarOpen={sidebarOpen}
                    onCloseSidebar={() => setSidebarOpen(false)}
                />
                <div className="main-content">
                    <TopBar
                        title={pageTitle[page] || 'DrugSearch'}
                        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    />
                    {page === 'dashboard' && <DashboardPage onNavigate={navigate} />}
                    {page === 'upload' && <UploadReportPage onNavigate={navigate} />}
                    {page === 'review-values' && <ReviewValuesPage onNavigate={navigate} data={pageData} />}
                    {page === 'report-analysis' && <ReportAnalysisPage onNavigate={navigate} data={pageData} />}
                    {page === 'history' && <ReportHistoryPage onNavigate={navigate} />}
                    {page === 'report-detail' && <ReportDetailPage onNavigate={navigate} data={pageData} />}
                    {page === 'manual-entry' && <ManualEntryPage onNavigate={navigate} />}
                    {page === 'drug-search' && <DrugSearchPage onNavigate={navigate} />}
                    {page === 'drug-detail' && <DrugDetailPage onNavigate={navigate} data={pageData} />}
                    {page === 'profile' && <ProfilePage onNavigate={navigate} />}
                    {page === 'change-password' && <ChangePasswordPage onNavigate={navigate} />}
                    {page === 'about' && <AboutPage onNavigate={navigate} />}
                </div>
            </div>
        </>
    );
}

// ============================================
// Bootstrap
// ============================================
function Root() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
