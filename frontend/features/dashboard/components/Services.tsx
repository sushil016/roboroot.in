"use client";

import React, { useEffect, useRef, useState } from "react";
import { knowledgeHubCards } from "@/data/knowledgeHubCards";

const 
RoborootAiSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ticking = useRef(false);
  const lastScrollY = useRef(0);

  // More responsive timing function with shorter duration
  const cardStyle = {
    height: '60vh',
    maxHeight: '600px',
    borderRadius: '20px',
    transition: 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    willChange: 'transform, opacity'
  };

  useEffect(() => {
    // Create intersection observer to detect when section is in view
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 } // Start observing when 10% of element is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    // Optimized scroll handler using requestAnimationFrame
    const handleScroll = () => {
      if (!ticking.current) {
        lastScrollY.current = window.scrollY;
        
        window.requestAnimationFrame(() => {
          if (!sectionRef.current) return;
          
          const sectionRect = sectionRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const totalScrollDistance = viewportHeight * 2;
          
          // Calculate the scroll progress
          let progress = 0;
          if (sectionRect.top <= 0) {
            progress = Math.min(1, Math.max(0, Math.abs(sectionRect.top) / totalScrollDistance));
          }
          
          // Determine which card should be visible based on progress
          if (progress >= 0.66) {
            setActiveCardIndex(2);
          } else if (progress >= 0.33) {
            setActiveCardIndex(1);
          } else {
            setActiveCardIndex(0);
          }
          
          ticking.current = false;
        });
        
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Card visibility based on active index instead of direct scroll progress
  const isFirstCardVisible = isIntersecting;
  const isSecondCardVisible = activeCardIndex >= 1;
  const isThirdCardVisible = activeCardIndex >= 2;

  return (
    <div 
      ref={sectionRef} 
      className="relative" 
      style={{ height: '300vh' }}
    >
      <section className="w-full h-screen py-10 md:py-16 sticky top-0 overflow-hidden bg-background" id="why-second-brain">
        <div className="container px-6 lg:px-8 mx-auto h-full flex flex-col">
          <div className="mb-2 md:mb-3">
            <div className="flex items-center gap-4 mb-2 md:mb-2 pt-8 sm:pt-6 md:pt-4">
              <div className="pulse-chip opacity-0 animate-fade-in" style={{
                animationDelay: "0.1s"
              }}>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black text-white mr-2">02</span>
                <span>Roboroot Ai based shopping</span>
              </div>
            </div>
            
            <h2 className="section-title text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-1 md:mb-2">
              Roboroot Ai based shopping
            </h2>
          </div>
          
          <div ref={cardsContainerRef} className="relative flex-1 perspective-1000">
            {knowledgeHubCards.map((card, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              const isVisible = isFirst ? isFirstCardVisible : isSecond ? isSecondCardVisible : isThirdCardVisible;
              
              let transform = "";
              let opacity = isVisible ? (isFirst ? 0.9 : 1) : 0;
              let zIndex = (index + 1) * 10;
              
              if (isFirst) {
                transform = `translateY(${isVisible ? '90px' : '200px'}) scale(0.9)`;
              } else if (isSecond) {
                transform = `translateY(${isVisible ? activeCardIndex === 1 ? '55px' : '45px' : '200px'}) scale(0.95)`;
              } else {
                transform = `translateY(${isVisible ? activeCardIndex === 2 ? '15px' : '0' : '200px'}) scale(1)`;
              }

              const renderTitle = (title: string, highlight?: string) => {
                if (!highlight) return title;
                const parts = title.split(highlight);
                if (parts.length === 1) return title;
                return (
                  <>
                    {parts.map((part, i) => (
                      <React.Fragment key={i}>
                        {part}
                        {i < parts.length - 1 && (
                          <span className="text-[#FC4D0A]">{highlight}</span>
                        )}
                      </React.Fragment>
                    ))}
                  </>
                );
              };

              return (
                <div 
                  key={index}
                  className={`absolute inset-0 overflow-hidden shadow-xl ${isVisible ? 'animate-card-enter' : ''}`} 
                  style={{
                    ...cardStyle,
                    zIndex,
                    transform,
                    opacity,
                    pointerEvents: !isFirst && isVisible ? 'auto' : (isFirst ? 'auto' : 'none')
                  }}
                >
                  <div
                    className="absolute inset-0 z-0 bg-gradient-to-b from-pulse-900/40 to-dark-900/80"
                    style={{
                      backgroundImage: `url('${card.image}')`,
                      backgroundSize: "cover",
                      backgroundPosition: card.imagePosition,
                      backgroundBlendMode: "overlay"
                    }}
                  ></div>
                  
                  <div className="absolute top-4 right-4 z-20">
                    <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white">
                      <span className="text-sm font-medium">{card.tag}</span>
                    </div>
                  </div>
                  
                  <div className="relative z-10 p-5 sm:p-6 md:p-8 h-full flex items-center">
                    <div className="max-w-lg">
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-display text-white font-bold leading-tight mb-4">
                        {renderTitle(card.title, card.highlight)}
                      </h3>
                      <p className="text-white/80 text-lg">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoborootAiSection; 