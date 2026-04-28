import React, { useEffect } from 'react';
import TopNav from '../components/TopNav';
import Sidebar from '../components/Sidebar';
import Hero from '../components/sections/Hero';

const Home = () => {
  useEffect(() => {
    // Canvas background effect
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let dots = [];

    const initCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      dots = [];
      const numDots = Math.floor((width * height) / 15000);
      for (let i = 0; i < numDots; i++) {
        dots.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 1.5 + 0.5
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(196, 168, 130, 0.5)'; // Accent color
      
      dots.forEach(dot => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        
        if (dot.x < 0 || dot.x > width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > height) dot.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    initCanvas();
    animate();

    window.addEventListener('resize', initCanvas);
    return () => {
      window.removeEventListener('resize', initCanvas);
    };
  }, []);

  return (
    <>
      <canvas id="bgCanvas" aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.8 }}></canvas>
      <TopNav />
      <div className="page-layout">
        <Sidebar />
        <main className="main-content" id="mainContent">
          <Hero />
        </main>
      </div>
    </>
  );
};

export default Home;
