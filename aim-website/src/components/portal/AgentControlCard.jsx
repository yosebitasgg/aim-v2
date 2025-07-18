// src/components/portal/AgentControlCard.jsx
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AgentControlCard({ agent }) {
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const chartData = {
    labels: agent.metrics.labels,
    datasets: [{
      label: 'Ejecuciones por Día',
      data: agent.metrics.data,
      backgroundColor: '#14B8A6',
      borderColor: '#0D9488',
      borderWidth: 1,
    }]
  };
  
  const chartOptions = { 
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Rendimiento Semanal'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <>
      {/* La Tarjeta Principal */}
      <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow flex flex-col">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-teal-800">{agent.name}</h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              agent.status === 'Activo' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
                {agent.status}
            </span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center flex-grow content-start mb-6">
            <div>
              <p className="text-2xl font-black text-teal-800">{agent.executionsToday}</p>
              <p className="text-xs text-gray-600">Ejecuciones Hoy</p>
            </div>
            <div>
              <p className="text-2xl font-black text-teal-800">{agent.avgExecutionTime}</p>
              <p className="text-xs text-gray-600">Tiempo Promedio</p>
            </div>
            <div>
              <p className="text-sm font-medium text-teal-800 mt-2">{agent.lastRun}</p>
              <p className="text-xs text-gray-600">Última Ejecución</p>
            </div>
        </div>
        
        <div className="border-t pt-4 grid grid-cols-3 gap-3">
            <button 
              onClick={() => setIsMetricsOpen(true)} 
              className="bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 p-3 rounded-lg transition-all duration-200 flex flex-col items-center justify-center shadow-sm hover:shadow-md"
            >
              <span className="text-xs font-semibold">Métricas</span>
              <span className="text-xs text-gray-500 mt-1">Ver gráficos</span>
            </button>
            <button 
              onClick={() => setIsConfigOpen(true)} 
              className="bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 p-3 rounded-lg transition-all duration-200 flex flex-col items-center justify-center shadow-sm hover:shadow-md"
            >
              <span className="text-xs font-semibold">Configurar</span>
              <span className="text-xs text-gray-500 mt-1">Parámetros</span>
            </button>
            <button 
              onClick={() => setIsReportOpen(true)} 
              className="bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 p-3 rounded-lg transition-all duration-200 flex flex-col items-center justify-center shadow-sm hover:shadow-md"
            >
              <span className="text-xs font-semibold">Reporte</span>
              <span className="text-xs text-gray-500 mt-1">Generar PDF</span>
            </button>
        </div>
      </div>
      
      {/* Modales */}
      <Modal isOpen={isMetricsOpen} setIsOpen={setIsMetricsOpen} title={`Métricas de ${agent.name}`}>
          {agent.metrics.data.length > 0 ? (
            <div className="h-96">
              <Bar options={chartOptions} data={chartData} />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay datos de métricas disponibles para este agente.</p>
              <p className="text-sm text-gray-400 mt-2">Las métricas aparecerán cuando el agente esté activo.</p>
            </div>
          )}
      </Modal>

      <Modal isOpen={isConfigOpen} setIsOpen={setIsConfigOpen} title={`Configuración de ${agent.name}`}>
          <div className="space-y-4">
              {Object.entries(agent.config).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  <input 
                    type="text" 
                    readOnly 
                    value={Array.isArray(value) ? value.join(', ') : value}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed text-sm" 
                  />
                </div>
              ))}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Nota Importante</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      La edición de parámetros de configuración requiere contactar a nuestro equipo de soporte técnico 
                      para garantizar la integridad del sistema.
                    </p>
                  </div>
                </div>
              </div>
          </div>
      </Modal>

      <Modal isOpen={isReportOpen} setIsOpen={setIsReportOpen} title={`Generar Reporte para ${agent.name}`}>
           <div className="space-y-4">
             <p className="text-gray-700">Selecciona el rango de fechas para tu reporte de ejecuciones.</p>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                 <input 
                   type="date" 
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" 
                   defaultValue={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                 <input 
                   type="date" 
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" 
                   defaultValue={new Date().toISOString().split('T')[0]}
                 />
               </div>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
               <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                 <option>Resumen Ejecutivo</option>
                 <option>Detalle Completo</option>
                 <option>Solo Errores</option>
                 <option>Métricas de Rendimiento</option>
               </select>
             </div>
             
             <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 mt-6">
               Generar y Descargar PDF
             </button>
           </div>
      </Modal>
    </>
  );
}

// Componente Genérico para los Modales
function Modal({ isOpen, setIsOpen, title, children }) {
    return (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                    <Dialog.Title className="text-xl font-bold text-teal-800 mb-4">{title}</Dialog.Title>
                    <div className="mt-4">{children}</div>
                    <div className="mt-6 flex justify-end">
                      <button 
                        onClick={() => setIsOpen(false)} 
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                      >
                        Cerrar
                      </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
} 