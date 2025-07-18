import React, { useState, useEffect } from 'react';

const DynamicDocumentForm = ({ 
  documentType, 
  orderId, 
  onSubmit, 
  onCancel, 
  initialData = null,
  isEditing = false 
}) => {
  // Early return if essential props are missing (for SSR safety)
  if (!documentType && !orderId) {
    return null;
  }

  const [formDefinition, setFormDefinition] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (documentType?.id && orderId) {
      loadFormDefinition();
    }
  }, [documentType?.id, orderId]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const loadFormDefinition = async () => {
    if (!documentType?.id || !orderId) {
      setError('Faltan parámetros necesarios para cargar el formulario');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const definition = await window.documentsApi.getDocumentFormDefinition(
        documentType.id, 
        orderId
      );
      
      setFormDefinition(definition);
      
      // Establecer valores por defecto si no estamos editando
      if (!isEditing && definition.defaultValues) {
        setFormData(prev => ({ ...definition.defaultValues, ...prev }));
      }
    } catch (err) {
      console.error('Error cargando definición del formulario:', err);
      setError('Error cargando el formulario. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const documentData = {
        documentTypeId: documentType.id,
        orderId: orderId,
        title: formData.title || `${documentType.name} - ${new Date().toLocaleDateString()}`,
        sharedData: extractSharedData(formData),
        specificData: extractSpecificData(formData)
      };

      await onSubmit(documentData);
    } catch (err) {
      console.error('Error enviando formulario:', err);
      setError('Error al guardar el documento. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const validateForm = () => {
    if (!formDefinition) return false;

    const errors = [];

    formDefinition.formFields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name].toString().trim() === '')) {
        errors.push(`${field.label} es requerido`);
      }

      // Validaciones específicas por tipo
      if (formData[field.name]) {
        switch (field.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData[field.name])) {
              errors.push(`${field.label} debe ser un email válido`);
            }
            break;
          case 'number':
            if (isNaN(formData[field.name])) {
              errors.push(`${field.label} debe ser un número válido`);
            }
            break;
        }
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }

    return true;
  };

  const extractSharedData = (data) => {
    if (!formDefinition?.sharedFields) return {};
    
    const sharedData = {};
    formDefinition.sharedFields.forEach(field => {
      if (data[field.name] !== undefined) {
        sharedData[field.name] = data[field.name];
      }
    });
    return sharedData;
  };

  const extractSpecificData = (data) => {
    if (!formDefinition?.formFields) return {};
    
    const specificData = {};
    formDefinition.formFields.forEach(field => {
      if (data[field.name] !== undefined) {
        specificData[field.name] = data[field.name];
      }
    });
    return specificData;
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';
    const fieldId = `field_${field.name}`;

    // Verificar condicionales
    if (field.conditional) {
      const conditionMet = checkConditional(field.conditional);
      if (!conditionMet) return null;
    }

    const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent";
    const errorClasses = error && field.required && !value ? "border-red-300" : "";

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <div key={field.name} className="space-y-2">
            <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              id={fieldId}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={`${baseClasses} ${errorClasses}`}
              required={field.required}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              id={fieldId}
              value={value}
              onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value) || '')}
              placeholder={field.placeholder}
              className={`${baseClasses} ${errorClasses}`}
              required={field.required}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              id={fieldId}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={`${baseClasses} ${errorClasses}`}
              required={field.required}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={fieldId}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={`${baseClasses} ${errorClasses}`}
              required={field.required}
            >
              <option value="">Selecciona una opción</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map(option => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={field.name}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              id={fieldId}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={`${baseClasses} ${errorClasses}`}
              required={field.required}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case 'attachment':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-gray-500 mb-3">{field.description}</p>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2">Arrastra archivos aquí o haz clic para seleccionar</p>
                <p className="text-sm text-gray-400 mt-1">
                  {field.attachmentConfig ? 
                    `Tipos: ${field.attachmentConfig.allowedTypes?.join(', ') || 'Varios'} | 
                     Máx: ${Math.round((field.attachmentConfig.maxSize || 10485760) / 1024 / 1024)}MB |
                     Límite: ${field.attachmentConfig.maxCount || 5} archivos` :
                    'PDF, Imágenes, Documentos'
                  }
                </p>
              </div>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, field)}
                className="hidden"
                accept={getAcceptTypes(field.attachmentConfig?.allowedTypes || ['pdf', 'image', 'document'])}
              />
            </div>
            {value && value.length > 0 && (
              <div className="mt-3 space-y-2">
                {value.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getFileIcon(file.type)}</span>
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(field.name, index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'roi_calculator':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-gray-500 mb-3">{field.description}</p>
            )}
            <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
              <div className="text-center text-gray-600">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium mb-2">Calculadora ROI Avanzada</p>
                <p className="text-sm text-gray-500 mb-4">
                  Herramienta completa para calcular el retorno de inversión con empleados y agentes de IA
                </p>
                <button
                  type="button"
                  onClick={() => openROICalculator(field.name)}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Abrir Calculadora ROI
                </button>
                {value && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✅ Cálculo ROI configurado
                      {value.summary && ` | ${value.summary}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'aim_quote_calculator':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-gray-500 mb-3">{field.description}</p>
            )}
            <div className="border border-gray-300 rounded-lg p-6 bg-gradient-to-br from-teal-50 to-emerald-50">
              <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-teal-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p className="text-lg font-medium mb-2 text-teal-900">Cotizador AIM Completo</p>
                <p className="text-sm text-teal-700 mb-4">
                  Configura agentes, planes de suscripción y servicios adicionales para generar una cotización detallada
                </p>
                <button
                  type="button"
                  onClick={() => openQuoteCalculator(field.name)}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Abrir Cotizador AIM
                </button>
                {value && (
                  <div className="mt-4 p-4 bg-white border border-teal-200 rounded-lg">
                    <p className="text-sm text-teal-800 font-medium mb-2">
                      ✅ Cotización configurada
                    </p>
                    {value.summary && (
                      <div className="text-xs text-teal-700 space-y-1">
                        <p>Agentes: {value.summary.agentsCount || 0}</p>
                        <p>Plan: {value.summary.subscriptionPlan || 'No seleccionado'}</p>
                        <p>Total: ${value.summary.totalAmount || 0} {value.summary.currency || 'MXN'}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const checkConditional = (conditional) => {
    if (!conditional) return true;
    
    const { field, value, operator } = conditional;
    const fieldValue = formData[field];
    
    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'contains':
        return fieldValue && fieldValue.toString().includes(value);
      case 'greater_than':
        return parseFloat(fieldValue) > parseFloat(value);
      case 'less_than':
        return parseFloat(fieldValue) < parseFloat(value);
      default:
        return true;
    }
  };

  const renderSection = (section) => {
    const sectionFields = formDefinition.formFields.filter(field => 
      field.section === section.title || 
      (!field.section && section.title === formDefinition.formFields[0]?.section)
    );

    if (sectionFields.length === 0) return null;

    return (
      <div key={section.title} className="space-y-6">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sectionFields.map(field => renderField(field))}
        </div>
      </div>
    );
  };

  // Función auxiliar para manejar carga de archivos
  const handleFileUpload = (e, field) => {
    const files = Array.from(e.target.files);
    const fileData = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: getFileType(file),
      size: file.size,
      category: field.attachmentConfig?.categories?.[0] || 'General',
      file: file
    }));
    
    handleInputChange(field.name, fileData);
  };

  // Función auxiliar para remover archivos
  const removeFile = (fieldName, index) => {
    const currentFiles = formData[fieldName] || [];
    const newFiles = currentFiles.filter((_, i) => i !== index);
    handleInputChange(fieldName, newFiles);
  };

  // Función auxiliar para obtener tipos de archivo aceptados
  const getAcceptTypes = (allowedTypes) => {
    const typeMap = {
      'pdf': '.pdf',
      'image': '.jpg,.jpeg,.png,.gif,.webp',
      'document': '.doc,.docx,.txt,.rtf,.odt',
      'video': '.mp4,.avi,.mov,.wmv,.mkv',
      'audio': '.mp3,.wav,.aac,.ogg,.flac'
    };
    
    return allowedTypes.map(type => typeMap[type] || '').join(',');
  };

  // Función auxiliar para obtener icono de archivo
  const getFileIcon = (type) => {
    const iconMap = {
      'pdf': '📄',
      'image': '🖼️',
      'document': '📝',
      'video': '🎥',
      'audio': '🎵'
    };
    return iconMap[type] || '📎';
  };

  // Función auxiliar para formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Función auxiliar para determinar tipo de archivo
  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('document') || file.type.includes('text') || file.type.includes('word')) return 'document';
    return 'other';
  };

  // Función para abrir calculadora ROI
  const openROICalculator = (fieldName) => {
    // Por ahora, simular la apertura del calculador
    const mockROIData = {
      investmentAmount: 100000,
      monthlySavings: 15000,
      paybackPeriod: 6.67,
      roi: 80,
      summary: 'ROI del 80% en 6.7 meses'
    };
    
    handleInputChange(fieldName, mockROIData);
    
    // TODO: Implementar modal o página dedicada para la calculadora ROI
    alert('Calculadora ROI abierta (simulación). En producción esto abriría un modal completo.');
  };

  // Función para abrir cotizador AIM
  const openQuoteCalculator = (fieldName) => {
    // Por ahora, simular la apertura del cotizador
    const mockQuoteData = {
      agents: [
        { id: 'ap-301', name: 'Agente de Cuentas por Pagar', price: 45000 }
      ],
      subscriptionPlan: 'AIM-Gestionado',
      totalAmount: 53500,
      currency: 'MXN',
      summary: {
        agentsCount: 1,
        subscriptionPlan: 'AIM-Gestionado',
        totalAmount: 53500,
        currency: 'MXN'
      }
    };
    
    handleInputChange(fieldName, mockQuoteData);
    
    // TODO: Implementar modal o página dedicada para el cotizador AIM
    alert('Cotizador AIM abierto (simulación). En producción esto abriría un modal completo.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-2 text-gray-600">Cargando formulario...</span>
      </div>
    );
  }

  if (error && !formDefinition) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
        <button 
          onClick={loadFormDefinition}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (!formDefinition) {
    return (
      <div className="text-center py-8 text-gray-500">
        No se pudo cargar la definición del formulario.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header del formulario */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Editar' : 'Crear'} {documentType.name}
            </h2>
            <p className="text-gray-600">{documentType.description}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {documentType.estimatedTime}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {documentType.phase}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Campo título */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Título del Documento
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder={`${documentType.name} - ${new Date().toLocaleDateString()}`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          required
        />
      </div>

      {/* Errores */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Secciones del formulario */}
      {formDefinition.documentType.formSchema?.sections?.map(section => 
        renderSection(section)
      )}

      {/* Campos sin sección */}
      {formDefinition.formFields.filter(field => !field.section).length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formDefinition.formFields
              .filter(field => !field.section)
              .map(field => renderField(field))
            }
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || !formDefinition}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 disabled:opacity-50 flex items-center"
        >
          {submitting && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isEditing ? 'Actualizar Documento' : 'Crear Documento'}
        </button>
      </div>
    </form>
  );
};

export default DynamicDocumentForm; 