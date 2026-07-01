import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/stock', label: 'Produits', icon: '📦' },
  { path: '/stocks', label: 'Stocks', icon: '🏭' },
  { path: '/fournisseurs', label: 'Fournisseurs', icon: '🚚' },
  { path: '/previsions', label: 'Prévisions', icon: '📈' },
  { path: '/commandes', label: 'Commandes', icon: '🛒' },
];

function Sidebar() {
  const { accentRgba, sidebarCollapsed, setSidebarCollapsed } = useTheme();
  const location = useLocation();

  return (
    <aside
      style={{ backgroundColor: accentRgba }}
      className={`h-screen text-white flex flex-col transition-all duration-300 flex-shrink-0 ${
        sidebarCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Header sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!sidebarCollapsed && (
          <span className="font-bold text-sm tracking-wide">PSM</span>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-white/80 hover:text-white text-lg p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          ☰
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-hidden">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl transition-all duration-200 mb-1 ${
                isActive
                  ? 'bg-white/25 font-semibold'
                  : 'hover:bg-white/15'
              }`}
              title={sidebarCollapsed ? item.label : ''}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="text-sm truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;