import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ParticleBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const material = new THREE.PointsMaterial({
      size: 0.025,
      color: 0x818cf8,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);
    camera.position.z = 3;

    let mouseX = 0, mouseY = 0;
    let targetRotationSpeed = 0.05;
    let currentRotationSpeed = 0.05;
    let targetFOV = 75;

    const handleMouse = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
    document.addEventListener('mousemove', handleMouse);

    const clock = new THREE.Clock();
    let animId;

    function animate() {
      const elapsedTime = clock.getElapsedTime();
      currentRotationSpeed += (targetRotationSpeed - currentRotationSpeed) * 0.05;
      if (Math.abs(camera.fov - targetFOV) > 0.1) {
        camera.fov += (targetFOV - camera.fov) * 0.05;
        camera.updateProjectionMatrix();
      }
      particlesMesh.rotation.y = elapsedTime * currentRotationSpeed;
      particlesMesh.rotation.x = elapsedTime * (currentRotationSpeed * 0.4);
      particlesMesh.rotation.x += mouseY * 0.00005;
      particlesMesh.rotation.y += mouseX * 0.00005;
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: -1, pointerEvents: 'none', overflow: 'hidden',
      }}
    />
  );
}
