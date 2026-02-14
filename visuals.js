// ============= Three.js Particle Background =============
const Visuals = (() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    const container = document.getElementById('canvas-container');
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Particles
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

    // State Variables
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationSpeed = 0.05;
    let currentRotationSpeed = 0.05;
    let targetFOV = 75;
    let currentWPM = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });

    const clock = new THREE.Clock();

    function animate() {
        const elapsedTime = clock.getElapsedTime();

        // Smooth speed transition
        currentRotationSpeed += (targetRotationSpeed - currentRotationSpeed) * 0.05;

        // FOV Update (Warp Effect)
        if (Math.abs(camera.fov - targetFOV) > 0.1) {
            camera.fov += (targetFOV - camera.fov) * 0.05;
            camera.updateProjectionMatrix();
        }

        particlesMesh.rotation.y = elapsedTime * currentRotationSpeed;
        particlesMesh.rotation.x = elapsedTime * (currentRotationSpeed * 0.4);

        particlesMesh.rotation.x += mouseY * 0.00005;
        particlesMesh.rotation.y += mouseX * 0.00005;

        renderer.render(scene, camera);
        window.requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return {
        updateWPM: (wpm) => {
            currentWPM = wpm;
            targetRotationSpeed = 0.05 + (wpm / 150) * 0.5;
            targetFOV = 75 + (wpm / 150) * 15;

            // Subtle color shift
            const hue = 0.6 + (wpm / 300) * 0.2; // Shift from blue towards purple
            material.color.setHSL(hue % 1, 0.7, 0.7);
        },
        triggerBurst: () => {
            const originalSize = material.size;
            material.size = 0.08;
            targetRotationSpeed += 0.5;

            setTimeout(() => {
                material.size = originalSize;
                targetRotationSpeed -= 0.5;
            }, 500);
        },
        reset: () => {
            targetRotationSpeed = 0.05;
            targetFOV = 75;
            material.color.setHex(0x818cf8);
            material.size = 0.025;
        }
    };
})();

// ============= Lenis Smooth Scroll =============
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

