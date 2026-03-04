// ============================================
// Upload Report Page
// ============================================
function UploadReportPage({ onNavigate }) {
    const { user } = useAuth();
    const [file, setFile] = React.useState(null);
    const [dragOver, setDragOver] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [error, setError] = React.useState('');
    const fileInputRef = React.useRef(null);

    const handleFile = (f) => {
        const maxSize = 10 * 1024 * 1024;
        if (f.size > maxSize) { setError('File too large. Max 10MB.'); return; }
        const allowed = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'];
        if (!allowed.includes(f.type) && !f.name.match(/\.(jpg|jpeg|png|heic|heif|pdf)$/i)) {
            setError('Only JPG, PNG, HEIC, or PDF files allowed.'); return;
        }
        setFile(f); setError('');
    };

    const handleDrop = (e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); };
    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = () => setDragOver(false);

    const formatSize = (bytes) => {
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return bytes + ' B';
    };

    const handleUpload = async () => {
        if (!file || !user?.userId) return;
        setUploading(true); setProgress(10); setError('');
        try {
            setProgress(30);
            const res = await ApiService.uploadReport(user.userId, file);
            setProgress(90);
            const data = res.data;
            if (data.status === 'success') {
                setProgress(100);
                const extractedText = data.extracted_text || '';
                let parsed = {};
                try { parsed = JSON.parse(extractedText); } catch (e) { }

                const parameters = parsed.parameters || {};
                const values = {};
                Object.entries(parameters).forEach(([name, detail]) => {
                    values[name] = String(detail.value || '');
                });

                if (Object.keys(values).length === 0) {
                    setError('No parameters could be extracted. Try a clearer image or PDF.');
                    setUploading(false); setProgress(0);
                    return;
                }

                onNavigate('review-values', {
                    values,
                    category: parsed.report_category || 'Unknown',
                    patientDetails: parsed.patient_details || {},
                    reportId: data.report_id,
                    fullAnalysis: parameters
                });
            } else {
                setError(data.message || 'Upload failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed. Check server connection.');
        }
        setUploading(false);
    };

    return (
        <div className="page-content">
            <h2 className="mb-8">Upload Lab Report</h2>
            <p className="text-muted mb-24">Upload your medical report image or PDF for automatic parameter extraction.</p>

            <div className="alert alert-info mb-24">
                <span className="material-icons-outlined" style={{ fontSize: '20px' }}>info</span>
                For faster scanning, preferably upload files less than 1 MB.
            </div>

            {error && <div className="alert alert-danger mb-24"><span className="material-icons-outlined" style={{ fontSize: '18px' }}>error</span>{error}</div>}

            {!file ? (
                <div
                    className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                >
                    <span className="material-icons-outlined">cloud_upload</span>
                    <h3 style={{ marginBottom: '8px' }}>Drag & drop your report here</h3>
                    <p>or click to browse • JPG, PNG, PDF • Max 10MB</p>
                    <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.heic,.heif,.pdf" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
                </div>
            ) : (
                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center gap-16">
                            <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-icons-outlined" style={{ fontSize: '28px', color: 'var(--primary)' }}>
                                    {file.type?.includes('pdf') ? 'picture_as_pdf' : 'image'}
                                </span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{file.name}</div>
                                <div className="text-muted text-sm">{formatSize(file.size)}</div>
                            </div>
                            {!uploading && (
                                <button className="btn-icon" onClick={() => { setFile(null); setProgress(0); }}>
                                    <span className="material-icons-outlined">close</span>
                                </button>
                            )}
                        </div>
                        {uploading && (
                            <div style={{ marginTop: '16px' }}>
                                <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
                                <p className="text-sm text-muted" style={{ marginTop: '8px' }}>
                                    {progress < 30 ? 'Uploading file...' : progress < 90 ? 'Extracting parameters (OCR)...' : 'Almost done...'}
                                </p>
                            </div>
                        )}
                    </div>
                    {!uploading && (
                        <div className="card-footer flex justify-between">
                            <button className="btn btn-secondary" onClick={() => { setFile(null); setProgress(0); }}>Choose Different File</button>
                            <button className="btn btn-primary" onClick={handleUpload}>
                                <span className="material-icons-outlined" style={{ fontSize: '18px' }}>science</span>
                                Upload & Analyze
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
