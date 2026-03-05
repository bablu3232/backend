// ============================================
// Drug Detail Page
// ============================================
function DrugDetailPage({ onNavigate, data }) {
    if (!data) return <div className="page-content"><EmptyState icon="medication" title="No Drug Selected" description="Go back to search and select a drug." /></div>;

    const drug = data;
    const sections = [
        { label: 'Generic Name', value: drug.generic_name, icon: 'science' },
        { label: 'Category', value: drug.drug_category, icon: 'category' },
        { label: 'Indication', value: drug.indication, icon: 'medical_information' },
        { label: 'Description', value: drug.description, icon: 'description' },
        { label: 'Common Dosage', value: drug.common_dosage, icon: 'medication' },
        { label: 'Side Effects', value: drug.side_effects, icon: 'warning' },
        { label: 'Safety Warnings', value: drug.safety_warnings, icon: 'shield' },
        { label: 'Storage Details', value: drug.storage_details, icon: 'inventory' },
    ];

    return (
        <div className="page-content">
            <div className="flex items-center gap-12 mb-24">
                <button className="btn-icon" onClick={() => onNavigate('drug-search')}><span className="material-icons-outlined">arrow_back</span></button>
                <div>
                    <h2>{drug.drug_name}</h2>
                    <p className="text-sm text-muted">{drug.drug_category}</p>
                </div>
            </div>

            <div className="grid grid-2">
                {sections.filter(s => s.value).map((s, i) => (
                    <div key={i} className={`card ${i < 2 ? '' : ''}`} style={i >= 5 ? { gridColumn: 'span 1' } : {}}>
                        <div className="card-body">
                            <div className="flex items-center gap-8 mb-12">
                                <span className="material-icons-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>{s.icon}</span>
                                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</h4>
                            </div>
                            <p style={{ color: 'var(--text)', fontSize: '0.95rem', lineHeight: '1.6' }}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
