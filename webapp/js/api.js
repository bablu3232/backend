// ============================================
// API Service — Connects to existing PHP backend
// ============================================
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost/drugssearch/'
    : '/drugssearch/';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 120000,
    headers: { 'Content-Type': 'application/json' }
});

const ApiService = {
    // Auth
    login: (email, password) =>
        api.post('login.php', { email, password }),

    register: (data) =>
        api.post('register.php', data),

    requestOtp: (email) =>
        api.post('request_otp.php', { email }),

    verifyOtp: (email, otp) =>
        api.post('verify_otp.php', { email, otp }),

    resetPassword: (email, new_password, confirm_password) =>
        api.post('reset_password.php', { email, new_password, confirm_password }),

    changePassword: (user_id, current_password, new_password, confirm_password) =>
        api.post('change_password.php', { user_id, current_password, new_password, confirm_password }),

    updateProfile: (data) =>
        api.post('update_profile.php', data),

    // Reports
    uploadReport: (userId, file) => {
        const formData = new FormData();
        formData.append('user_id', userId.toString());
        formData.append('report', file);
        return api.post('upload_report_ocrspace.php', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000
        });
    },

    saveReportData: (data) =>
        api.post('save_report_data.php', data),

    getUserReports: (userId) =>
        api.get('get_user_reports.php', { params: { user_id: userId } }),

    // Drugs
    searchDrugs: (query, category) =>
        api.get('search_drugs.php', { params: { query, category } }),

    // Admin
    adminLogin: (email, password) =>
        api.post('admin_login.php', { email, password }),

    getAdminStats: () =>
        api.get('admin_stats.php'),

    getAdminUsers: () =>
        api.get('admin_users.php'),

    getAdminReports: () =>
        api.get('admin_reports.php'),

    getAdminUserStats: (userId) =>
        api.get('admin_user_stats.php', { params: { user_id: userId } }),

    adminAddParameter: (data) =>
        api.post('admin_add_parameter.php', data),

    adminAddDrug: (data) =>
        api.post('admin_add_drug.php', data),
};
