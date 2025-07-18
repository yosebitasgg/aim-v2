// Iconos SVG simples para evitar conflictos con Astro
const icons = {
  'tabler:user-star': (
    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  'tabler:cpu-2': (
    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  'tabler:chart-infographic': (
    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
};

export default function ProfileCard({ member }) {
  return (
    <div className="group relative bg-white rounded-3xl p-8 shadow-lg border border-teal-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Avatar/Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg">
              {icons[member.icon] || icons['tabler:user-star']}
            </div>
            {/* Floating accent */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500"></div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-teal-800 mb-2 group-hover:text-teal-600 transition-colors duration-300">
            {member.name}
          </h3>
          
          <p className="text-teal-600 font-semibold text-sm mb-4 uppercase tracking-wide">
            {member.role}
          </p>
          
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {member.description}
          </p>

          {/* Stats or achievement */}
          <div className="flex justify-center space-x-4 mb-6">
            <div className="text-center">
              <div className="text-lg font-bold text-teal-600">{member.experience || "15+"}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Años Exp.</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-teal-600">{member.projects || "100+"}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Proyectos</div>
            </div>
          </div>

          {/* Contact button */}
          <button className="w-full bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium py-3 px-4 rounded-xl transition-all duration-300 text-sm group-hover:bg-teal-600 group-hover:text-white">
            Conectar
          </button>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-teal-300 rounded-full opacity-0 group-hover:opacity-60 group-hover:animate-ping transition-all duration-700"></div>
      <div className="absolute bottom-6 left-4 w-1 h-1 bg-teal-400 rounded-full opacity-0 group-hover:opacity-40 group-hover:animate-pulse transition-all duration-500 delay-200"></div>
    </div>
  );
} 