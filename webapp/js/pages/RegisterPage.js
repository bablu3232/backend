// ============================================
// Register Page — with mobile-matching validations
// ============================================

// Validation helpers
function isValidName(name) {
    return /^[a-zA-Z\s]{5,}$/.test(name.trim());
}
function isValidEmail(email) {
    return email.trim().toLowerCase().endsWith('@gmail.com') && email.trim().length > 10;
}
function isValidPhone(phone) {
    return /^[0-9]{10}$/.test(phone.trim());
}
function isValidPassword(pwd) {
    if (pwd.length < 8) return false;
    if (/\s/.test(pwd)) return false;
    if (!/[A-Z]/.test(pwd)) return false;
    if (!/[a-z]/.test(pwd)) return false;
    if (!/[0-9]/.test(pwd)) return false;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return false;
    return true;
}

function RegisterPage({ onNavigate }) {
    const [form, setForm] = React.useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' });
    const [errors, setErrors] = React.useState({});
    const [apiError, setApiError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);
    const [agreeToTerms, setAgreeToTerms] = React.useState(false);

    const handleChange = (field, val) => {
        setForm(prev => ({ ...prev, [field]: val }));
        // Clear field error on typing
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Validate name
        if (!form.full_name.trim()) {
            newErrors.full_name = 'Please enter your full name';
        } else if (!isValidName(form.full_name)) {
            newErrors.full_name = 'Name must be at least 5 characters (alphabets and spaces only)';
        }

        // Validate email
        if (!form.email.trim()) {
            newErrors.email = 'Please enter your email';
        } else if (!isValidEmail(form.email)) {
            newErrors.email = 'Email must end with @gmail.com';
        }

        // Validate phone
        if (!form.phone.trim()) {
            newErrors.phone = 'Please enter your phone number';
        } else if (!isValidPhone(form.phone)) {
            newErrors.phone = 'Phone must be exactly 10 digits';
        }

        // Validate password
        if (!form.password) {
            newErrors.password = 'Please enter a password';
        } else if (!isValidPassword(form.password)) {
            newErrors.password = 'Min 8 chars with uppercase, lowercase, number & special character';
        }

        // Validate confirm password
        if (!form.confirm_password) {
            newErrors.confirm_password = 'Please confirm your password';
        } else if (form.confirm_password !== form.password) {
            newErrors.confirm_password = 'Passwords do not match';
        }

        // Validate terms
        if (!agreeToTerms) {
            newErrors.terms = 'You must agree to the Terms of Service';
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setLoading(true); setApiError('');
        try {
            const res = await ApiService.register(form);
            if (res.data.message && !res.data.message.toLowerCase().includes('error')) {
                onNavigate('login');
            } else {
                setApiError(res.data.message || 'Registration failed');
            }
        } catch (err) {
            setApiError(err.response?.data?.message || 'Registration failed');
        }
        setLoading(false);
    };

    const eyeStyle = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px', userSelect: 'none' };
    const fieldErrorStyle = { color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' };

    return (
        React.createElement('div', { className: 'auth-container' },
            React.createElement('div', { className: 'auth-card' },
                React.createElement('div', { className: 'auth-header' },
                    React.createElement('div', { className: 'auth-logo', style: { background: 'transparent' } },
                        React.createElement('img', { src: 'assets/logo.png', alt: 'DrugsSearch', style: { width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover' } })
                    ),
                    React.createElement('h1', null, 'Create Account'),
                    React.createElement('p', null, 'Join DrugsSearch today')
                ),
                React.createElement('form', { className: 'auth-body', onSubmit: handleSubmit },

                    // API error banner
                    apiError && React.createElement('div', { className: 'alert alert-danger' },
                        React.createElement('span', { className: 'material-icons-outlined', style: { fontSize: '18px' } }, 'error'), apiError
                    ),

                    // Full Name
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' }, 'Full Name'),
                        React.createElement('input', {
                            className: 'form-input', placeholder: 'Enter your full name',
                            value: form.full_name, onChange: e => handleChange('full_name', e.target.value),
                            style: errors.full_name ? { borderColor: '#EF4444' } : {}
                        }),
                        errors.full_name && React.createElement('div', { style: fieldErrorStyle },
                            React.createElement('span', { className: 'material-icons-outlined', style: { fontSize: '14px' } }, 'error'), errors.full_name
                        )
                    ),

                    // Email
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' }, 'Email'),
                        React.createElement('input', {
                            className: 'form-input', type: 'email', placeholder: 'yourname@gmail.com',
                            value: form.email, onChange: e => handleChange('email', e.target.value),
                            style: errors.email ? { borderColor: '#EF4444' } : {}
                        }),
                        errors.email && React.createElement('div', { style: fieldErrorStyle },
                            React.createElement('span', { className: 'material-icons-outlined', style: { fontSize: '14px' } }, 'error'), errors.email
                        )
                    ),

                    // Phone
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' }, 'Phone Number'),
                        React.createElement('input', {
                            className: 'form-input', type: 'tel', placeholder: 'Enter 10-digit phone number',
                            value: form.phone, onChange: e => handleChange('phone', e.target.value),
                            maxLength: 10,
                            style: errors.phone ? { borderColor: '#EF4444' } : {}
                        }),
                        errors.phone && React.createElement('div', { style: fieldErrorStyle },
                            React.createElement('span', { className: 'material-icons-outlined', style: { fontSize: '14px' } }, 'error'), errors.phone
                        )
                    ),

                    // Password + Confirm (grid)
                    React.createElement('div', { className: 'grid grid-2' },
                        React.createElement('div', { className: 'form-group' },
                            React.createElement('label', { className: 'form-label' }, 'Password'),
                            React.createElement('div', { style: { position: 'relative' } },
                                React.createElement('input', {
                                    className: 'form-input', type: showPassword ? 'text' : 'password',
                                    placeholder: 'Create password', value: form.password,
                                    onChange: e => handleChange('password', e.target.value),
                                    style: Object.assign({ paddingRight: '44px' }, errors.password ? { borderColor: '#EF4444' } : {})
                                }),
                                React.createElement('span', { className: 'material-icons-outlined', onClick: () => setShowPassword(!showPassword), style: eyeStyle },
                                    showPassword ? 'visibility' : 'visibility_off'
                                )
                            ),
                            errors.password && React.createElement('div', { style: fieldErrorStyle },
                                React.createElement('span', { className: 'material-icons-outlined', style: { fontSize: '14px' } }, 'error'), errors.password
                            )
                        ),
                        React.createElement('div', { className: 'form-group' },
                            React.createElement('label', { className: 'form-label' }, 'Confirm'),
                            React.createElement('div', { style: { position: 'relative' } },
                                React.createElement('input', {
                                    className: 'form-input', type: showConfirm ? 'text' : 'password',
                                    placeholder: 'Confirm password', value: form.confirm_password,
                                    onChange: e => handleChange('confirm_password', e.target.value),
                                    style: Object.assign({ paddingRight: '44px' }, errors.confirm_password ? { borderColor: '#EF4444' } : {})
                                }),
                                React.createElement('span', { className: 'material-icons-outlined', onClick: () => setShowConfirm(!showConfirm), style: eyeStyle },
                                    showConfirm ? 'visibility' : 'visibility_off'
                                )
                            ),
                            errors.confirm_password && React.createElement('div', { style: fieldErrorStyle },
                                React.createElement('span', { className: 'material-icons-outlined', style: { fontSize: '14px' } }, 'error'), errors.confirm_password
                            )
                        )
                    ),

                    // Terms checkbox
                    React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '8px', marginBottom: '4px' } },
                        React.createElement('input', {
                            type: 'checkbox', checked: agreeToTerms,
                            onChange: e => { setAgreeToTerms(e.target.checked); if (errors.terms) setErrors(prev => ({ ...prev, terms: null })); },
                            style: { marginTop: '3px', accentColor: 'var(--primary)' }
                        }),
                        React.createElement('span', { style: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' } },
                            'I agree to the ',
                            React.createElement('a', { href: '#', style: { color: 'var(--primary)', fontWeight: '500' } }, 'Terms of Service'),
                            ' and ',
                            React.createElement('a', { href: '#', style: { color: 'var(--primary)', fontWeight: '500' } }, 'Privacy Policy')
                        )
                    ),
                    errors.terms && React.createElement('div', { style: Object.assign({}, fieldErrorStyle, { marginBottom: '8px' }) },
                        React.createElement('span', { className: 'material-icons-outlined', style: { fontSize: '14px' } }, 'error'), errors.terms
                    ),

                    // Submit button
                    React.createElement('button', { className: 'btn btn-primary btn-full btn-lg', type: 'submit', disabled: loading, style: { marginTop: '8px' } },
                        loading ? React.createElement(React.Fragment, null,
                            React.createElement('div', { className: 'spinner spinner-sm', style: { borderTopColor: 'white' } }), ' Creating...'
                        ) : 'Create Account'
                    )
                ),
                React.createElement('div', { className: 'auth-footer' },
                    React.createElement('span', { style: { color: 'var(--text-secondary)' } }, 'Already have an account? '),
                    React.createElement('a', { href: '#', onClick: (e) => { e.preventDefault(); onNavigate('login'); } }, 'Sign In')
                )
            )
        )
    );
}
