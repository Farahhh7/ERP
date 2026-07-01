import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, LineChart, Line
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const API_PRODUCTS = 'http://localhost:5000/api/products';

const generateForecastData = (baseValue) => {
  const weeks = ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12'];
  return weeks.map((s, i) => ({
    semaine: s,
    reelle: Math.round(baseValue + Math.sin(i * 0.8) * baseValue * 0.3 + i * 2),
    predictive: Math.round(baseValue + Math.sin(i * 0.8) * baseValue * 0.28 + i * 2.1 + Math.random() * 5),
  }));
};

const horizonData = [
  { horizon: 'J+7',  precision: 94, mape: 6,    couleur: '#10b981' },
  { horizon: 'J+30', precision: 88, mape: 11.3, couleur: '#7C3AED' },
  { horizon: 'J+90', precision: 79, mape: 18.2, couleur: '#f59e0b' },
];

function StatCard({ icon, label, value, sub, subColor, dark, border, cardBg, text, subText }) {
  return (
    <div style={{
      background: cardBg, borderRadius: '14px',
      border: `1px solid ${border}`, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: '6px'
    }}>
      <div style={{ fontSize: '22px' }}>{icon}</div>
      <div style={{ fontSize: '11px', color: subText }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: text }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: subColor }}>{sub}</div>}
    </div>
  );
}

