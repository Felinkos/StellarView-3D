import React, { useState } from 'react';

export default function ModelLoader({ onModelLoad }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Когда пользователь выбирает файл
  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    console.log("Отправка файла:", selectedFile.name);

    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      console.log("Токен из localStorage:", token ? "есть" : "отсутствует");

      const response = await fetch('http://localhost:8000/upload-model', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`   // ← Главное исправление
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Сервер ответил ошибкой:", result);
        throw new Error(result.detail || "Не удалось загрузить модель");
      }

      console.log("Модель успешно загружена, URL:", result.url);

      // Передаём URL модели наверх (в EditorPage)
      if (onModelLoad) {
        onModelLoad(result.url);
      }

    } catch (err) {
      console.error("Проблема при загрузке модели:", err);
      setUploadError(err.message || "Что-то пошло не так при загрузке");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".glb,.gltf,.obj,.fbx"
        onChange={handleFileSelect}
        disabled={isUploading}
        style={{ display: 'none' }}
        id="model-upload"
      />

      <label
        htmlFor="model-upload"
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: isUploading ? '#4b5563' : '#1e40af',
          color: 'white',
          borderRadius: '8px',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: '500'
        }}
      >
        {isUploading ? 'Загрузка...' : 'Загрузить модель (glTF, OBJ, FBX)'}
      </label>

      {uploadError && (
        <p style={{ color: '#ff6b6b', marginTop: '10px', fontSize: '0.95rem' }}>
          {uploadError}
        </p>
      )}
    </div>
  );
}