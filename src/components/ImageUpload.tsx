import React, { useState, useRef } from 'react';

interface ImageUploadProps {
  onImageSelect: (imageData: string) => void;
  currentImage?: string;
  onImageRemove?: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageSelect, 
  currentImage, 
  onImageRemove 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. El tamaño máximo es 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageSelect(result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF, etc.)');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-container">
      {currentImage ? (
        <div className="current-image-container">
          <img src={currentImage} alt="Card attachment" className="current-image" />
          <div className="image-actions">
            <button 
              type="button"
              className="change-image-btn" 
              onClick={handleClick}
            >
              Cambiar imagen
            </button>
            {onImageRemove && (
              <button 
                type="button"
                className="remove-image-btn" 
                onClick={onImageRemove}
              >
                Eliminar imagen
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`image-upload-zone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="upload-content">
            <div className="upload-icon">📷</div>
            <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
            <p className="upload-hint">JPG, PNG, GIF - Máximo 5MB</p>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ImageUpload;