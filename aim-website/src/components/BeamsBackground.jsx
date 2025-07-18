// src/components/BeamsBackground.jsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function BeamsBackground() {
  const comp = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1 });
    
    // Animación de los beams
    tl.to(".beam", {
      opacity: 0.5,
      duration: 2,
      stagger: {
        each: 0.5,
        repeat: -1,
        yoyo: true
      },
      ease: "power1.inOut"
    });

  }, []);

  return (
    <div ref={comp} className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        {/* Beams de fondo */}
        <div className="beam absolute w-[200%] h-[100px] bg-gradient-to-r from-brand-primary/20 to-transparent rotate-[-45deg] transform -translate-y-[60%] left-[-50%]"></div>
        <div className="beam absolute w-[200%] h-[100px] bg-gradient-to-r from-brand-secondary/20 to-transparent rotate-[-45deg] transform translate-y-[40%] left-[-50%]"></div>
        <div className="beam absolute w-[200%] h-[100px] bg-gradient-to-r from-teal-500/20 to-transparent rotate-[-45deg] transform translate-y-[140%] left-[-50%]"></div>
      </div>
      
      {/* Overlay de ruido sutil */}
      <div className="absolute inset-0 opacity-[0.15]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat',
        width: '100%',
        height: '100%'
      }}></div>
    </div>
  );
} 