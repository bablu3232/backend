// ============================================
// Drug Search Page
// ============================================
function DrugSearchPage({ onNavigate }) {
    const [query, setQuery] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [results, setResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);

    const drugCategories = ['Diabetes', 'Cardiovascular', 'Pain Relief', 'Antibiotics', 'Gastrointestinal', 'Allergy & Cold', 'Vitamins & Supplements', 'Neurology'];

    const search = async (q, cat) => {
        if (!q && !cat) return;
        setLoading(true); setHasSearched(true);
        try {
            const res = await ApiService.searchDrugs(q || '', cat || '');
            setResults(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setResults([]);
        }
        setLoading(false);
    };

    const handleSearch = (e) => { e.preventDefault(); search(query, category); };

    return (
        <div className="page-content">
            <h2 className="mb-8">Drug Search</h2>
            <p className="text-muted mb-24">Search for drug information, dosages, side effects, and safety warnings.</p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="card mb-24">
                <div className="card-body">
                    <div className="flex gap-12" style={{ flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <input className="form-input" placeholder="Search drug name..." value={query} onChange={e => setQuery(e.target.value)} />
                        </div>
                        <select className="form-input" style={{ maxWidth: '200px' }} value={category} onChange={e => { setCategory(e.target.value); search(query, e.target.value); }}>
                            <option value="">All Categories</option>
                            {drugCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button className="btn btn-primary" type="submit">
                            <span className="material-icons-outlined" style={{ fontSize: '18px' }}>search</span> Search
                        </button>
                    </div>
                </div>
            </form>

            {/* Category Cards */}
            {!hasSearched && (
                <>
                    <h3 className="mb-16">Browse by Category</h3>
                    <div className="grid grid-4 mb-24">
                        {drugCategories.map(cat => (
                            <div key={cat} className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '24px 16px' }}
                                onClick={() => { setCategory(cat); search('', cat); }}>
                                <span className="material-icons-outlined" style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '8px' }}>medication</span>
                                <h4 style={{ fontSize: '0.95rem' }}>{cat}</h4>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Results */}
            {loading ? <LoadingSpinner text="Searching..." /> :
                hasSearched && results.length === 0 ? (
                    <EmptyState icon="search_off" title="No Drugs Found" description="Try different keywords or browse by category." />
                ) :
                    hasSearched && (
                        <div>
                            <h3 className="mb-16">{results.length} result{results.length !== 1 ? 's' : ''} found</h3>
                            <div className="grid grid-2">
                                {results.map((drug, i) => (
                                    <div key={i} className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('drug-detail', drug)}>
                                        <div className="card-body">
                                            <div className="flex items-center justify-between mb-8">
                                                <h4>{drug.drug_name}</h4>
                                                <span className="badge badge-info">{drug.drug_category}</span>
                                            </div>
                                            {drug.generic_name && <p className="text-sm text-muted mb-8">Generic: {drug.generic_name}</p>}
                                            {drug.indication && <p className="text-sm">{drug.indication}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
        </div>
    );
}
