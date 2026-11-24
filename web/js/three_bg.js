// Soft & Premium Ambient 3D Three.js Visuals
// Generates a subtle, elegant floating node constellation with soft atmospheric depth
(function initPremiumThreeBackground() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 28;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Group for mouse parallax
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 1. Soft Ambient Floating Particle Constellation
    const particleCount = 140;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
        const x = (Math.random() - 0.5) * 60;
        const y = (Math.random() - 0.5) * 45;
        const z = (Math.random() - 0.5) * 30;

        positions[i] = x;
        positions[i + 1] = y;
        positions[i + 2] = z;

        originalPositions[i] = x;
        originalPositions[i + 1] = y;
        originalPositions[i + 2] = z;

        speeds[i / 3] = 0.2 + Math.random() * 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle Material with Soft Tint
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x94a3b8,
        size: 0.45,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    worldGroup.add(particles);

    // 2. Subtle Compiler Flow Ring (Soft, low-opacity geometric rings)
    const ringGeo = new THREE.TorusGeometry(10, 0.03, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.08,
        wireframe: true
    });
    const ringMesh1 = new THREE.Mesh(ringGeo, ringMat);
    ringMesh1.rotation.x = Math.PI / 3;
    worldGroup.add(ringMesh1);

    const ringGeo2 = new THREE.TorusGeometry(14, 0.02, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
        color: 0x818cf8,
        transparent: true,
        opacity: 0.05,
        wireframe: true
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.y = Math.PI / 4;
    worldGroup.add(ringMesh2);

    // 3. Mouse Parallax Handling
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.0004;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.0004;
    }, { passive: true });

    // Window Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 4. Subtle Ambient Animation Loop
    let clock = 0;
    function animate() {
        requestAnimationFrame(animate);
        clock += 0.005;

        // Smooth Damped Mouse Movement
        targetX += (mouseX - targetX) * 0.03;
        targetY += (mouseY - targetY) * 0.03;

        worldGroup.rotation.y = targetX * 0.5 + clock * 0.015;
        worldGroup.rotation.x = targetY * 0.5;

        ringMesh1.rotation.z += 0.0008;
        ringMesh2.rotation.z -= 0.0005;

        // Gentle Floating Wave for particles
        const pos = geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3;
            pos[idx + 1] = originalPositions[idx + 1] + Math.sin(clock * speeds[i] + originalPositions[idx]) * 0.8;
        }
        geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    animate();
})();
