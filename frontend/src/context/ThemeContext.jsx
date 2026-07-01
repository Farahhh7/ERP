import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

const PRESET_COLORS = [
  '#EF4444', '#F59E0B', '#10B981',
  '#06B6D4', '#A855F7', '#EC4899', '#6B7280'
];

export function ThemeProvider({ children }) {
  const [accentColor, setAccentColor] = useState(
    localStorage.getItem('accentColor') || '#3B82F6'
  );
  const [accentOpacity, setAccentOpacity] = useState(
    Number(localStorage.getItem('accentOpacity')) || 90
  );
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const updateAccentColor = (color) => {
    setAccentColor(color);
    localStorage.setItem('accentColor', color);
  };
  const updateOpacity = (val) => {
    setAccentOpacity(val);
    localStorage.setItem('accentOpacity', val);
  };
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      localStorage.setItem('darkMode', !prev);
      return !prev;
    });
  };

  // Convert hex + opacity to rgba
  const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  const accentRgba = hexToRgba(accentColor, accentOpacity);

  return (
    <ThemeContext.Provider value={{
      accentColor, updateAccentColor,
      accentOpacity, updateOpacity,
      darkMode, toggleDarkMode,
      sidebarCollapsed, setSidebarCollapsed,
      accentRgba, PRESET_COLORS
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}