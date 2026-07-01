import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const demandData = [
  { semaine: 'S1', reelle: 120, predictive: 115 },
  { semaine: 'S2', reelle: 145, predictive: 138 },
  { semaine: 'S3', reelle: 132, predictive: 140 },
  { semaine: 'S4', reelle: 180, predictive: 172 },
  { semaine: 'S5', reelle: 165, predictive: 170 },
  { semaine: 'S6', reelle: 210, predictive: 198 },
  { semaine: 'S7', reelle: 195, predictive: 205 },
  { semaine: 'S8', reelle: 240, predictive: 228 },
];

function StatCard({ icon, label, value, sub, subColor, dark }) {
  return (
    <div style={{
      background: dark ? '#1f2937' : '#fff',
      borderRadius: '14px',
      padding: '18px 20px',
      border: `1px solid ${dark ? '#374151' : '#e5e7eb'}`,
      display: 'flex', flexDirection: 'column', gap: '6px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
    }}>
      <div style={{ fontSize: '22px' }}>{icon}</div>
      <div style={{ fontSize: '11px', color: dark ? '#9ca3af' : '#6b7280' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: dark ? '#f9fafb' : '#111827' }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: subColor || '#6b7280' }}>{sub}</div>}
    </div>
  );
}

function Dashboard() {
  const { darkMode, accentColor } = useTheme();
  const [stats, setStats] = useState({ total: 0, ruptures: 0, commandes: 0, fournisseurs: 0 });
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const prodRes = await fetch('http://localhost:5000/api/products', { headers });
      const products = await prodRes.json();

      const ruptures = products.filter(p => p.quantite <= p.seuilCritique);
      setAlertes(ruptures.slice(0, 5));
      setStats(prev => ({
        ...prev,
        total: products.length,
        ruptures: ruptures.length,
      }));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const text = darkMode ? '#f9fafb' : '#111827';
  const subText = darkMode ? '#9ca3af' : '#6b7280';
  const cardBg = darkMode ? '#1f2937' : '#fff';
  const border = darkMode ? '#374151' : '#e5e7eb';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: text }}>Dashboard 📊</h1>
          <p style={{ fontSize: '12px', color: subText, marginTop: '3px' }}>
            Bienvenue — vue d'ensemble de votre stock en temps réel
          </p>
        </div>
        <button
          onClick={fetchData}
          style={{
            padding: '8px 16px', borderRadius: '10px',
            background: accentColor, color: '#fff',
            border: 'none', fontSize: '12px',
            fontWeight: 600, cursor: 'pointer'
          }}
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div style={{ color: subText, fontSize: '13px' }}>Chargement...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          <StatCard dark={darkMode} icon="📦" label="Produits total"
            value={stats.total} sub="Dans le catalogue" subColor={accentColor} />
          <StatCard dark={darkMode} icon="🚨" label="Ruptures / Alertes"
            value={stats.ruptures}
            sub={stats.ruptures > 0 ? "⚠️ Critique" : "✅ Aucune alerte"}
            subColor={stats.ruptures > 0 ? '#ef4444' : '#10b981'} />
          <StatCard dark={darkMode} icon="🛒" label="Commandes en attente"
            value={stats.commandes || '—'} sub="Bons de commande" subColor="#f59e0b" />
          <StatCard dark={darkMode} icon="🚚" label="Fournisseurs"
            value={stats.fournisseurs || '—'} sub="Actifs" subColor="#6b7280" />
        </div>
      )}

      {/* Graphique + Alertes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px' }}>

        {/* Graphique demande */}
        <div style={{
          background: cardBg, borderRadius: '14px',
          border: `1px solid ${border}`, padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: text }}>
                Demande Réelle vs Prédictive
              </div>
              <div style={{ fontSize: '11px', color: subText, marginTop: '2px' }}>
                8 dernières semaines
              </div>
            </div>
            <div style={{
              background: 'rgba(16,185,129,0.1)', color: '#10b981',
              fontSize: '11px', fontWeight: 600,
              padding: '4px 10px', borderRadius: '20px',
              border: '1px solid rgba(16,185,129,0.2)'
            }}>
              MAPE: 11.3% ✓
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={demandData}>
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
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f3f4f6'} />
              <XAxis dataKey="semaine" tick={{ fontSize: 11, fill: subText }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: subText }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: darkMode ? '#1f2937' : '#fff',
                  border: `1px solid ${border}`,
                  borderRadius: '10px', fontSize: '12px',
                  color: text
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="reelle" name="Réelle"
                stroke={accentColor} strokeWidth={2} fill="url(#gReelle)" />
              <Area type="monotone" dataKey="predictive" name="Prédictive"
                stroke="#10b981" strokeWidth={2} strokeDasharray="5 3" fill="url(#gPred)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Alertes ruptures */}
        <div style={{
          background: cardBg, borderRadius: '14px',
          border: `1px solid ${border}`, padding: '20px',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: text, marginBottom: '4px' }}>
            🚨 Alertes Critiques
          </div>
          <div style={{ fontSize: '11px', color: subText, marginBottom: '14px' }}>
            Produits sous le seuil critique
          </div>

          {alertes.length === 0 ? (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#10b981', fontSize: '13px'
            }}>
              ✅ Aucune rupture détectée
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alertes.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: darkMode ? '#111827' : '#fef2f2',
                  borderRadius: '10px', padding: '10px 12px',
                  border: '1px solid rgba(239,68,68,0.2)'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: text }}>{p.nom}</div>
                    <div style={{ fontSize: '10px', color: subText }}>{p.sku}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>
                      {p.quantite} / {p.seuilCritique}
                    </div>
                    <div style={{
                      fontSize: '10px', color: '#ef4444',
                      background: 'rgba(239,68,68,0.1)',
                      padding: '2px 8px', borderRadius: '20px', marginTop: '2px'
                    }}>
                      Rupture J+{Math.ceil((p.seuilCritique - p.quantite) / 2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button style={{
            marginTop: 'auto', paddingTop: '14px',
            background: 'none', border: 'none',
            color: accentColor, fontSize: '12px',
            cursor: 'pointer', fontWeight: 600
          }}>
            Voir toutes les alertes →
          </button>
        </div>
      </div>

      {/* Mini stats bar */}
      <div style={{
        background: cardBg, borderRadius: '14px',
        border: `1px solid ${border}`, padding: '16px 20px',
        display: 'flex', gap: '32px', alignItems: 'center'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: text }}>📈 Tendances du mois</div>
        {[
          { label: 'Entrées stock', value: '+284', color: '#10b981' },
          { label: 'Sorties stock', value: '-196', color: '#ef4444' },
          { label: 'Valeur totale', value: '124K TND', color: accentColor },
          { label: 'Précision IA', value: '88.7%', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ fontSize: '10px', color: subText }}>{s.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Dashboard;