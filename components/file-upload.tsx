'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUploaded: (url: string) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  onFileUploaded,
  acceptedTypes = '*/*',
  maxSizeMB = 10,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validar tamaño
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB`);
      return;
    }

    setSelectedFile(file);
    setUploadComplete(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Simular upload (en producción, aquí irías a tu API de almacenamiento)
      // Por ahora, creamos una URL temporal
      const fileUrl = URL.createObjectURL(selectedFile);
      
      // Simulamos delay de upload
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      onFileUploaded(fileUrl);
      setUploadComplete(true);
      
      alert('✅ Archivo cargado exitosamente! (URL temporal para demo)');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al cargar el archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setUploadComplete(false);
  };

  return (
    <div className="space-y-4">
      {/* Zona de Drag & Drop */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/5 scale-105'
            : 'border-gray/30 hover:border-primary/50 hover:bg-light'
        )}
      >
        <input
          type="file"
          accept={acceptedTypes}
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading || uploadComplete}
        />

        <div className="flex flex-col items-center gap-3 text-center pointer-events-none">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
            isDragging ? 'bg-primary' : 'bg-primary/10'
          )}>
            <Upload className={cn(
              'w-8 h-8',
              isDragging ? 'text-white' : 'text-primary'
            )} />
          </div>

          <div>
            <p className="font-medium text-dark mb-1">
              {isDragging
                ? '¡Suelta el archivo aquí!'
                : 'Arrastra un archivo o haz click para seleccionar'}
            </p>
            <p className="text-sm text-gray">
              Máximo {maxSizeMB}MB
            </p>
          </div>
        </div>
      </div>

      {/* Archivo Seleccionado */}
      {selectedFile && (
        <div className="card bg-light border-2 border-primary/20">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                {uploadComplete ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <FileText className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-dark truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {uploadComplete && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    ✓ Archivo cargado
                  </p>
                )}
              </div>
            </div>
            
            {!uploading && !uploadComplete && (
              <button
                onClick={handleRemove}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="Quitar archivo"
              >
                <X className="w-5 h-5 text-red-500" />
              </button>
            )}
          </div>

          {!uploadComplete && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className={cn(
                'w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-white transition-all',
                uploading
                  ? 'bg-gray cursor-not-allowed'
                  : 'bg-primary hover:bg-dark'
              )}
            >
              <Upload className="w-5 h-5" />
              {uploading ? 'Subiendo...' : 'Subir Archivo'}
            </button>
          )}
        </div>
      )}

      {/* Nota informativa */}
      <div className="text-xs text-gray">
        <p>
          💡 <strong>Nota:</strong> También puedes pegar un enlace directo de Google Drive, Dropbox
          u otro servicio en el campo de arriba en lugar de subir un archivo.
        </p>
      </div>
    </div>
  );
}


