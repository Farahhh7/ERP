import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

function ThemeSwitcher() {
  const {
    accentColor, updateAccentColor,
    accentOpacity, updateOpacity,
    darkMode, toggleDarkMode,
    PRESET_COLORS, accentRgba
  } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bouton cercle couleur */}
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full border-2 border-white/40 shadow-lg transition-transform hover:scale-110"
        style={{ backgroundColor: accentColor }}
        title="Thème & Mode Sombre"
      />

      {open && (
        <>
          {/* Overlay bech tsaker ki teghza barra */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-3 w-72 rounded-2xl shadow-2xl z-50 p-5 border border-white/10"
            style={{ backgroundColor: '#1e1e2e' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold text-sm">Thème & Mode Sombre</h3>
              <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white text-lg">✕</button>
            </div>

            {/* Palette couleurs presets */}
            <p className="text-white/60 text-xs mb-2">Palette Bar:</p>
            <div className="flex gap-2 mb-4 flex-wrap">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => updateAccentColor(color)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: accentColor === color ? 'white' : 'transparent'
                  }}
                />
              ))}
              {/* Custom color picker */}
              <label className="w-7 h-7 rounded-full border-2 border-white/30 flex items-center justify-center cursor-pointer overflow-hidden" title="Couleur personnalisée">
                <span className="text-white text-xs">+</span>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => updateAccentColor(e.target.value)}
                  className="opacity-0 absolute w-0 h-0"
                />
              </label>
            </div>

            {/* Couleur accent preview */}
            <p className="text-white/60 text-xs mb-2">Couleur des Accents:</p>
            <label className="w-full h-9 rounded-lg border border-white/20 block cursor-pointer mb-4 overflow-hidden">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => updateAccentColor(e.target.value)}
                className="w-full h-full cursor-pointer"
              />
            </label>

            {/* Opacity slider */}
            <div className="flex items-center justify-between mb-1">
              <p className="text-white/60 text-xs">Opacité Bar:</p>
              <span className="text-white text-xs font-bold">{accentOpacity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={accentOpacity}
              onChange={(e) => updateOpacity(Number(e.target.value))}
              className="w-full cursor-pointer mb-4"
              style={{ accentColor }}
            />

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-full py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border border-white/20"
              style={{
                backgroundColor: darkMode ? '#f1f5f9' : '#1e293b',
                color: darkMode ? '#1e293b' : '#f1f5f9'
              }}
            >
              {darkMode ? '☀️ Mode Clair' : '🌙 Mode Sombre'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ThemeSwitcher;