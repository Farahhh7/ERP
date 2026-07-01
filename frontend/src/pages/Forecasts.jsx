import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const API_FORECASTS = 'http://localhost:5000/api/forecasts';
const API_PRODUCTS = 'http://localhost:5000/api/products';

function Forecasts() {
  const { darkMode, accentColor } = useTheme();
  const [forecasts, setForecasts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [chartData, setChartData] = useState([]);
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

  const fetchForecasts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_FORECASTS, { headers });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setForecasts(list);
      if (!selectedProduct && list.length > 0) {
        setSelectedProduct(list[0].productId);
      }
    } catch { showToast('Erreur chargement des prévisions', 'error'); }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_PRODUCTS, { headers });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { /* silencieux */ }
  };

  useEffect(() => { fetchForecasts(); fetchProducts(); }, []);

  useEffect(() => {
    const f = forecasts.find(f => f.productId === selectedProduct);
    if (f && Array.isArray(f.historique)) {
      setChartData(f.historique);
    } else {
      setChartData([]);
    }
  }, [selectedProduct, forecasts]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_FORECASTS}/generate`, {
        method: 'POST', headers
      });
      if (res.ok) {
        showToast('Prévisions recalculées ✅');
        fetchForecasts();
      } else {
        const d = await res.json();
        showToast(d.message || 'Erreur génération', 'error');
      }
    } catch { showToast('Erreur serveur (microservice IA indisponible)', 'error'); }
    setGenerating(false);
  };

  const filtered = forecasts.filter(f =>
    f.productNom?.toLowerCase().includes(search.toLowerCase()) ||
    f.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const getMapeBadge = (mape) => {
    if (mape == null) return { label: '—', bg: 'rgba(107,114,128,0.1)', color: '#6b7280', border: 'rgba(107,114,128,0.2)' };
    if (mape < 10) return { label: `${mape}% Excellent`, bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.2)' };
    if (mape <= 15) return { label: `${mape}% Bon`, bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.2)' };
    if (mape <= 25) return { label: `${mape}% Moyen`, bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' };
    return { label: `${mape}% Faible`, bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.2)' };
  };

  const avgMape = forecasts.length > 0
    ? (forecasts.reduce((s, f) => s + (f.mape || 0), 0) / forecasts.length).toFixed(1)
    : null;

  const selectedForecast = forecasts.find(f => f.productId === selectedProduct);

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
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .row-hover:hover { background: ${dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} !important; }
        .spinning { animation: spin 1s linear infinite; display: inline-block; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: text }}>Prévisions IA 🔮</h1>
          <p style={{ fontSize: '12px', color: subText, marginTop: '3px' }}>
            {forecasts.length} produit{forecasts.length > 1 ? 's' : ''} avec prévision
            {avgMape !== null ? ` · MAPE moyen ${avgMape}%` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchForecasts} style={{
            padding: '9px 16px', borderRadius: '10px',
            border: `1px solid ${border}`, background: cardBg,
            color: text, fontSize: '12px', cursor: 'pointer'
          }}>🔄 Actualiser</button>
          <button onClick={handleGenerate} disabled={generating} style={{
            padding: '9px 18px', borderRadius: '10px',
            border: 'none', background: accentColor,
            color: '#fff', fontSize: '13px',
            fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer',
            opacity: generating ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <span className={generating ? 'spinning' : ''}>⚡</span>
            {generating ? 'Calcul en cours...' : 'Générer les prévisions'}
          </button>
        </div>
      </div>

      {/* Graphique demande réelle vs prédictive */}
      <div style={{
        background: cardBg, borderRadius: '14px',
        border: `1px solid ${border}`, padding: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: text }}>Demande Réelle vs Prédictive</h3>
            <p style={{ fontSize: '11px', color: subText, marginTop: '2px' }}>Historique et projection par produit</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              style={{
                padding: '8px 12px',
                background: dark ? '#111827' : '#f9fafb',
                border: `1px solid ${border}`, borderRadius: '10px',
                color: text, fontSize: '12px', outline: 'none'
              }}
            >
              {forecasts.length === 0 && <option value="">Aucune prévision</option>}
              {forecasts.map(f => (
                <option key={f.productId} value={f.productId}>{f.sku} — {f.productNom}</option>
              ))}
            </select>
            {selectedForecast?.mape != null && (
              <span style={{
                fontSize: '11px', fontWeight: 700,
                padding: '5px 12px', borderRadius: '20px',
                ...(() => { const b = getMapeBadge(selectedForecast.mape); return { background: b.bg, color: b.color, border: `1px solid ${b.border}` }; })()
              }}>
                MAPE: {selectedForecast.mape}%
              </span>
            )}
          </div>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          {chartData.length === 0 ? (
            <div style={{
              height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: subText, fontSize: '13px'
            }}>
              {loading ? 'Chargement...' : 'Aucune donnée de prévision disponible pour ce produit.'}
            </div>
          ) : (
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={border} />
                <XAxis dataKey="periode" stroke={subText} fontSize={11} />
                <YAxis stroke={subText} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: cardBg, border: `1px solid ${border}`,
                    borderRadius: '10px', fontSize: '12px', color: text
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="reel" name="Demande réelle" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="predictif" name="Prédictive" stroke={accentColor} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recherche */}
      <div style={{
        background: cardBg, borderRadius: '14px',
        border: `1px solid ${border}`, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <input
          placeholder="🔍  Rechercher par nom ou SKU..."
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
            { label: 'Produits', val: forecasts.length, color: accentColor },
            { label: 'MAPE moyen', val: avgMape !== null ? `${avgMape}%` : '—', color: avgMape !== null && avgMape < 15 ? '#10b981' : '#f59e0b' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '10px', color: subText }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau des prévisions */}
      <div style={{
        background: cardBg, borderRadius: '14px',
        border: `1px solid ${border}`, overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr 1fr',
          padding: '12px 20px',
          background: tableBg,
          borderBottom: `1px solid ${border}`,
          fontSize: '11px', color: subText, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          <span>Produit / SKU</span>
          <span>J+7</span>
          <span>J+30</span>
          <span>J+90</span>
          <span>MAPE</span>
          <span>Calculé le</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: subText, fontSize: '13px' }}>
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: subText, fontSize: '13px' }}>
            {search ? 'Aucun résultat trouvé' : 'Aucune prévision — cliquez sur "Générer les prévisions" !'}
          </div>
        ) : (
          filtered.map((f, i) => {
            const badge = getMapeBadge(f.mape);
            return (
              <div key={f._id || f.productId} className="row-hover"
                onClick={() => setSelectedProduct(f.productId)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr 1fr',
                  padding: '13px 20px',
                  borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : 'none',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  background: f.productId === selectedProduct
                    ? (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)')
                    : 'transparent'
                }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: text }}>{f.productNom}</div>
                  <div style={{ fontSize: '10px', color: subText, marginTop: '2px' }}>{f.sku}</div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: text }}>
                  {f.j7 != null ? f.j7 : '—'} <span style={{ fontSize: '10px', color: subText }}>u.</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: text }}>
                  {f.j30 != null ? f.j30 : '—'} <span style={{ fontSize: '10px', color: subText }}>u.</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: text }}>
                  {f.j90 != null ? f.j90 : '—'} <span style={{ fontSize: '10px', color: subText }}>u.</span>
                </div>
                <div>
                  <span style={{
                    fontSize: '10px', fontWeight: 600,
                    padding: '4px 10px', borderRadius: '20px',
                    background: badge.bg, color: badge.color,
                    border: `1px solid ${badge.border}`,
                    whiteSpace: 'nowrap'
                  }}>{badge.label}</span>
                </div>
                <div style={{ fontSize: '12px', color: subText }}>
                  {f.dateCalcul ? new Date(f.dateCalcul).toLocaleDateString('fr-FR') : '—'}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Forecasts;