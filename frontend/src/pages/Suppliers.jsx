import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const API = 'http://localhost:5000/api/suppliers';

const emptyForm = {
  nom: '', email: '', telephone: '',
  adresse: '', delaiLivraison: 7,
  conditionsContractuelles: ''
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
        width: '440px', border: `1px solid ${border}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: text }}>
            {editMode ? '✏️ Modifier fournisseur' : '➕ Nouveau fournisseur'}
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            color: subText, fontSize: '20px', cursor: 'pointer'
          }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <div>
            <label style={labelStyle}>Nom *</label>
            <input style={inputStyle} placeholder="TechDistrib SARL"
              value={form.nom}
              onChange={e => setForm({ ...form, nom: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input style={inputStyle} type="email" placeholder="contact@fournisseur.tn"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <div>
            <label style={labelStyle}>Téléphone</label>
            <input style={inputStyle} placeholder="+216 XX XXX XXX"
              value={form.telephone}
              onChange={e => setForm({ ...form, telephone: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Délai livraison (jours)</label>
            <input style={inputStyle} type="number" min="1" placeholder="7"
              value={form.delaiLivraison}
              onChange={e => setForm({ ...form, delaiLivraison: Number(e.target.value) })} />
          </div>
        </div>

        <label style={labelStyle}>Adresse</label>
        <input style={inputStyle} placeholder="Rue, Ville, Pays"
          value={form.adresse}
          onChange={e => setForm({ ...form, adresse: e.target.value })} />

        <label style={labelStyle}>Conditions contractuelles</label>
        <textarea style={{
          ...inputStyle, resize: 'vertical',
          minHeight: '70px', fontFamily: 'inherit'
        }}
          placeholder="Conditions de paiement, remises, garanties..."
          value={form.conditionsContractuelles}
          onChange={e => setForm({ ...form, conditionsContractuelles: e.target.value })}
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
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
  const [expanded, setExpanded] = useState(null);

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
    } catch {
      showToast('Erreur chargement', 'error');
    }
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
      nom: s.nom, email: s.email,
      telephone: s.telephone || '',
      adresse: s.adresse || '',
      delaiLivraison: s.delaiLivraison || 7,
      conditionsContractuelles: s.conditionsContractuelles || ''
    });
    setEditId(s._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nom || !form.email) {
      showToast('Nom et email obligatoires', 'error');
      return;
    }
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${API}/${editId}` : API;
      const res = await fetch(url, {
        method, headers,
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showToast(editMode ? 'Fournisseur modifié ✅' : 'Fournisseur ajouté ✅');
        setShowModal(false);
        fetchSuppliers();
      } else {
        const d = await res.json();
        showToast(d.message || 'Erreur', 'error');
      }
    } catch {
      showToast('Erreur serveur', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        showToast('Fournisseur supprimé');
        setDeleteConfirm(null);
        fetchSuppliers();
      }
    } catch {
      showToast('Erreur suppression', 'error');
    }
  };

  const filtered = suppliers.filter(s =>
    s.nom?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getDelaiColor = (d) => {
    if (d <= 5) return '#10b981';
    if (d <= 10) return '#f59e0b';
    return '#ef4444';
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

      {/* Stats + Recherche */}
      <div style={{
        background: cardBg, borderRadius: '14px',
        border: `1px solid ${border}`, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <input
          placeholder="🔍  Rechercher par nom ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, padding: '9px 14px',
            background: dark ? '#111827' : '#f9fafb',
            border: `1px solid ${border}`,
            borderRadius: '10px', color: text,
            fontSize: '12px', outline: 'none'
          }}
        />
        <div style={{ display: 'flex', gap: '24px', flexShrink: 0 }}>
          {[
            { label: 'Total', val: suppliers.length, color: accentColor },
            { label: 'Délai ≤ 5j', val: suppliers.filter(s => s.delaiLivraison <= 5).length, color: '#10b981' },
            { label: 'Délai > 10j', val: suppliers.filter(s => s.delaiLivraison > 10).length, color: '#ef4444' },
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
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px',
          padding: '12px 20px',
          background: tableBg,
          borderBottom: `1px solid ${border}`,
          fontSize: '11px', color: subText,
          fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <span>Nom</span>
          <span>Email</span>
          <span>Téléphone</span>
          <span>Délai (j)</span>
          <span>Détails</span>
          <span style={{ textAlign: 'center' }}>Actions</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: subText, fontSize: '13px' }}>
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: subText, fontSize: '13px' }}>
            {search ? 'Aucun résultat' : 'Aucun fournisseur — ajoutez le premier !'}
          </div>
        ) : (
          filtered.map((s, i) => (
            <div key={s._id}>
              <div className="row-hover"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px',
                  padding: '13px 20px',
                  borderBottom: `1px solid ${border}`,
                  alignItems: 'center',
                  transition: 'background 0.15s'
                }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: text }}>{s.nom}</div>
                  {s.adresse && (
                    <div style={{ fontSize: '10px', color: subText, marginTop: '2px' }}>
                      📍 {s.adresse}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: subText }}>{s.email}</div>

                <div style={{ fontSize: '12px', color: subText }}>
                  {s.telephone || '—'}
                </div>

                <div>
                  <span style={{
                    fontSize: '13px', fontWeight: 700,
                    color: getDelaiColor(s.delaiLivraison),
                    background: `${getDelaiColor(s.delaiLivraison)}18`,
                    padding: '3px 10px', borderRadius: '20px',
                    border: `1px solid ${getDelaiColor(s.delaiLivraison)}33`
                  }}>
                    {s.delaiLivraison}j
                  </span>
                </div>

                <button
                  onClick={() => setExpanded(expanded === s._id ? null : s._id)}
                  style={{
                    background: 'none', border: `1px solid ${border}`,
                    borderRadius: '8px', padding: '4px 10px',
                    color: subText, fontSize: '11px',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                  {expanded === s._id ? '▲ Moins' : '▼ Plus'}
                </button>

                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  <button className="action-btn" onClick={() => openEdit(s)}
                    style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      border: `1px solid ${border}`, background: cardBg,
                      cursor: 'pointer', fontSize: '13px',
                      transition: 'all 0.15s'
                    }}>✏️</button>
                  <button className="action-btn" onClick={() => setDeleteConfirm(s._id)}
                    style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      border: '1px solid rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.1)',
                      cursor: 'pointer', fontSize: '13px',
                      transition: 'all 0.15s'
                    }}>🗑️</button>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === s._id && (
                <div style={{
                  padding: '14px 20px',
                  background: dark ? '#111827' : '#f9fafb',
                  borderBottom: `1px solid ${border}`,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px'
                }}>
                  <div style={{
                    padding: '12px', borderRadius: '10px',
                    background: cardBg, border: `1px solid ${border}`
                  }}>
                    <div style={{ fontSize: '10px', color: subText, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Conditions contractuelles
                    </div>
                    <div style={{ fontSize: '12px', color: text }}>
                      {s.conditionsContractuelles || 'Aucune condition renseignée'}
                    </div>
                  </div>
                  <div style={{
                    padding: '12px', borderRadius: '10px',
                    background: cardBg, border: `1px solid ${border}`
                  }}>
                    <div style={{ fontSize: '10px', color: subText, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Délai de livraison
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: getDelaiColor(s.delaiLivraison) }}>
                      {s.delaiLivraison} jours
                    </div>
                    <div style={{ fontSize: '10px', color: subText, marginTop: '2px' }}>
                      {s.delaiLivraison <= 5 ? '✅ Rapide' : s.delaiLivraison <= 10 ? '⚠️ Moyen' : '🔴 Long'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
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