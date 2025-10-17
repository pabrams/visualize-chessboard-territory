import React from 'react';
import { ThemeColors } from '../../hooks/useTheme';

interface SettingsPanelProps {
  theme: 'dark' | 'light';
  currentThemeColors: ThemeColors;
  setLightThemeColors: (colors: ThemeColors) => void;
  setDarkThemeColors: (colors: ThemeColors) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  theme,
  currentThemeColors,
  setLightThemeColors,
  setDarkThemeColors,
  onClose,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '60px',
        right: '20px',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: theme === 'dark' 
          ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
          : '0 4px 12px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        minWidth: '300px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: theme === 'dark' ? '#ffffff' : '#000000' }}>
          {theme.charAt(0).toUpperCase() + theme.slice(1)} Theme Settings
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close settings"
        >
          ×
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {Object.entries(currentThemeColors).map(([key, value]) => {
          const configName = key.replace('Color', '-color').replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ color: theme === 'dark' ? '#ffffff' : '#000000', flex: 1 }}>
                {configName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </label>
              <input
                type="color"
                value={value}
                onChange={(e) => {
                  const newColors = { ...currentThemeColors, [key]: e.target.value };
                  if (theme === 'dark') {
                    setDarkThemeColors(newColors);
                  } else {
                    setLightThemeColors(newColors);
                  }
                }}
                data-testid={`${theme}-theme-${configName}`}
                style={{ marginLeft: '10px' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
