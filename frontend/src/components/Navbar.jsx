import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';
import { useNotifications } from '../hooks/useNotifications';
import InstallPWA from './InstallPWA';

function Navbar() {
  const { accentRgba } = useTheme();
  const navigate = useNavigate();
  const { alerts, unreadCount } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);

  const user = JSON.parse(
    localStorage.getItem('user') ||
    sessionStorage.getItem('user') ||
    '{}'
  );
  const initiale = user.nom ? user.nom.charAt(0).toUpperCase() : 'A';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header
      style={{ backgroundColor: accentRgba }}
      className="h-14 flex items-center justify-between px-4 text-white shadow-md flex-shrink-0"
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold truncate">
          ERP Predictive Stock Manager (PSM)
        </span>
      </div>

      <div className="flex items-center gap-3">
        {user.role && (
          <span style={{
            fontSize: '11px', background: 'rgba(255,255,255,0.2)',
            padding: '3px 10px', borderRadius: '20px'
          }}>
            {user.role}
          </span>
        )}

        {/* 🔔 Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{
              position: 'relative', width: '34px', height: '34px',
              borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '16px', color: '#fff'
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-2px', right: '-2px',
                background: '#ef4444', color: '#fff',
                borderRadius: '50%', width: '18px', height: '18px',
                fontSize: '10px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.3)'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowNotifs(false)} />
              <div style={{
                position: 'absolute', right: 0, top: '42px',
                width: '320px', zIndex: 50, background: '#1f2937',
                borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden'
              }}>
                <div style={{
                  padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ color: '#f9fafb', fontSize: '13px', fontWeight: 600 }}>🔔 Alertes Stock</span>
                  <span style={{
                    background: unreadCount > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                    color: unreadCount > 0 ? '#ef4444' : '#10b981',
                    fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px'
                  }}>
                    {unreadCount > 0 ? `${unreadCount} alerte${unreadCount > 1 ? 's' : ''}` : 'Tout OK ✅'}
                  </span>
                </div>

                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {alerts.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
                      Aucune rupture détectée
                    </div>
                  ) : (
                    alerts.map((p, i) => (
                      <div key={p._id}
                        onClick={() => { navigate('/stock'); setShowNotifs(false); }}
                        style={{
                          padding: '12px 16px',
                          borderBottom: i < alerts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                          display: 'flex', alignItems: 'center', gap: '12px',
                          cursor: 'pointer', transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                          background: p.quantite <= 0 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
                        }}>
                          {p.quantite <= 0 ? '🚨' : '⚠️'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            color: '#f9fafb', fontSize: '12px', fontWeight: 600, marginBottom: '2px',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                          }}>{p.nom}</div>
                          <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                            {p.sku} — Stock: {p.quantite} / Seuil: {p.seuilCritique}
                          </div>
                        </div>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '3px 8px',
                          borderRadius: '20px', flexShrink: 0,
                          background: p.quantite <= 0 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                          color: p.quantite <= 0 ? '#ef4444' : '#f59e0b'
                        }}>
                          {p.quantite <= 0 ? 'Rupture' : 'Critique'}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {alerts.length > 0 && (
                  <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                    <button
                      onClick={() => { navigate('/stock'); setShowNotifs(false); }}
                      style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Voir tous les produits →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 📲 Install PWA */}
        <InstallPWA />

        {/* Theme switcher */}
        <ThemeSwitcher />

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700,
            border: '1.5px solid rgba(255,255,255,0.4)'
          }}>{initiale}</div>
          <span style={{ fontSize: '12px', opacity: 0.85 }}>
            {user.nom || 'Utilisateur'}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '10px', padding: '6px 12px',
            color: '#fff', cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.4)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;