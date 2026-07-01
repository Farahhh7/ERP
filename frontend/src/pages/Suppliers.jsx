import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const API = 'http://localhost:5000/api/suppliers';

const emptyForm = {
  nom: '', contact: '', telephone: '', email: '',
  adresse: '', delaiLivraison: '', conditions: ''
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
        width: '420px', border: `1px solid ${border}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: text }}>
            {editMode ? '✏️ Modifier fournisseur' : '➕ Nouveau fournisseur'}
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: subText,
            fontSize: '20px', cursor: 'pointer'
          }}>✕</button>
        </div>

        <label style={labelStyle}>Nom du fournisseur *</label>
        <input style={inputStyle} placeholder="Ex: SOTUPHARM Distribution"
          value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <div>
            <label style={labelStyle}>Personne à contacter</label>
            <input style={inputStyle} placeholder="Nom du contact"
              value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Téléphone *</label>
            <input style={inputStyle} placeholder="+216 XX XXX XXX"
              value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} />
          </div>
        </div>

        <label style={labelStyle}>Email</label>
        <input style={inputStyle} type="email" placeholder="contact@fournisseur.tn"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />

        <label style={labelStyle}>Adresse</label>
        <input style={inputStyle} placeholder="Adresse complète"
          value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <div>
            <label style={labelStyle}>Délai de livraison (jours) *</label>
            <input style={inputStyle} type="number" placeholder="7"
              value={form.delaiLivraison} onChange={e => setForm({ ...form, delaiLivraison: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Conditions contractuelles</label>
            <input style={inputStyle} placeholder="Paiement 30j"
              value={form.conditions} onChange={e => setForm({ ...form, conditions: e.target.value })} />
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

function Suppliers() {
  const { darkMode, accentColor } = useTheme();
  const [suppliers, setSuppliers] = useState([]);
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

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API, { headers });
      const data = await res.json();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch { showToast('Erreur chargement', 'error'); }
    setLoading(false);
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditMode(false);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setForm({
      nom: s.nom, contact: s.contact || '', telephone: s.telephone,
      email: s.email || '', adresse: s.adresse || '',
      delaiLivraison: s.delaiLivraison, conditions: s.conditions || ''
    });
    setEditId(s._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nom || !form.telephone || !form.delaiLivraison) {
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
          delaiLivraison: Number(form.delaiLivraison)
        })
      });
      if (res.ok) {
        showToast(editMode ? 'Fournisseur modifié ✅' : 'Fournisseur ajouté ✅');
        setShowModal(false);
        fetchSuppliers();
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
        showToast('Fournisseur supprimé');
        setDeleteConfirm(null);
        fetchSuppliers();
      }
    } catch { showToast('Erreur suppression', 'error'); }
  };

  const filtered = suppliers.filter(s =>
    s.nom?.toLowerCase().includes(search.toLowerCase()) ||
    s.contact?.toLowerCase().includes(search.toLowerCase()) ||
    s.telephone?.toLowerCase().includes(search.toLowerCase())
  );

  const getDelaiBadge = (delai) => {
    if (delai <= 3) return { label: 'Rapide', bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.2)' };
    if (delai <= 10) return { label: 'Standard', bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.2)' };
    return { label: 'Lent', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' };
  };

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
        .action-btn:hover { opacity: 0.8; transform: scale(1.05); }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: text }}>Fournisseurs 🚚</h1>
          <p style={{ fontSize: '12px', color: subText, marginTop: '3px' }}>
            {suppliers.length} fournisseur{suppliers.length > 1 ? 's' : ''} enregistré{suppliers.length > 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchSuppliers} style={{
            padding: '9px 16px', borderRadius: '10px',
            border: `1px solid ${border}`, background: cardBg,
            color: text, fontSize: '12px', cursor: 'pointer'
          }}>🔄 Actualiser</button>
          <button onClick={openAdd} style={{
            padding: '9px 18px', borderRadius: '10px',
            border: 'none', background: accentColor,
            color: '#fff', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer'
          }}>+ Ajouter fournisseur</button>
        </div>
      </div>

      {/* Recherche + stats rapides */}
      <div style={{
        background: cardBg, borderRadius: '14px',
        border: `1px solid ${border}`, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <input
          placeholder="🔍  Rechercher par nom, contact ou téléphone..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, padding: '9px 14px',
            background: dark ? '#111827' : '#f9fafb',
            border: `1px solid ${border}`, borderRadius: '10px',
            color: text, fontSize: '12px', outline: 'none'
          }}
        />
        <div style={{ display: 'flex', gap: '20px', flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: accentColor }}>{suppliers.length}</div>
            <div style={{ fontSize: '10px', color: subText }}>Total</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>
              {suppliers.filter(s => s.delaiLivraison <= 3).length}
            </div>
            <div style={{ fontSize: '10px', color: subText }}>Livraison rapide</div>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div style={{
        background: cardBg, borderRadius: '14px',
        border: `1px solid ${border}`, overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1.2fr 1fr 1fr 100px',
          padding: '12px 20px',
          background: tableBg,
          borderBottom: `1px solid ${border}`,
          fontSize: '11px', color: subText, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          <span>Fournisseur / Contact</span>
          <span>Téléphone</span>
          <span>Email</span>
          <span>Délai livraison</span>
          <span>Conditions</span>
          <span style={{ textAlign: 'center' }}>Actions</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: subText, fontSize: '13px' }}>
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: subText, fontSize: '13px' }}>
            {search ? 'Aucun résultat trouvé' : 'Aucun fournisseur — ajoutez le premier !'}
          </div>
        ) : (
          filtered.map((s, i) => {
            const badge = getDelaiBadge(s.delaiLivraison);
            return (
              <div key={s._id} className="row-hover"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr 1.2fr 1fr 1fr 100px',
                  padding: '13px 20px',
                  borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : 'none',
                  alignItems: 'center',
                  transition: 'background 0.15s'
                }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: text }}>{s.nom}</div>
                  {s.contact && (
                    <div style={{ fontSize: '10px', color: subText, marginTop: '2px' }}>{s.contact}</div>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: subText }}>{s.telephone}</div>
                <div style={{ fontSize: '12px', color: subText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.email || '—'}
                </div>
                <div>
                  <span style={{
                    fontSize: '11px', fontWeight: 600,
                    padding: '4px 10px', borderRadius: '20px',
                    background: badge.bg, color: badge.color,
                    border: `1px solid ${badge.border}`
                  }}>{s.delaiLivraison}j — {badge.label}</span>
                </div>
                <div style={{ fontSize: '12px', color: subText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.conditions || '—'}
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  <button className="action-btn" onClick={() => openEdit(s)}
                    style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      border: `1px solid ${border}`, background: cardBg,
                      cursor: 'pointer', fontSize: '13px', transition: 'all 0.15s'
                    }}>✏️</button>
                  <button className="action-btn" onClick={() => setDeleteConfirm(s._id)}
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
              Supprimer ce fournisseur ?
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

export default Suppliers;