import React, { useState, useRef } from 'react';

const FileUpload = ({ 
  config = {}, 
  onFilesChange = () => {}, 
  value = [], 
  name = 'files' 
}) => {
  const [files, setFiles] = useState(value || []);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Configuración por defecto
  const defaultConfig = {
    allowedTypes: ['pdf', 'image', 'document'],
    maxSize: 10485760, // 10MB
    maxCount: 5,
    categories: ['General', 'Documentos', 'Imágenes', 'Otros']
  };

  const uploadConfig = { ...defaultConfig, ...config };

  // Mapeo de tipos MIME
  const mimeTypeMap = {
    'pdf': ['application/pdf'],
    'image': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    'document': [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ],
    'video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
    'audio': ['audio/mp3', 'audio/wav', 'audio/ogg'],
    'other': ['*/*']
  };

  // Validar tipo de archivo
  const validateFileType = (file) => {
    const allowedMimeTypes = uploadConfig.allowedTypes.flatMap(type => mimeTypeMap[type] || []);
    return allowedMimeTypes.includes('*/*') || allowedMimeTypes.includes(file.type);
  };

  // Obtener tipo de archivo
  const getFileType = (file) => {
    for (const [type, mimeTypes] of Object.entries(mimeTypeMap)) {
      if (mimeTypes.includes(file.type)) {
        return type;
      }
    }
    return 'other';
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Obtener icono según tipo de archivo
  const getFileIcon = (type) => {
    const icons = {
      'pdf': '📄',
      'image': '🖼️',
      'document': '📝',
      'video': '🎥',
      'audio': '🎵',
      'other': '📎'
    };
    return icons[type] || '📎';
  };

  // Procesar archivos
  const processFiles = async (fileList) => {
    const newFiles = [];
    const errors = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Validar tipo
      if (!validateFileType(file)) {
        errors.push(`${file.name}: Tipo de archivo no permitido`);
        continue;
      }

      // Validar tamaño
      if (file.size > uploadConfig.maxSize) {
        errors.push(`${file.name}: Archivo demasiado grande (máximo ${formatFileSize(uploadConfig.maxSize)})`);
        continue;
      }

      // Crear objeto de archivo
      const fileObject = {
        id: Date.now() + i,
        file: file,
        filename: file.name,
        originalName: file.name,
        type: getFileType(file),
        mimeType: file.type,
        size: file.size,
        category: uploadConfig.categories[0] || 'General',
        description: '',
        uploadedAt: new Date(),
        uploadedBy: {
          id: 'current-user',
          name: 'Usuario Actual',
          email: 'usuario@empresa.com'
        }
      };

      newFiles.push(fileObject);
    }

    // Verificar límite de archivos
    if (files.length + newFiles.length > uploadConfig.maxCount) {
      errors.push(`Máximo ${uploadConfig.maxCount} archivos permitidos`);
      return { files: [], errors };
    }

    return { files: newFiles, errors };
  };

  // Manejar drop
  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const { files: newFiles, errors } = await processFiles(droppedFiles);

    if (errors.length > 0) {
      alert('Errores encontrados:\n' + errors.join('\n'));
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
  };

  // Manejar selección de archivos
  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const { files: newFiles, errors } = await processFiles(selectedFiles);

    if (errors.length > 0) {
      alert('Errores encontrados:\n' + errors.join('\n'));
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }

    // Limpiar input
    e.target.value = '';
  };

  // Remover archivo
  const removeFile = (fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  // Actualizar categoría
  const updateCategory = (fileId, category) => {
    const updatedFiles = files.map(f => 
      f.id === fileId ? { ...f, category } : f
    );
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  // Actualizar descripción
  const updateDescription = (fileId, description) => {
    const updatedFiles = files.map(f => 
      f.id === fileId ? { ...f, description } : f
    );
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="space-y-4">
      {/* Área de drop */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-teal-500 bg-teal-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept={uploadConfig.allowedTypes.flatMap(type => mimeTypeMap[type] || []).join(',')}
          onChange={handleFileSelect}
        />
        
        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          <div className="text-lg font-medium text-gray-700">
            {dragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí o haz clic para seleccionar'}
          </div>
          <div className="text-sm text-gray-500">
            Tipos permitidos: {uploadConfig.allowedTypes.join(', ')} | 
            Tamaño máximo: {formatFileSize(uploadConfig.maxSize)} | 
            Límite: {uploadConfig.maxCount} archivos
          </div>
        </div>
      </div>

      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Archivos adjuntos ({files.length}/{uploadConfig.maxCount})</h4>
          
          {files.map((file) => (
            <div key={file.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{getFileIcon(file.type)}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Eliminar archivo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-gray-600">Categoría:</label>
                      <select
                        value={file.category}
                        onChange={(e) => updateCategory(file.id, e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500"
                      >
                        {uploadConfig.categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-gray-600">Descripción:</label>
                      <input
                        type="text"
                        value={file.description}
                        onChange={(e) => updateDescription(file.id, e.target.value)}
                        placeholder="Descripción opcional..."
                        className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      {uploadConfig.categories.length > 1 && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Categorías disponibles:</strong> {uploadConfig.categories.join(', ')}
        </div>
      )}
    </div>
  );
};

export default FileUpload; 