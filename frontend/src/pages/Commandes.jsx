import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const API_ORDERS = 'http://localhost:5000/api/orders';
const API_SUPPLIERS = 'http://localhost:5000/api/suppliers';
const API_PRODUCTS = 'http://localhost:5000/api/products';

const STATUTS = [
  { val: 'en_attente', label: 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  { val: 'validee',    label: 'Validée',    color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.2)' },
  { val: 'livree',     label: 'Livrée',     color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
  { val: 'annulee',    label: 'Annulée',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)' },
];

const emptyForm = {
  supplier: '',
  lignesCommande: [{ product: '', quantite: 1, prixUnitaire: 0 }],
  statut: 'en_attente',
  genereAutomatiquement: false,
};

function Commandes() {
  const { darkMode, accentColor } = useTheme();
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [filterStatut, setFilterStatut] = useState('all');
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

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ordRes, supRes, prodRes] = await Promise.all([
        fetch(API_ORDERS, { headers }),
        fetch(API_SUPPLIERS, { headers }),
        fetch(API_PRODUCTS, { headers }),
      ]);
      const [ords, sups, prods] = await Promise.all([
        ordRes.json(), supRes.json(), prodRes.json()
      ]);
      setOrders(Array.isArray(ords) ? ords : []);
      setSuppliers(Array.isArray(sups) ? sups : []);
      setProducts(Array.isArray(prods) ? prods : []);
    } catch {
      showToast('Erreur chargement', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const addLigne = () => {
    setForm({
      ...form,
      lignesCommande: [
        ...form.lignesCommande,
        { product: '', quantite: 1, prixUnitaire: 0 }
      ]
    });
  };

  const removeLigne = (idx) => {
    setForm({
      ...form,
      lignesCommande: form.lignesCommande.filter((_, i) => i !== idx)
    });
  };

  const updateLigne = (idx, field, value) => {
    const updated = [...form.lignesCommande];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'product') {
      const prod = products.find(p => p._id === value);
      if (prod) updated[idx].prixUnitaire = prod.prix;
    }
    setForm({ ...form, lignesCommande: updated });
  };

  const getTotalCommande = () => {
    return form.lignesCommande.reduce((sum, l) =>
      sum + (Number(l.quantite) * Number(l.prixUnitaire)), 0
    ).toFixed(2);
  };

  const getTotalOrder = (order) => {
    return order.lignesCommande?.reduce((sum, l) =>
      sum + (l.quantite * l.prixUnitaire), 0
    ).toFixed(2) || '0.00';
  };

  const handleSubmit = async () => {
    if (!form.supplier) {
      showToast('Sélectionner un fournisseur', 'error');
      return;
    }
    if (form.lignesCommande.some(l => !l.product || !l.quantite)) {
      showToast('Remplir toutes les lignes de commande', 'error');
      return;
    }
    try {
      const res = await fetch(API_ORDERS, {
        method: 'POST', headers,
        body: JSON.stringify({
          ...form,
          lignesCommande: form.lignesCommande.map(l => ({
            ...l,
            quantite: Number(l.quantite),
            prixUnitaire: Number(l.prixUnitaire)
          }))
        })
      });
      if (res.ok) {
        showToast('Commande créée ✅');
        setShowModal(false);
        setForm(emptyForm);
        fetchAll();
      } else {
        const d = await res.json();
        showToast(d.message || 'Erreur', 'error');
      }
    } catch {
      showToast('Erreur serveur', 'error');
    }
  };

  const handleStatutChange = async (id, statut) => {
    try {
      const res = await fetch(`${API_ORDERS}/${id}/statut`, {
        method: 'PUT', headers,
        body: JSON.stringify({ statut })
      });
      if (res.ok) {
        showToast('Statut mis à jour ✅');
        fetchAll();
      }
    } catch {
      showToast('Erreur mise à jour', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_ORDERS}/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        showToast('Commande supprimée');
        setDeleteConfirm(null);
        fetchAll();
      }
    } catch {
      showToast('Erreur suppression', 'error');
    }
  };

  const getStatut = (val) => STATUTS.find(s => s.val === val) || STATUTS[0];

  const filtered = filterStatut === 'all'
    ? orders
    : orders.filter(o => o.statut === filterStatut);

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: dark ? '#111827' : '#f9fafb',
    border: `1px solid ${border}`,
    borderRadius: '10px', color: text,
    fontSize: '12px', outline: 'none',
    marginBottom: '10px'
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
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: text }}>Commandes 🛒</h1>
          <p style={{ fontSize: '12px', color: subText, marginTop: '3px' }}>
            Bons de commande — {orders.length} commande{orders.length > 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchAll} style={{
            padding: '9px 16px', borderRadius: '10px',
            border: `1px solid ${border}`, background: cardBg,
            color: text, fontSize: '12px', cursor: 'pointer'
          }}>🔄 Actualiser</button>
          <button onClick={() => { setForm(emptyForm); setShowModal(true); }} style={{
            padding: '9px 18px', borderRadius: '10px',
            border: 'none', background: accentColor,
            color: '#fff', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer'
          }}>+ Nouvelle commande</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {STATUTS.map((s, i) => (
          <div key={i} style={{
            background: cardBg, borderRadius: '14px',
            border: `1px solid ${s.border}`, padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: s.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '18px'
            }}>
              {s.val === 'en_attente' ? '⏳' :
               s.val === 'validee' ? '✅' :
               s.val === 'livree' ? '📦' : '❌'}
            </div>
            <div>
              <div style={{ fontSize: '10px', color: subText }}>{s.label}</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>
                {orders.filter(o => o.statut === s.val).length}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{
        background: cardBg, borderRadius: '14px',
        border: `1px solid ${border}`, padding: '14px 20px',
        display: 'flex', gap: '8px', alignItems: 'center'
      }}>
        <span style={{ fontSize: '12px', color: subText, marginRight: '4px' }}>Filtrer:</span>
        <button onClick={() => setFilterStatut('all')} style={{
          padding: '6px 14px', borderRadius: '20px',
          border: `1px solid ${filterStatut === 'all' ? accentColor : border}`,
          background: filterStatut === 'all' ? accentColor : 'none',
          color: filterStatut === 'all' ? '#fff' : subText,
          fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s'
        }}>Tous ({orders.length})</button>
        {STATUTS.map(s => (
          <button key={s.val} onClick={() => setFilterStatut(s.val)} style={{
            padding: '6px 14px', borderRadius: '20px',
            border: `1px solid ${filterStatut === s.val ? s.color : border}`,
            background: filterStatut === s.val ? s.color : 'none',
            color: filterStatut === s.val ? '#fff' : subText,
            fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s'
          }}>{s.label} ({orders.filter(o => o.statut === s.val).length})</button>
        ))}
      </div>

      {/* Tableau */}
      <div style={{
        background: cardBg, borderRadius: '14px',
        border: `1px solid ${border}`, overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr 1fr 1fr 1.5fr 1fr 80px',
          padding: '12px 20px',
          background: tableBg,
          borderBottom: `1px solid ${border}`,
          fontSize: '11px', color: subText,
          fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <span>Référence</span>
          <span>Fournisseur</span>
          <span>Lignes</span>
          <span>Montant</span>
          <span>Statut</span>
          <span>Date</span>
          <span style={{ textAlign: 'center' }}>Action</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: subText, fontSize: '13px' }}>
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: subText, fontSize: '13px' }}>
            Aucune commande — créez la première !
          </div>
        ) : (
          filtered.map((order, i) => {
            const statut = getStatut(order.statut);
            return (
              <div key={order._id}>
                <div className="row-hover" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr 1fr 1fr 1.5fr 1fr 80px',
                  padding: '13px 20px',
                  borderBottom: `1px solid ${border}`,
                  alignItems: 'center', transition: 'background 0.15s'
                }}>
                  {/* Ref */}
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: accentColor }}>
                      #{order._id.slice(-6).toUpperCase()}
                    </div>
                    {order.genereAutomatiquement && (
                      <div style={{ fontSize: '9px', color: '#10b981', marginTop: '2px' }}>
                        🤖 Auto
                      </div>
                    )}
                  </div>

                  {/* Fournisseur */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: text }}>
                      {order.supplier?.nom || '—'}
                    </div>
                    <div style={{ fontSize: '10px', color: subText }}>
                      {order.supplier?.email || ''}
                    </div>
                  </div>

                  {/* Nb lignes */}
                  <div style={{ fontSize: '13px', color: text }}>
                    {order.lignesCommande?.length || 0} article{order.lignesCommande?.length > 1 ? 's' : ''}
                  </div>

                  {/* Montant */}
                  <div style={{ fontSize: '14px', fontWeight: 700, color: accentColor }}>
                    {getTotalOrder(order)} TND
                  </div>

                  {/* Statut select */}
                  <select
                    value={order.statut}
                    onChange={e => handleStatutChange(order._id, e.target.value)}
                    style={{
                      background: statut.bg, color: statut.color,
                      border: `1px solid ${statut.border}`,
                      borderRadius: '20px', padding: '4px 10px',
                      fontSize: '11px', fontWeight: 600,
                      cursor: 'pointer', outline: 'none'
                    }}>
                    {STATUTS.map(s => (
                      <option key={s.val} value={s.val}>{s.label}</option>
                    ))}
                  </select>

                  {/* Date */}
                  <div style={{ fontSize: '11px', color: subText }}>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: '2-digit', year: '2-digit'
                    })}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <button className="action-btn"
                      onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                      style={{
                        width: '28px', height: '28px', borderRadius: '7px',
                        border: `1px solid ${border}`, background: cardBg,
                        cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s'
                      }}>👁️</button>
                    <button className="action-btn"
                      onClick={() => setDeleteConfirm(order._id)}
                      style={{
                        width: '28px', height: '28px', borderRadius: '7px',
                        border: '1px solid rgba(239,68,68,0.3)',
                        background: 'rgba(239,68,68,0.1)',
                        cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s'
                      }}>🗑️</button>
                  </div>
                </div>

                {/* Lignes détail */}
                {expanded === order._id && (
                  <div style={{
                    padding: '14px 20px',
                    background: dark ? '#0d1117' : '#f8fafc',
                    borderBottom: `1px solid ${border}`
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: subText, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Détail des lignes
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: '6px' }}>
                      {['Produit', 'Quantité', 'Prix unit.', 'Total'].map((h, i) => (
                        <div key={i} style={{ fontSize: '10px', color: subText, fontWeight: 600, textTransform: 'uppercase' }}>{h}</div>
                      ))}
                      {order.lignesCommande?.map((ligne, j) => (
                        <>
                          <div key={`n${j}`} style={{ fontSize: '12px', color: text }}>
                            {ligne.product?.nom || '—'}
                            <span style={{ fontSize: '10px', color: subText, marginLeft: '6px' }}>
                              ({ligne.product?.sku || '—'})
                            </span>
                          </div>
                          <div key={`q${j}`} style={{ fontSize: '12px', color: text }}>{ligne.quantite}</div>
                          <div key={`p${j}`} style={{ fontSize: '12px', color: text }}>{ligne.prixUnitaire} TND</div>
                          <div key={`t${j}`} style={{ fontSize: '12px', fontWeight: 600, color: accentColor }}>
                            {(ligne.quantite * ligne.prixUnitaire).toFixed(2)} TND
                          </div>
                        </>
                      ))}
                      <div style={{ gridColumn: '1/-1', borderTop: `1px solid ${border}`, marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: accentColor }}>
                          Total: {getTotalOrder(order)} TND
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal nouvelle commande */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: cardBg, borderRadius: '18px',
            padding: '28px', width: '540px',
            border: `1px solid ${border}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: text }}>
                🛒 Nouvelle commande
              </h2>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none', border: 'none',
                color: subText, fontSize: '20px', cursor: 'pointer'
              }}>✕</button>
            </div>

            {/* Fournisseur */}
            <label style={{ fontSize: '11px', color: subText, display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Fournisseur *
            </label>
            <select style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.supplier}
              onChange={e => setForm({ ...form, supplier: e.target.value })}>
              <option value="">— Sélectionner un fournisseur —</option>
              {suppliers.map(s => (
                <option key={s._id} value={s._id}>{s.nom}</option>
              ))}
            </select>

            {/* Lignes commande */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', color: subText, fontWeight: 500 }}>
                  Lignes de commande *
                </label>
                <button onClick={addLigne} style={{
                  background: accentColor, color: '#fff',
                  border: 'none', borderRadius: '8px',
                  padding: '4px 12px', fontSize: '11px',
                  cursor: 'pointer', fontWeight: 600
                }}>+ Ajouter ligne</button>
              </div>

              {form.lignesCommande.map((ligne, idx) => (
                <div key={idx} style={{
                  background: dark ? '#111827' : '#f9fafb',
                  borderRadius: '10px', padding: '12px',
                  marginBottom: '8px', border: `1px solid ${border}`
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 30px', gap: '8px', alignItems: 'center' }}>
                    <select
                      style={{ ...inputStyle, marginBottom: 0 }}
                      value={ligne.product}
                      onChange={e => updateLigne(idx, 'product', e.target.value)}>
                      <option value="">— Produit —</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>{p.nom}</option>
                      ))}
                    </select>
                    <input type="number" min="1"
                      style={{ ...inputStyle, marginBottom: 0 }}
                      placeholder="Qté"
                      value={ligne.quantite}
                      onChange={e => updateLigne(idx, 'quantite', e.target.value)} />
                    <input type="number"
                      style={{ ...inputStyle, marginBottom: 0 }}
                      placeholder="Prix"
                      value={ligne.prixUnitaire}
                      onChange={e => updateLigne(idx, 'prixUnitaire', e.target.value)} />
                    {form.lignesCommande.length > 1 && (
                      <button onClick={() => removeLigne(idx)} style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '6px', color: '#ef4444',
                        cursor: 'pointer', fontSize: '14px',
                        width: '28px', height: '28px'
                      }}>✕</button>
                    )}
                  </div>
                </div>
              ))}

              {/* Total */}
              <div style={{
                textAlign: 'right', fontSize: '14px',
                fontWeight: 700, color: accentColor,
                marginTop: '8px'
              }}>
                Total: {getTotalCommande()} TND
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                border: `1px solid ${border}`, background: 'none',
                color: text, fontSize: '13px', cursor: 'pointer'
              }}>Annuler</button>
              <button onClick={handleSubmit} style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                border: 'none', background: accentColor,
                color: '#fff', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer'
              }}>Créer la commande</button>
            </div>
          </div>
        </div>
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
              Supprimer cette commande ?
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

export default Commandes;