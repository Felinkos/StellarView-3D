import React, { useRef, useState } from 'react';

export default function ModelLoader({ onModelLoad }) {
  const inputFile = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setIsLoading(true);
    setUploadError(null); 

    const dataToSend = new FormData();
    dataToSend.append('file', selectedFile);

    try {
      console.log('Начинаю отправку файла:', selectedFile.name); // для отладки

      const res = await fetch('http://localhost:8000/upload-model', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: dataToSend
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Сервер ответил ${res.status}: ${errorText}`);
      }

      const result = await res.json();
      
      if (result.url) {
        onModelLoad(result.url);
      } else {
        throw new Error('В ответе нет поля url');
      }

    } catch (err) {
      console.error('Проблема при загрузке модели:', err);
      setUploadError(err.message || 'Что-то пошло не так...');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ margin: '0 0 24px 0' }}>
      <input
        type="file"
        accept=".gltf,.glb,.obj,.fbx"
        ref={inputFile}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <button
        type="button"
        onClick={() => inputFile.current?.click()}
        disabled={isLoading}
        style={{
          padding: '14px 28px',
          backgroundColor: isLoading ? '#6b7280' : '#1d4ed8',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '1.05rem',
          width: '100%',
          transition: 'background-color 0.25s ease',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}
      >
        {isLoading ? 'Идёт загрузка...' : 'Выбрать и загрузить модель'}
      </button>

      {uploadError && (
        <div style={{
          marginTop: '14px',
          color: '#ef4444',
          fontSize: '0.92rem',
          padding: '8px 12px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '6px'
        }}>
          ⚠️ {uploadError}
        </div>
      )}

      {/* мп  */}
      {!isLoading && !uploadError && (
        <p style={{
          marginTop: '10px',
          fontSize: '0.85rem',
          color: '#9ca3af',
          textAlign: 'center'
        }}>
          Поддерживаются: .glb .gltf .obj .fbx
        </p>
      )}
    </div>
  );
}