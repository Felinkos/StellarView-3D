import React from 'react';

export default function SceneControls({ bgColor, setBgColor, lightIntensity, setLightIntensity }) {
  return (
    <div style={{ marginTop: '20px' }}>
      <h4 style={{ marginBottom: '12px' }}>Настройки сцены</h4>

      <label style={{ display: 'block', margin: '12px 0' }}>
        Цвет фона:
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          style={{ width: '100%', height: '40px', marginTop: '8px' }}
        />
      </label>

      <label style={{ display: 'block', margin: '12px 0' }}>
        Яркость света: {lightIntensity}
        <input
          type="range"
          min="0"
          max="3"
          step="0.1"
          value={lightIntensity}
          onChange={(e) => setLightIntensity(Number(e.target.value))}
          style={{ width: '100%', marginTop: '8px' }}
        />
      </label>
    </div>
  );
}