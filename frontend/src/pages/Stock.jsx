import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const API = 'http://localhost:5000/api/products';

const emptyForm = {
  sku: '', nom: '', categorie: '',
  quantite: '', seuilCritique: '', prix: ''
};

function Modal({ dark, border, text, subText, form, setForm, onSave, onClose, editMode, accentColor }) {
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
            {editMode ? '✏️ Modifier produit' : '➕ Nouveau produit'}
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: subText,
            fontSize: '20px', cursor: 'pointer'
          }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <div>
            <label style={labelStyle}>SKU *</label>
            <input style={inputStyle} placeholder="PRD-001"
              value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Catégorie *</label>
            <input style={inputStyle} placeholder="Informatique"
              value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} />
          </div>
        </div>

        <label style={labelStyle}>Nom du produit *</label>
        <input style={inputStyle} placeholder="Nom complet du produit"
          value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 12px' }}>
          <div>
            <label style={labelStyle}>Quantité *</label>
            <input style={inputStyle} type="number" placeholder="0"
              value={form.quantite} onChange={e => setForm({ ...form, quantite: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Seuil critique *</label>
            <input style={inputStyle} type="number" placeholder="10"
              value={form.seuilCritique} onChange={e => setForm({ ...form, seuilCritique: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Prix (TND) *</label>
            <input style={inputStyle} type="number" placeholder="0.00"
              value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} />
          </div>
        </div>

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
          }}>
            {editMode ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stock() {
  const { darkMode, accentColor } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API, { headers });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { showToast('Erreur chargement', 'error'); }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditMode(false);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setForm({
      sku: p.sku, nom: p.nom, categorie: p.categorie,
      quantite: p.quantite, seuilCritique: p.seuilCritique, prix: p.prix
    });
    setEditId(p._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.sku || !form.nom || !form.categorie || !form.prix) {
      showToast('Remplir tous les champs obligatoires', 'error');
      return;
    }
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${API}/${editId}` : API;
      const res = await fetch(url, {
        method, headers,
        body: JSON.stringify({
          ...form,
          quantite: Number(form.quantite),
          seuilCritique: Number(form.seuilCritique),
          prix: Number(form.prix)
        })
      });
      if (res.ok) {
        showToast(editMode ? 'Produit modifié ✅' : 'Produit ajouté ✅');
        setShowModal(false);
        fetchProducts();
      } else {
        const d = await res.json();
        showToast(d.message || 'Erreur', 'error');
      }
    } catch { showToast('Erreur serveur', 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        showToast('Produit supprimé');
        setDeleteConfirm(null);
        fetchProducts();
      }
    } catch { showToast('Erreur suppression', 'error'); }
  };

  const filtered = products.filter(p =>
    p.nom?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.categorie?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (p) => {
    if (p.quantite <= 0) return { label: 'Rupture', bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.2)' };
    if (p.quantite <= p.seuilCritique) return { label: 'Critique', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' };
    return { label: 'OK', bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.2)' };
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
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .row-hover:hover { background: ${dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} !important; }
        .action-btn:hover { opacity: 0.8; transform: scale(1.05); }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: text }}>Produits 📦</h1>
          <p style={{ fontSize: '12px', color: subText, marginTop: '3px' }}>
            {products.length} produit{products.length > 1 ? 's' : ''} dans le catalogue
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchProducts} style={{
            padding: '9px 16px', borderRadius: '10px',
            border: `1px solid ${border}`, background: cardBg,
            color: text, fontSize: '12px', cursor: 'pointer'
          }}>🔄 Actualiser</button>
          <button onClick={openAdd} style={{
            padding: '9px 18px', borderRadius: '10px',
            border: 'none', background: accentColor,
            color: '#fff', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer'
          }}>+ Ajouter produit</button>
        </div>
      </div>

      {/* Recherche + stats rapides */}
      <div style={{
        background: cardBg, borderRadius: '14px',
        border: `1px solid ${border}`, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <input
          placeholder="🔍  Rechercher par nom, SKU ou catégorie..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, padding: '9px 14px',
            background: dark ? '#111827' : '#f9fafb',
            border: `1px solid ${border}`, borderRadius: '10px',
            color: text, fontSize: '12px', outline: 'none'
          }}
        />
        <div style={{ display: 'flex', gap: '20px', flexShrink: 0 }}>
          {[
            { label: 'Total', val: products.length, color: accentColor },
            { label: 'Critiques', val: products.filter(p => p.quantite <= p.seuilCritique && p.quantite > 0).length, color: '#f59e0b' },
            { label: 'Ruptures', val: products.filter(p => p.quantite <= 0).length, color: '#ef4444' },
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
        {/* Header tableau */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr 100px',
          padding: '12px 20px',
          background: tableBg,
          borderBottom: `1px solid ${border}`,
          fontSize: '11px', color: subText, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          <span>Produit / SKU</span>
          <span>Catégorie</span>
          <span>Quantité</span>
          <span>Seuil</span>
          <span>Prix</span>
          <span>Statut</span>
          <span style={{ textAlign: 'center' }}>Actions</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: subText, fontSize: '13px' }}>
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: subText, fontSize: '13px' }}>
            {search ? 'Aucun résultat trouvé' : 'Aucun produit — ajoutez le premier !'}
          </div>
        ) : (
          filtered.map((p, i) => {
            const status = getStatusBadge(p);
            return (
              <div key={p._id} className="row-hover"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr 100px',
                  padding: '13px 20px',
                  borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : 'none',
                  alignItems: 'center',
                  transition: 'background 0.15s'
                }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: text }}>{p.nom}</div>
                  <div style={{ fontSize: '10px', color: subText, marginTop: '2px' }}>{p.sku}</div>
                </div>
                <div style={{
                  fontSize: '12px', color: subText,
                  background: dark ? '#111827' : '#f3f4f6',
                  padding: '3px 10px', borderRadius: '20px',
                  display: 'inline-block', width: 'fit-content'
                }}>{p.categorie}</div>
                <div style={{
                  fontSize: '14px', fontWeight: 700,
                  color: p.quantite <= p.seuilCritique ? '#ef4444' : text
                }}>{p.quantite}</div>
                <div style={{ fontSize: '13px', color: subText }}>{p.seuilCritique}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: accentColor }}>{p.prix} TND</div>
                <div>
                  <span style={{
                    fontSize: '11px', fontWeight: 600,
                    padding: '4px 10px', borderRadius: '20px',
                    background: status.bg, color: status.color,
                    border: `1px solid ${status.border}`
                  }}>{status.label}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  <button className="action-btn" onClick={() => openEdit(p)}
                    style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      border: `1px solid ${border}`, background: cardBg,
                      cursor: 'pointer', fontSize: '13px', transition: 'all 0.15s'
                    }}>✏️</button>
                  <button className="action-btn" onClick={() => setDeleteConfirm(p._id)}
                    style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      border: '1px solid rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.1)',
                      cursor: 'pointer', fontSize: '13px', transition: 'all 0.15s'
                    }}>🗑️</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal ajout/edit */}
      {showModal && (
        <Modal
          dark={dark} border={border} text={text} subText={subText}
          form={form} setForm={setForm}
          onSave={handleSave} onClose={() => setShowModal(false)}
          editMode={editMode} accentColor={accentColor}
        />
      )}

      {/* Confirm delete */}
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
            <div style={{ fontSize: '15px', fontWeight: 700, color: text, marginBottom: '8px' }}>
              Supprimer ce produit ?
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

export default Stock;