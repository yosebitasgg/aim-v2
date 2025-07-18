// src/components/homepage-v2/HeroAnimated.jsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import BeamsBackground from '../BeamsBackground';

// Los componentes del logo separados para la animación
const LogoAlpha = () => <img src="/logo-alpha.svg" alt="Alpha symbol" className="w-full h-auto" />;
const LogoGear = () => <img src="/logo-gear.svg" alt="Gear symbol" className="w-full h-auto" />;

export default function HeroAnimated() {
  const comp = useRef(null);

  useEffect(() => {
    // Configuración inicial - todo invisible
    gsap.set(".hero-text", { opacity: 0, y: 50 });
    gsap.set(".hero-cta", { opacity: 0, y: 20 });
    gsap.set("#logo-gear", { xPercent: -150, rotate: -45, opacity: 0 });
    gsap.set("#logo-alpha", { xPercent: 150, opacity: 0 });

    const tl = gsap.timeline();

    // Animación del logo
    tl.to("#logo-gear", {
      xPercent: 0,
      rotate: 0,
      opacity: 1,
      duration: 1,
      ease: "power2.out"
    })
    .to("#logo-alpha", {
      xPercent: 0,
      opacity: 1,
      duration: 1,
      ease: "power2.out"
    }, "<")
    // Unión y escalado del logo con fade out simultáneo
    .to(["#logo-gear", "#logo-alpha"], {
      scale: 0.15,
      y: "-150%",
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut"
    }, "+=0.3")
    // Animación del texto
    .to(".hero-text", {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.2
    }, "-=0.5")
    .to(".hero-cta", {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "back.out(1.7)"
    }, "-=0.3");

  }, []);

  return (
    <section ref={comp} className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden bg-gradient-to-b from-white to-brand-light/30">
      {/* Beams Background */}
      <BeamsBackground />

      {/* Logo Container */}
      <div className="absolute w-64 h-64 flex items-center justify-center">
        <div id="logo-gear" className="absolute w-full h-full opacity-0">
          <LogoGear />
        </div>
        <div id="logo-alpha" className="absolute w-full h-full opacity-0">
          <LogoAlpha />
        </div>
      </div>

      {/* Hero Content */}
      <div className="text-center max-w-5xl mx-auto relative z-10">
        <h1 className="hero-text opacity-0 text-5xl md:text-7xl font-black text-teal-800 tracking-tight leading-tight">
          Automatización
          <span className="text-brand-primary"> Industrial</span>
          <br />
          <span>Mireles</span>
        </h1>
        
        <p className="hero-text opacity-0 mt-8 text-xl md:text-2xl text-teal-600 max-w-2xl mx-auto">
          Transformamos operaciones. Liberamos potencial.
        </p>

        <a 
          href="/soluciones" 
          className="hero-cta opacity-0 inline-block mt-12 bg-teal-600 text-white font-bold py-4 px-10 rounded-lg hover:bg-teal-700 transition-all duration-300 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          Descubrir Agentes Inteligentes
        </a>
      </div>
    </section>
  );
} 