import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function BeamsBackground() {
  const beamsRef = useRef(null);

  useEffect(() => {
    const beams = beamsRef.current;
    
    // Animación sutil de los beams
    gsap.to(beams, {
      backgroundPosition: '100% 100%',
      duration: 30,
      ease: 'none',
      repeat: -1
    });
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-white to-teal-50">
      {/* Patrón de beams */}
      <div
        ref={beamsRef}
        className="absolute inset-0 bg-[length:100px_100px] opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%230D9488' fill-opacity='0.07' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Efectos de luz y gradientes */}
      <div className="absolute inset-0">
        {/* Gradiente superior sutil */}
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white via-white/80 to-transparent" />
        
        {/* Gradiente lateral izquierdo */}
        <div className="absolute inset-y-0 left-0 w-96 bg-gradient-to-r from-white/80 to-transparent" />
        
        {/* Gradiente lateral derecho */}
        <div className="absolute inset-y-0 right-0 w-96 bg-gradient-to-l from-white/80 to-transparent" />
        
        {/* Gradiente inferior */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-teal-50/80 to-transparent" />
      </div>

      {/* Efecto de luz radial sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/0 via-teal-50/30 to-teal-100/20" />
    </div>
  );
} 