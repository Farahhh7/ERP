import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';

function Navbar() {
  const { accentRgba } = useTheme();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initiale = user.nom ? user.nom.charAt(0).toUpperCase() : 'A';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
        {/* Rôle badge */}
        {user.role && (
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
            {user.role}
          </span>
        )}

        {/* Notification */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
          <span>🔔</span>
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-400 rounded-full" />
        </button>

        {/* Theme switcher */}
        <ThemeSwitcher />

        {/* Avatar + nom */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-sm font-bold border border-white/40">
            {initiale}
          </div>
          <span className="text-xs hidden md:block opacity-80">
            {user.nom || 'Utilisateur'}
          </span>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-red-500/40 px-3 py-1.5 rounded-xl transition-colors border border-white/10"
          title="Se déconnecter"
        >
          <span>🚪</span>
          <span className="hidden md:block">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;