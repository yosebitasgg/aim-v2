import React, { useState, useEffect } from 'react';

const DocumentPreview = ({ document, onDownload, onFinalize, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'FINALIZED': 'bg-blue-100 text-blue-800',
      'SENT': 'bg-purple-100 text-purple-800',
      'REVIEWED': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'ARCHIVED': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'DRAFT': 'Borrador',
      'FINALIZED': 'Finalizado',
      'SENT': 'Enviado',
      'REVIEWED': 'Revisado',
      'APPROVED': 'Aprobado',
      'REJECTED': 'Rechazado',
      'ARCHIVED': 'Archivado'
    };
    return labels[status] || status;
  };

  const renderSpecificData = (specificData) => {
    if (!specificData || typeof specificData !== 'object') {
      return <p className="text-gray-500">No hay datos específicos disponibles</p>;
    }

    return Object.entries(specificData).map(([key, value]) => {
      if (!value) return null;
      
      const label = key.replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase())
                      .replace(/([a-z])([A-Z])/g, '$1 $2');
      
      return (
        <div key={key} className="mb-4">
          <dt className="text-sm font-medium text-gray-600 mb-1">{label}:</dt>
          <dd className="text-sm text-gray-900">
            {typeof value === 'string' && value.length > 100 ? (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="whitespace-pre-wrap">{value}</p>
              </div>
            ) : (
              <span>{value}</span>
            )}
          </dd>
        </div>
      );
    }).filter(Boolean);
  };

  const handleDownload = async (format) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onDownload(format);
    } catch (err) {
      setError(`Error al descargar como ${format.toUpperCase()}: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onFinalize();
    } catch (err) {
      setError(`Error al finalizar documento: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del documento */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{document.title}</h1>
              <p className="text-teal-100 text-lg">
                {document.documentType?.name || 'Documento'}
              </p>
              <div className="flex items-center space-x-4 mt-3 text-sm">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {document.documentNumber}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(document.createdAt)}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {document.documentType?.phase || 'Sin fase'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(document.status)} bg-white bg-opacity-20`}>
                {getStatusLabel(document.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contenido del documento */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {/* Información de la orden */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Información de la Orden
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">Número de Orden:</dt>
                  <dd className="text-sm text-gray-900">{document.order?.orderNumber || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">Cliente:</dt>
                  <dd className="text-sm text-gray-900">{document.order?.client?.companyName || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">Proyecto:</dt>
                  <dd className="text-sm text-gray-900">{document.order?.title || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">Fecha de Creación:</dt>
                  <dd className="text-sm text-gray-900">{formatDate(document.createdAt)}</dd>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {document.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Descripción
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{document.description}</p>
                </div>
              </div>
            )}

            {/* Datos específicos del documento */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Detalles del Documento
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <dl className="space-y-4">
                  {renderSpecificData(document.specificData)}
                </dl>
              </div>
            </div>

            {/* Información del documento */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Información del Documento
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">Versión:</dt>
                  <dd className="text-sm text-gray-900">{document.version || '1.0'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">Creado por:</dt>
                  <dd className="text-sm text-gray-900">{document.createdBy?.name || 'Sistema'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">Última modificación:</dt>
                  <dd className="text-sm text-gray-900">{formatDateTime(document.updatedAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">Descargas:</dt>
                  <dd className="text-sm text-gray-900">{document.downloadCount || 0}</dd>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="border-t pt-6">
              <div className="text-xs text-gray-500 space-y-1">
                <p>Documento generado por AIM - Sistema de Gestión de Automatización Industrial</p>
                <p>Generado el: {formatDateTime(new Date())}</p>
                <p>Este documento contiene información confidencial de la empresa.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => handleDownload('pdf')}
          disabled={isLoading}
          className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          Descargar PDF
        </button>

        <button
          onClick={() => handleDownload('jpg')}
          disabled={isLoading}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          Descargar Imagen
        </button>

        {document.status === 'DRAFT' && (
          <button
            onClick={handleFinalize}
            disabled={isLoading}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            Finalizar Documento
          </button>
        )}

        <button
          onClick={onClose}
          className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default DocumentPreview; 