'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Head from 'next/head';

export default function NotFound() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scaleY, setScaleY] = useState(1);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (textRef.current) {
        const height = textRef.current.offsetHeight;
        if (height > 0) {
          // As requested: "divide window.innerHeight by that height"
          setScaleY(window.innerHeight / height);
        }
      }
    };
    
    // Slight delay to ensure fonts are loaded and layout is calculated
    const timeoutId = setTimeout(handleResize, 50);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navLinks = ['About Us', 'Programs', 'Reviews', 'FAQ', 'Contacts'];

  return (
    <>
      <div 
        className="fixed inset-0 w-full h-[100dvh] overflow-hidden flex flex-col z-50 font-sans"
        style={{
          background: 'linear-gradient(to bottom, #FF8233, #FDAC55)',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* BACKGROUND "404" TEXT EFFECT */}
        <div 
          className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-80"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)',
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)'
          }}
        >
          <div className="relative flex items-center justify-center">
            <div 
              ref={textRef}
              className="text-[#FFFFFF] font-black leading-none tracking-tighter whitespace-nowrap"
              style={{
                fontSize: 'clamp(200px, 48vw, 800px)',
                transform: `scale(1.15, ${scaleY * 1.4})`,
                transformOrigin: 'center'
              }}
            >
              404
            </div>
            
            {/* White Oval Over Text */}
            <div 
              className="absolute bg-white rounded-full h-[22vh] sm:h-[26vh] md:h-[50vh]"
              style={{
                width: 'clamp(120px, 20vw, 400px)',
                transform: `scale(1, ${scaleY * 1.4})`,
                transformOrigin: 'center'
              }}
            />
          </div>
        </div>

        {/* NAVIGATION BAR */}
        <nav className="relative z-20 flex flex-row items-center justify-between px-4 sm:px-6 md:px-12 py-4 sm:py-5">
          {/* Logo (left) */}
          <Link href="/" className="flex items-center">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
            </div>
            <span className="text-white font-bold text-lg sm:text-xl ml-2">VSI</span>
          </Link>

          {/* Desktop nav links (center/right) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a 
                key={link} 
                href="#" 
                className="px-4 py-1.5 text-sm font-medium rounded-full bg-white text-[#F16524] hover:opacity-90 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Menu button (right) */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-white bg-[#F16524] hover:opacity-90 transition-colors"
          >
            <Menu className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Menu</span>
          </button>
        </nav>

        {/* MOBILE MENU OVERLAY */}
        <div 
          className={`fixed inset-0 z-50 pointer-events-none ${isMenuOpen ? 'pointer-events-auto' : ''}`}
        >
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Panel */}
          <div 
            className={`absolute top-0 right-0 h-full w-full sm:w-[380px] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            style={{ background: 'linear-gradient(135deg, #FF6B1A 0%, #FF9642 100%)' }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="text-white font-bold text-xl ml-2">VSI</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu items */}
            <div className="px-6 py-8 flex flex-col gap-3">
              {navLinks.map((link, i) => (
                <a
                  key={link}
                  href="#"
                  className={`block px-6 py-4 text-lg font-semibold text-white rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 transform ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{
                    transitionDelay: isMenuOpen ? `${150 + i * 60}ms` : '0ms'
                  }}
                >
                  {link}
                </a>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Link 
                href="/"
                className={`flex items-center justify-center gap-2 w-full py-4 rounded-full bg-white font-semibold text-base text-[#F16524] hover:scale-[1.02] transition-all transform ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{
                  transitionDelay: isMenuOpen ? '450ms' : '0ms',
                  transitionDuration: '500ms'
                }}
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* CENTER VIDEO */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: 'calc(-6vh - 40px)' }}>
          <div className="w-[120vw] h-[85vh] sm:w-[70vw] sm:h-[70vh] md:w-[62vw] md:h-[78vh]">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-contain pointer-events-none mix-blend-darken"
            >
              <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260713_234424_b1332b69-2e69-4302-8dbc-40f86846afbd.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        {/* BOTTOM CONTENT */}
        <div className="relative z-30 mt-auto pb-8 sm:pb-16 flex flex-col items-center text-center px-4">
          <h2 className="text-white text-lg sm:text-xl md:text-2xl font-medium mb-3 sm:mb-4">
            Oops, something went wrong!
          </h2>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-full text-white font-semibold text-sm sm:text-base bg-[#F16524] hover:scale-105 hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
