'use client';

import { useState, useRef } from 'react';
import { Upload, User, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null, previewUrl: string | null) => void;
  label?: string;
}

/**
 * Componente de Upload de Imagen - Estilo PulseTec Control
 * - Preview circular
 * - Avatar genérico por defecto (#64748B)
 * - Botón Electric Cyan (#06B6D4)
 */
export function ImageUpload({ value, onChange, label = 'Foto de Perfil' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setPreview(null);
      onChange(null, null);
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setPreview(previewUrl);
      onChange(file, previewUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-dark">
          {label}
        </label>
      )}

      <div className="flex items-center gap-6">
        {/* Preview Circular */}
        <div className="relative">
          <div
            className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-all ${
              isDragging
                ? 'border-primary shadow-lg shadow-primary/20'
                : 'border-gray-200'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {preview ? (
              <Image
                src={preview}
                alt="Preview"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <User className="w-12 h-12 text-gray" />
              </div>
            )}
          </div>

          {/* Botón eliminar */}
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
              title="Eliminar foto"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Botón de Upload */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {preview ? 'Cambiar Foto' : 'Subir Foto'}
          </button>

          <p className="text-xs text-gray">
            JPG, PNG o GIF. Máximo 5MB.
          </p>

          {/* Zona de Drop */}
          <div
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`mt-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
            }`}
          >
            <p className="text-xs text-center text-gray">
              O arrastra una imagen aquí
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


