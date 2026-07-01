import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const API_MOVEMENTS = 'http://localhost:5000/api/stock-movements';
const API_PRODUCTS = 'http://localhost:5000/api/products';

const emptyForm = {
  productId: '', type: 'entree', quantite: '', reference: ''
};

function Modal({ dark, border, text, subText, form, setForm, products, onSave, onClose, accentColor }) {
  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: dark ? '#111827' : '#f9fafb',
    border: `1px solid ${border}`,
    borderRadius: '10px', color: text,
    fontSize: '12px', outline: 'none',
    marginBottom: '12px'
  };
  const labelStyle = {
    fontSize: '11px', color: subText,
    display: 'block', marginBottom: '4px', fontWeight: 500
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: dark ? '#1f2937' : '#fff',
        borderRadius: '18px', padding: '28px',
        width: '400px', border: `1px solid ${border}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: text }}>
            📦 Nouveau mouvement
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: subText,
            fontSize: '20px', cursor: 'pointer'
          }}>✕</button>
        </div>

        <label style={labelStyle}>Produit *</label>
        <select
          style={{ ...inputStyle, appearance: 'auto' }}
          value={form.productId}
          onChange={e => setForm({ ...form, productId: e.target.value })}
        >
          <option value="">— Sélectionner un produit —</option>
          {products.map(p => (
            <option key={p._id} value={p._id}>{p.sku} — {p.nom}</option>
          ))}
        </select>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <div>
            <label style={labelStyle}>Type *</label>
            <select
              style={{ ...inputStyle, appearance: 'auto' }}
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
            >
              <option value="entree">📥 Entrée</option>
              <option value="sortie">📤 Sortie</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Quantité *</label>
            <input style={inputStyle} type="number" placeholder="0"
              value={form.quantite} onChange={e => setForm({ ...form, quantite: e.target.value })} />
          </div>
        </div>

        <label style={labelStyle}>Référence document *</label>
        <input style={inputStyle} placeholder="BL-2026-0451"
          value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} />

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px', borderRadius: '10px',
            border: `1px solid ${border}`, background: 'none',
            color: text, fontSize: '13px', cursor: 'pointer'
          }}>Annuler</button>
          <button onClick={onSave} style={{
            flex: 1, padding: '10px', borderRadius: '10px',
            border: 'none', background: accentColor,
            color: '#fff', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer'
          }}>Valider</button>
        </div>
      </div>
    </div>
  );
}

function Produit() {
  const { darkMode, accentColor } = useTheme();
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const dark = darkMode;
  const text = dark ? '#f9fafb' : '#111827';
  const subText = dark ? '#9ca3af' : '#6b7280';
  const cardBg = dark ? '#1f2937' : '#fff';
  const border = dark ? '#374151' : '#e5e7eb';
  const tableBg = dark ? '#111827' : '#f9fafb';

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_MOVEMENTS, { headers });
      const data = await res.json();
      setMovements(Array.isArray(data) ? data : []);
    } catch { showToast('Erreur chargement', 'error'); }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_PRODUCTS, { headers });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { /* silencieux */ }
  };

  useEffect(() => { fetchMovements(); fetchProducts(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.productId || !form.quantite || !form.reference) {
      showToast('Remplir tous les champs obligatoires', 'error');
      return;
    }
    try {
      const res = await fetch(API_MOVEMENTS, {
        method: 'POST', headers,
        body: JSON.stringify({
          ...form,
          quantite: Number(form.quantite)
        })
      });
      if (res.ok) {
        showToast('Mouvement enregistré ✅');
        setShowModal(false);
        fetchMovements();
        fetchProducts(); // recharger quantités mises à jour
      } else {
        const d = await res.json();
        showToast(d.message || 'Erreur', 'error');
      }
    } catch { showToast('Erreur serveur', 'error'); }
  };

  const filtered = movements.filter(m => {
    const matchSearch =
      m.productNom?.toLowerCase().includes(search.toLowerCase()) ||
      m.reference?.toLowerCase().includes(search.toLowerCase()) ||
      m.sku?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || m.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalEntrees = movements.filter(m => m.type === 'entree').reduce((s, m) => s + Number(m.quantite || 0), 0);
  const totalSorties = movements.filter(m => m.type === 'sortie').reduce((s, m) => s + Number(m.quantite || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 200,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff', padding: '12px 20px', borderRadius: '12px',
          fontSize: '13px', fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: 'slideIn 0.3s ease'
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .row-hover:hover { background: ${dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: text }}>Stocks 🏭</h1>
          <p style={{ fontSize: '12px', color: subText, marginTop: '3px' }}>
            {movements.length} mouvement{movements.length > 1 ? 's' : ''} enregistré{movements.length > 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => { fetchMovements(); fetchProducts(); }} style={{
            padding: '9px 16px', borderRadius: '10px',
            border: `1px solid ${border}`, background: cardBg,
            color: text, fontSize: '12px', cursor: 'pointer'
          }}>🔄 Actualiser</button>
          <button onClick={openAdd} style={{
            padding: '9px 18px', borderRadius: '10px',
            border: 'none', background: accentColor,
            color: '#fff', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer'
          }}>+ Nouveau mouvement</button>
        </div>
      </div>

      {/* Recherche + stats rapides */}
      <div style={{
        background: cardBg, borderRadius: '14px',
        border: `1px solid ${border}`, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <input
          placeholder="🔍  Rechercher par produit, SKU ou référence..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, padding: '9px 14px',
            background: dark ? '#111827' : '#f9fafb',
            border: `1px solid ${border}`, borderRadius: '10px',
            color: text, fontSize: '12px', outline: 'none'
          }}
        />
        <select
          value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{
            padding: '9px 14px',
            background: dark ? '#111827' : '#f9fafb',
            border: `1px solid ${border}`, borderRadius: '10px',
            color: text, fontSize: '12px', outline: 'none'
          }}
        >
          <option value="all">Tous les types</option>
          <option value="entree">Entrées</option>
          <option value="sortie">Sorties</option>
        </select>
        <div style={{ display: 'flex', gap: '20px', flexShrink: 0 }}>
          {[
            { label: 'Entrées', val: `+${totalEntrees}`, color: '#10b981' },
            { label: 'Sorties', val: `-${totalSorties}`, color: '#ef4444' },
            { label: 'Solde', val: totalEntrees - totalSorties, color: accentColor },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '10px', color: subText }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div style={{
        background: cardBg, borderRadius: '14px',
        border: `1px solid ${border}`, overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 0.8fr 0.8fr 1fr 1fr 1fr',
          padding: '12px 20px',
          background: tableBg,
          borderBottom: `1px solid ${border}`,
          fontSize: '11px', color: subText, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          <span>Produit / SKU</span>
          <span>Type</span>
          <span>Quantité</span>
          <span>Référence</span>
          <span>Opérateur</span>
          <span>Date</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: subText, fontSize: '13px' }}>
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: subText, fontSize: '13px' }}>
            {search ? 'Aucun résultat trouvé' : 'Aucun mouvement — enregistrez le premier !'}
          </div>
        ) : (
          filtered.map((m, i) => (
            <div key={m._id} className="row-hover"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 0.8fr 0.8fr 1fr 1fr 1fr',
                padding: '13px 20px',
                borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : 'none',
                alignItems: 'center',
                transition: 'background 0.15s'
              }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: text }}>{m.productNom || '—'}</div>
                <div style={{ fontSize: '10px', color: subText, marginTop: '2px' }}>{m.sku}</div>
              </div>
              <div>
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  padding: '4px 10px', borderRadius: '20px',
                  background: m.type === 'entree' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: m.type === 'entree' ? '#10b981' : '#ef4444',
                  border: `1px solid ${m.type === 'entree' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                }}>
                  {m.type === 'entree' ? '📥 Entrée' : '📤 Sortie'}
                </span>
              </div>
              <div style={{
                fontSize: '14px', fontWeight: 700,
                color: m.type === 'entree' ? '#10b981' : '#ef4444'
              }}>
                {m.type === 'entree' ? '+' : '-'}{m.quantite}
              </div>
              <div style={{ fontSize: '12px', color: subText, fontFamily: 'monospace' }}>{m.reference}</div>
              <div style={{ fontSize: '12px', color: subText }}>{m.operateur || '—'}</div>
              <div style={{ fontSize: '12px', color: subText }}>
                {m.date ? new Date(m.date).toLocaleDateString('fr-FR') : '—'}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <Modal
          dark={dark} border={border} text={text} subText={subText}
          form={form} setForm={setForm} products={products}
          onSave={handleSave} onClose={() => setShowModal(false)}
          accentColor={accentColor}
        />
      )}
    </div>
  );
}

export default Produit;