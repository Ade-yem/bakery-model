/**
 * @file Three.js ambient 3D floating mesh/particle depth layer.
 * Lightweight, non-blocking (pointer-events: none), lazy-loaded, and reactive to scroll.
 * Uses official brand Copper (#A9501A) & Verdigris (#0B5C63) palette.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * @description Renders a lightweight, performant ambient 3D floating particles layer behind the hero section.
 * @returns {React.ReactElement} Canvas background container.
 */
export function Ambient3DBackground(): React.ReactElement {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable on small devices or reduced-motion preference for optimal performance
    if (window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Geometry: Floating particles representing bakery golden wheat & copper nodes
    const particleCount = 45;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const copperColor = new THREE.Color('#A9501A');
    const verdigrisColor = new THREE.Color('#0B5C63');

    for (let i = 0; i < particleCount; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      // Color variation
      const mixedColor = Math.random() > 0.45 ? verdigrisColor : copperColor;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle material
    const material = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let animationId: number;
    let scrollY = window.scrollY;

    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Render loop
    const animate = () => {
      particles.rotation.y += 0.0008;
      particles.rotation.x += 0.0004;

      // Subtle parallax reaction to scroll
      particles.position.y = scrollY * 0.003;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0 w-full h-full z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