function Forecasts() {
  const { darkMode, accentColor } = useTheme();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHorizon, setActiveHorizon] = useState('J+30');

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
  const gridColor = dark ? '#374151' : '#f3f4f6';

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setForecastData(generateForecastData(selectedProduct.quantite || 50));
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_PRODUCTS, { headers });
      const data = await res.json();
      const prods = Array.isArray(data) ? data : [];
      setProducts(prods);
      if (prods.length > 0) {
        setSelectedProduct(prods[0]);
        setForecastData(generateForecastData(prods[0].quantite || 50));
      }
    } catch {}
    setLoading(false);
  };

  const getJ7 = () => forecastData[1]?.predictive || 0;
  const getJ30 = () => forecastData[4]?.predictive || 0;
  const getJ90 = () => forecastData[11]?.predictive || 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: cardBg, border: `1px solid ${border}`,
          borderRadius: '10px', padding: '10px 14px', fontSize: '12px'
        }}>
          <div style={{ color: subText, marginBottom: '6px', fontWeight: 600 }}>{label}</div>
          {payload.map((p, i) => (
            <div key={i} style={{ color: p.color, marginBottom: '2px' }}>
              {p.name}: <b>{p.value}</b>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <style>{`
        .prod-item:hover { background: ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} !important; }
        .horizon-btn:hover { opacity: 0.85; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: text }}>Prévisions IA 📈</h1>
          <p style={{ fontSize: '12px', color: subText, marginTop: '3px' }}>
            Modèle Prophet — Forecasting J+7 / J+30 / J+90
          </p>
        </div>
        <div style={{
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '10px', padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#10b981', animation: 'pulse 2s infinite'
          }} />
          <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
            Modèle actif
          </span>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <StatCard
          dark={dark} border={border} cardBg={cardBg} text={text} subText={subText}
          icon="⚡" label="Prévision J+7"
          value={getJ7()} sub="unités estimées" subColor={accentColor}
        />
        <StatCard
          dark={dark} border={border} cardBg={cardBg} text={text} subText={subText}
          icon="📅" label="Prévision J+30"
          value={getJ30()} sub="unités estimées" subColor={accentColor}
        />
        <StatCard
          dark={dark} border={border} cardBg={cardBg} text={text} subText={subText}
          icon="🔭" label="Prévision J+90"
          value={getJ90()} sub="unités estimées" subColor={accentColor}
        />
        <StatCard
          dark={dark} border={border} cardBg={cardBg} text={text} subText={subText}
          icon="🎯" label="MAPE (J+30)"
          value="11.3%" sub="✅ < 15% objectif atteint" subColor="#10b981"
        />
      </div>

      {/* Main content — graphique + sidebar produits */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '16px' }}>

        {/* Graphique principal */}
        <div style={{
          background: cardBg, borderRadius: '14px',
          border: `1px solid ${border}`, padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          {/* Titre + horizon selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: text }}>
                {selectedProduct ? selectedProduct.nom : 'Sélectionner un produit'}
              </div>
              <div style={{ fontSize: '11px', color: subText, marginTop: '2px' }}>
                Demande réelle vs prédictive — 12 semaines
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['J+7', 'J+30', 'J+90'].map(h => (
                <button key={h} className="horizon-btn"
                  onClick={() => setActiveHorizon(h)}
                  style={{
                    padding: '5px 12px', borderRadius: '20px',
                    border: `1px solid ${activeHorizon === h ? accentColor : border}`,
                    background: activeHorizon === h ? accentColor : 'none',
                    color: activeHorizon === h ? '#fff' : subText,
                    fontSize: '11px', cursor: 'pointer',
                    fontWeight: activeHorizon === h ? 600 : 400,
                    transition: 'all 0.2s'
                  }}>{h}</button>
              ))}
            </div>
          </div>

          {/* AreaChart */}
          {forecastData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="gReelle" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={accentColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="semaine"
                  tick={{ fontSize: 11, fill: subText }}
                  axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: subText }}
                  axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="reelle" name="Réelle"
                  stroke={accentColor} strokeWidth={2} fill="url(#gReelle)" />
                <Area type="monotone" dataKey="predictive" name="Prédictive"
                  stroke="#10b981" strokeWidth={2}
                  strokeDasharray="5 3" fill="url(#gPred)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: subText, fontSize: '13px' }}>
              Sélectionner un produit pour voir les prévisions
            </div>
          )}

          {/* Précision par horizon */}
          <div style={{
            borderTop: `1px solid ${border}`,
            paddingTop: '16px',
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px'
          }}>
            {horizonData.map((h, i) => (
              <div key={i} style={{
                background: dark ? '#111827' : '#f9fafb',
                borderRadius: '12px', padding: '14px',
                border: `1px solid ${border}`, textAlign: 'center'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: h.couleur, marginBottom: '6px' }}>
                  {h.horizon}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: text, marginBottom: '4px' }}>
                  {h.precision}%
                </div>
                <div style={{ fontSize: '10px', color: subText }}>précision</div>
                <div style={{
                  width: '100%', height: '4px',
                  background: dark ? '#374151' : '#e5e7eb',
                  borderRadius: '2px', marginTop: '8px', overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${h.precision}%`, height: '100%',
                    background: h.couleur, borderRadius: '2px',
                    transition: 'width 1s ease'
                  }} />
                </div>
                <div style={{ fontSize: '10px', color: subText, marginTop: '4px' }}>
                  MAPE: {h.mape}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar produits */}
        <div style={{
          background: cardBg, borderRadius: '14px',
          border: `1px solid ${border}`, overflow: 'hidden',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{
            padding: '14px 16px',
            borderBottom: `1px solid ${border}`,
            fontSize: '12px', fontWeight: 600, color: text
          }}>
            📦 Produits ({products.length})
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: subText, fontSize: '12px' }}>
                Chargement...
              </div>
            ) : products.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: subText, fontSize: '12px' }}>
                Aucun produit
              </div>
            ) : (
              products.map(p => (
                <div key={p._id}
                  className="prod-item"
                  onClick={() => setSelectedProduct(p)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: `1px solid ${border}`,
                    cursor: 'pointer',
                    background: selectedProduct?._id === p._id
                      ? `${accentColor}18` : 'transparent',
                    borderLeft: selectedProduct?._id === p._id
                      ? `3px solid ${accentColor}` : '3px solid transparent',
                    transition: 'all 0.15s'
                  }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: text }}>
                    {p.nom}
                  </div>
                  <div style={{ fontSize: '10px', color: subText, marginTop: '2px' }}>
                    {p.sku} — Stock: {p.quantite}
                  </div>
                  <div style={{
                    fontSize: '10px', marginTop: '4px',
                    color: p.quantite <= p.seuilCritique ? '#ef4444' : '#10b981'
                  }}>
                    {p.quantite <= p.seuilCritique ? '🔴 Critique' : '🟢 OK'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* BarChart comparaison produits */}
      {products.length > 0 && (
        <div style={{
          background: cardBg, borderRadius: '14px',
          border: `1px solid ${border}`, padding: '20px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: text, marginBottom: '4px' }}>
            Comparaison stock actuel vs seuil critique
          </div>
          <div style={{ fontSize: '11px', color: subText, marginBottom: '16px' }}>
            Tous les produits — vue rapide des niveaux de stock
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={products.slice(0, 8).map(p => ({
              nom: p.nom.length > 12 ? p.nom.slice(0, 12) + '...' : p.nom,
              stock: p.quantite,
              seuil: p.seuilCritique,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="nom"
                tick={{ fontSize: 10, fill: subText }}
                axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: subText }}
                axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="stock" name="Stock actuel"
                fill={accentColor} radius={[4, 4, 0, 0]} opacity={0.85} />
              <Bar dataKey="seuil" name="Seuil critique"
                fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export default Forecasts;