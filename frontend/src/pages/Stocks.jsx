import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const API_MOVEMENTS = 'http://localhost:5000/api/stock-movements';
const API_PRODUCTS = 'http://localhost:5000/api/products';

function Stocks() {
  const { darkMode, accentColor } = useTheme();
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('entree');
  const [form, setForm] = useState({ product: '', quantite: '', referenceDocument: '' });
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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
    } catch {
      showToast('Erreur chargement', 'error');
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_PRODUCTS, { headers });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => {
    fetchMovements();
    fetchProducts();
  }, []);

  const openModal = (type) => {
    setModalType(type);
    setForm({ product: '', quantite: '', referenceDocument: '' });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.product || !form.quantite) {
      showToast('Produit et quantité obligatoires', 'error');
      return;
    }
    try {
      const res = await fetch(API_MOVEMENTS, {
        method: 'POST', headers,
        body: JSON.stringify({
          ...form,
          type: modalType,
          quantite: Number(form.quantite)
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(modalType === 'entree' ? 'Entrée enregistrée ✅' : 'Sortie enregistrée ✅');
        setShowModal(false);
        fetchMovements();
        fetchProducts();
      } else {
        showToast(data.message || 'Erreur', 'error');
      }
    } catch {
      showToast('Erreur serveur', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_MOVEMENTS}/${id}`, {
        method: 'DELETE', headers
      });
      if (res.ok) {
        showToast('Mouvement supprimé');
        setDeleteConfirm(null);
        fetchMovements();
      } else {
        showToast('Erreur suppression', 'error');
      }
    } catch {
      showToast('Erreur serveur', 'error');
    }
  };

  const filtered = filter === 'all'
    ? movements
    : movements.filter(m => m.type === filter);

  const totalEntrees = movements
    .filter(m => m.type === 'entree')
    .reduce((s, m) => s + m.quantite, 0);
  const totalSorties = movements
    .filter(m => m.type === 'sortie')
    .reduce((s, m) => s + m.quantite, 0);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 200,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff', padding: '12px 20px', borderRadius: '12px',
          fontSize: '13px', fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: 'slideIn 0.3s ease'
        }}>{toast.msg}</div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .row-hover:hover {
          background: ${dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} !important;
        }
        .action-btn:hover { opacity: 0.8; transform: scale(1.05); }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: text }}>
            Mouvements de Stock 🏭
          </h1>
          <p style={{ fontSize: '12px', color: subText, marginTop: '3px' }}>
            Historique des entrées et sorties
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => openModal('entree')} style={{
            padding: '9px 18px', borderRadius: '10px',
            border: 'none', background: '#10b981',
            color: '#fff', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer'
          }}>+ Entrée</button>
          <button onClick={() => openModal('sortie')} style={{
            padding: '9px 18px', borderRadius: '10px',
            border: 'none', background: '#ef4444',
            color: '#fff', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer'
          }}>- Sortie</button>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {[
          { icon: '📥', label: 'Total Entrées', value: `+${totalEntrees}`, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border2: 'rgba(16,185,129,0.2)' },
          { icon: '📤', label: 'Total Sorties', value: `-${totalSorties}`, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border2: 'rgba(239,68,68,0.2)' },
          { icon: '📋', label: 'Mouvements total', value: movements.length, color: accentColor, bg: 'transparent', border2: border },
        ].map((s, i) => (
          <div key={i} style={{
            background: cardBg, borderRadius: '14px',
            border: `1px solid ${s.border2}`, padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: '14px'
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: s.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', flexShrink: 0
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '11px', color: subText }}>{s.label}</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{
        background: cardBg, borderRadius: '14px',
        border: `1px solid ${border}`, padding: '14px 20px',
        display: 'flex', gap: '10px', alignItems: 'center'
      }}>
        <span style={{ fontSize: '12px', color: subText, marginRight: '4px' }}>Filtrer:</span>
        {[
          { val: 'all', label: 'Tous' },
          { val: 'entree', label: '📥 Entrées' },
          { val: 'sortie', label: '📤 Sorties' },
        ].map(f => (
          <button key={f.val} onClick={() => setFilter(f.val)} style={{
            padding: '6px 16px', borderRadius: '20px',
            border: `1px solid ${filter === f.val ? accentColor : border}`,
            background: filter === f.val ? accentColor : 'none',
            color: filter === f.val ? '#fff' : subText,
            fontSize: '12px', cursor: 'pointer',
            fontWeight: filter === f.val ? 600 : 400,
            transition: 'all 0.2s'
          }}>{f.label}</button>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: subText }}>
          {filtered.length} mouvement{filtered.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Tableau */}
      <div style={{
        background: cardBg, borderRadius: '14px',
        border: `1px solid ${border}`, overflow: 'hidden'
      }}>
        {/* Header tableau */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 60px',
          padding: '12px 20px',
          background: tableBg,
          borderBottom: `1px solid ${border}`,
          fontSize: '11px', color: subText,
          fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <span>Produit</span>
          <span>Type</span>
          <span>Quantité</span>
          <span>Référence</span>
          <span>Date</span>
          <span style={{ textAlign: 'center' }}>Action</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: subText, fontSize: '13px' }}>
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: subText, fontSize: '13px' }}>
            Aucun mouvement enregistré
          </div>
        ) : (
          filtered.map((m, i) => (
            <div key={m._id} className="row-hover"
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 60px',
                padding: '13px 20px',
                borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : 'none',
                alignItems: 'center',
                transition: 'background 0.15s'
              }}>

              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: text }}>
                  {m.product?.nom || 'Produit supprimé'}
                </div>
                <div style={{ fontSize: '10px', color: subText, marginTop: '2px' }}>
                  {m.product?.sku || '—'}
                </div>
              </div>

              <div>
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  padding: '4px 12px', borderRadius: '20px',
                  background: m.type === 'entree'
                    ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: m.type === 'entree' ? '#10b981' : '#ef4444',
                  border: `1px solid ${m.type === 'entree'
                    ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                }}>
                  {m.type === 'entree' ? '📥 Entrée' : '📤 Sortie'}
                </span>
              </div>

              <div style={{
                fontSize: '15px', fontWeight: 700,
                color: m.type === 'entree' ? '#10b981' : '#ef4444'
              }}>
                {m.type === 'entree' ? '+' : '-'}{m.quantite}
              </div>

              <div style={{ fontSize: '12px', color: subText }}>
                {m.referenceDocument || '—'}
              </div>

              <div style={{ fontSize: '11px', color: subText }}>
                {new Date(m.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </div>

              {/* Delete button */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  className="action-btn"
                  onClick={() => setDeleteConfirm(m._id)}
                  style={{
                    width: '30px', height: '30px', borderRadius: '8px',
                    border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.1)',
                    cursor: 'pointer', fontSize: '13px',
                    transition: 'all 0.15s'
                  }}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal entrée/sortie */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: cardBg, borderRadius: '18px',
            padding: '28px', width: '380px',
            border: `1px solid ${border}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: text }}>
                {modalType === 'entree' ? '📥 Nouvelle Entrée' : '📤 Nouvelle Sortie'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none', border: 'none',
                color: subText, fontSize: '20px', cursor: 'pointer'
              }}>✕</button>
            </div>

            <label style={labelStyle}>Produit *</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.product}
              onChange={e => setForm({ ...form, product: e.target.value })}>
              <option value="">— Sélectionner un produit —</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>
                  {p.nom} (Stock: {p.quantite})
                </option>
              ))}
            </select>

            <label style={labelStyle}>Quantité *</label>
            <input type="number" min="1" style={inputStyle}
              placeholder="0"
              value={form.quantite}
              onChange={e => setForm({ ...form, quantite: e.target.value })} />

            <label style={labelStyle}>Référence document</label>
            <input type="text" style={inputStyle}
              placeholder="BL-001, CMD-002..."
              value={form.referenceDocument}
              onChange={e => setForm({ ...form, referenceDocument: e.target.value })} />

            <div style={{
              padding: '12px', borderRadius: '10px', marginBottom: '16px',
              background: modalType === 'entree'
                ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${modalType === 'entree'
                ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              fontSize: '12px',
              color: modalType === 'entree' ? '#10b981' : '#ef4444'
            }}>
              {modalType === 'entree'
                ? '📥 Cette entrée va augmenter le stock du produit sélectionné.'
                : '📤 Cette sortie va diminuer le stock du produit sélectionné.'}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                border: `1px solid ${border}`, background: 'none',
                color: text, fontSize: '13px', cursor: 'pointer'
              }}>Annuler</button>
              <button onClick={handleSubmit} style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                border: 'none',
                background: modalType === 'entree' ? '#10b981' : '#ef4444',
                color: '#fff', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer'
              }}>
                {modalType === 'entree' ? 'Enregistrer entrée' : 'Enregistrer sortie'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation delete */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: cardBg, borderRadius: '16px',
            padding: '28px', width: '340px',
            border: `1px solid ${border}`, textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🗑️</div>
            <div style={{
              fontSize: '15px', fontWeight: 700,
              color: text, marginBottom: '8px'
            }}>
              Supprimer ce mouvement ?
            </div>
            <div style={{ fontSize: '12px', color: subText, marginBottom: '20px' }}>
              Cette action est irréversible.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                border: `1px solid ${border}`, background: 'none',
                color: text, fontSize: '13px', cursor: 'pointer'
              }}>Annuler</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                border: 'none', background: '#ef4444',
                color: '#fff', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer'
              }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Stocks;