import React, { useState, useRef, useCallback } from 'react';

const FileUpload = ({ 
  fieldConfig, 
  value = [], 
  onChange, 
  disabled = false 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const {
    allowedTypes = ['pdf', 'image', 'document'],
    maxSize = 10485760, // 10MB por defecto
    maxCount = 10,
    categories = ['General']
  } = fieldConfig;

  // Función para validar tipos de archivo
  const isValidFileType = (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const mimeType = file.type;
    
    return allowedTypes.some(type => {
      switch (type) {
        case 'pdf':
          return fileExtension === 'pdf' || mimeType === 'application/pdf';
        case 'image':
          return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension) || 
                 mimeType.startsWith('image/');
        case 'document':
          return ['doc', 'docx', 'txt', 'rtf', 'odt'].includes(fileExtension) ||
                 mimeType.includes('document') || 
                 mimeType.includes('text') ||
                 mimeType.includes('word');
        case 'video':
          return ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'].includes(fileExtension) ||
                 mimeType.startsWith('video/');
        case 'audio':
          return ['mp3', 'wav', 'aac', 'ogg', 'flac'].includes(fileExtension) ||
                 mimeType.startsWith('audio/');
        default:
          return true;
      }
    });
  };

  // Función para obtener el icono según el tipo de archivo
  const getFileIcon = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    const mimeType = file.type;

    if (mimeType.startsWith('image/')) return '🖼️';
    if (extension === 'pdf') return '📄';
    if (['doc', 'docx'].includes(extension)) return '📝';
    if (['xls', 'xlsx'].includes(extension)) return '📊';
    if (['ppt', 'pptx'].includes(extension)) return '📽️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (['txt', 'rtf'].includes(extension)) return '📄';
    if (['zip', 'rar', '7z'].includes(extension)) return '📦';
    
    return '📄';
  };

  // Función para formatear el tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Función para simular la subida de archivos
  const uploadFile = async (file) => {
    // Simular upload con delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Crear URL temporal para el archivo
    const fileUrl = URL.createObjectURL(file);
    
    // Simular respuesta del servidor
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      filename: `${Date.now()}-${file.name}`,
      originalName: file.name,
      type: getFileTypeFromFile(file),
      mimeType: file.type,
      size: file.size,
      url: fileUrl,
      category: categories[0] || 'General',
      uploadedAt: new Date(),
      uploadedBy: {
        id: 'current-user',
        name: 'Usuario Actual',
        email: 'usuario@example.com'
      }
    };
  };

  // Función para obtener el tipo de archivo
  const getFileTypeFromFile = (file) => {
    const mimeType = file.type;
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (mimeType.startsWith('image/')) return 'image';
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) return 'document';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    
    return 'other';
  };

  // Función para manejar archivos seleccionados
  const handleFiles = useCallback(async (files) => {
    const fileArray = Array.from(files);
    
    // Validar número máximo de archivos
    if (value.length + fileArray.length > maxCount) {
      setError(`Solo puedes subir máximo ${maxCount} archivos`);
      return;
    }

    // Validar cada archivo
    for (const file of fileArray) {
      if (file.size > maxSize) {
        setError(`El archivo ${file.name} es demasiado grande. Máximo ${formatFileSize(maxSize)}`);
        return;
      }
      
      if (!isValidFileType(file)) {
        setError(`El archivo ${file.name} no es un tipo válido. Tipos permitidos: ${allowedTypes.join(', ')}`);
        return;
      }
    }

    setError('');
    setUploading(true);

    try {
      // Subir archivos uno por uno
      const uploadedFiles = [];
      for (const file of fileArray) {
        const uploadedFile = await uploadFile(file);
        uploadedFiles.push(uploadedFile);
      }

      // Actualizar la lista de archivos
      const newFiles = [...value, ...uploadedFiles];
      onChange(newFiles);
      
    } catch (error) {
      setError('Error al subir archivos. Por favor intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  }, [value, onChange, maxCount, maxSize, allowedTypes]);

  // Manejadores de eventos de drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  // Manejador para input de archivo
  const handleFileInput = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo otra vez
    e.target.value = '';
  }, [handleFiles]);

  // Función para abrir el selector de archivos
  const openFileSelector = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Función para remover archivo
  const removeFile = (fileId) => {
    const newFiles = value.filter(file => file.id !== fileId);
    onChange(newFiles);
  };

  // Función para cambiar categoría de archivo
  const changeFileCategory = (fileId, newCategory) => {
    const newFiles = value.map(file => 
      file.id === fileId ? { ...file, category: newCategory } : file
    );
    onChange(newFiles);
  };

  // Función para cambiar descripción de archivo
  const changeFileDescription = (fileId, description) => {
    const newFiles = value.map(file => 
      file.id === fileId ? { ...file, description } : file
    );
    onChange(newFiles);
  };

  return (
    <div className="space-y-4">
      {/* Zona de drag and drop */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? 'border-teal-500 bg-teal-50' 
            : disabled 
              ? 'border-gray-200 bg-gray-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.map(type => {
            switch (type) {
              case 'pdf': return '.pdf';
              case 'image': return '.jpg,.jpeg,.png,.gif,.webp';
              case 'document': return '.doc,.docx,.txt,.rtf,.odt';
              case 'video': return '.mp4,.avi,.mov,.wmv,.mkv,.webm';
              case 'audio': return '.mp3,.wav,.aac,.ogg,.flac';
              default: return '';
            }
          }).join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-4">
          <div className="text-4xl text-gray-400">
            {uploading ? '⏳' : '📁'}
          </div>
          
          {uploading ? (
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">Subiendo archivos...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-teal-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                {disabled ? 'Subida de archivos deshabilitada' : 'Arrastra archivos aquí o haz clic para seleccionar'}
              </p>
              <p className="text-sm text-gray-500">
                Tipos permitidos: {allowedTypes.join(', ')} | Máximo {formatFileSize(maxSize)} por archivo
              </p>
              <p className="text-xs text-gray-400">
                {value.length}/{maxCount} archivos
              </p>
            </div>
          )}
          
          {!disabled && !uploading && (
            <button
              type="button"
              onClick={openFileSelector}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Seleccionar Archivos
            </button>
          )}
        </div>
      </div>

      {/* Mostrar errores */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de archivos subidos */}
      {value.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Archivos subidos ({value.length})</h4>
          
          <div className="grid grid-cols-1 gap-3">
            {value.map((file) => (
              <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{getFileIcon(file)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.originalName}
                      </p>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Eliminar archivo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Categoría
                        </label>
                        <select
                          value={file.category}
                          onChange={(e) => changeFileCategory(file.id, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-teal-500 focus:border-teal-500"
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Descripción (opcional)
                        </label>
                        <input
                          type="text"
                          value={file.description || ''}
                          onChange={(e) => changeFileDescription(file.id, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Descripción del archivo"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 