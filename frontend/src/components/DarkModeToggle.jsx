import { useTheme } from '../context/ThemeContext';

function DarkModeToggle() {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 justify-end' : 'bg-gray-300 justify-start'
      }`}
      title="Mode sombre"
    >
      <span className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-xs">
        {darkMode ? '🌙' : '☀️'}
      </span>
    </button>
  );
}

export default DarkModeToggle;