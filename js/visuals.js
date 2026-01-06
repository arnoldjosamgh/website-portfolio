/**
 * LUXECURVE VISUALS
 * Handles 3D interactions and animations
 */

// 1. IMPROVED TILT EFFECT (Vanilla Implementation)
class VanillaTilt {
    constructor(element) {
        this.element = element;
        this.element.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.element.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        this.element.addEventListener('mouseenter', this.onMouseEnter.bind(this));

        // Configuration
        this.settings = {
            max: 10,    // Max rotation deg
            perspective: 1000,
            scale: 1.05,
            glare: false
        };

        // Add Glare if enabled
        if (this.settings.glare) {
            this.glareWrapper = document.createElement('div');
            this.glareWrapper.className = 'js-tilt-glare';
            this.glareWrapper.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; border-radius: inherit; z-index: 2;`;

            this.glareEl = document.createElement('div');
            this.glareEl.className = 'js-tilt-glare-inner';
            this.glareEl.style.cssText = `position: absolute; top: 50%; left: 50%; pointer-events: none; background-image: linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 100%); width: 200%; height: 200%; transform: rotate(180deg) translate(-50%, -50%); transform-origin: 0% 0%; opacity: 0; transition: opacity 0.5s;`;

            this.glareWrapper.appendChild(this.glareEl);
            this.element.appendChild(this.glareWrapper);
        }

        // transform-style needed for 3D
        this.element.style.transformStyle = 'preserve-3d';
        this.element.style.transition = 'transform 0.1s ease-out';
    }

    onMouseEnter() {
        this.element.style.transition = 'none'; // Instant follow
    }

    onMouseMove(event) {
        const rect = this.element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const w = rect.width;
        const h = rect.height;

        // Calculate % from center
        const xPct = (x / w) - 0.5; // -0.5 to 0.5
        const yPct = (y / h) - 0.5;

        // Calculate Rotation
        const xRot = (this.settings.max * -1) * yPct * 2; // Tilt X based on Y movement
        const yRot = this.settings.max * xPct * 2;        // Tilt Y based on X movement

        this.element.style.transform = `
            perspective(${this.settings.perspective}px) 
            rotateX(${xRot}deg) 
            rotateY(${yRot}deg) 
            scale3d(${this.settings.scale}, ${this.settings.scale}, ${this.settings.scale})
        `;

        if (this.glareEl) {
            const glareX = (x / w) * 100;
            const glareY = (y / h) * 100;
            this.glareEl.style.transform = `rotate(180deg) translate(-50%, -50%) translate(${glareX}%, ${glareY}%)`;
            this.glareEl.style.opacity = '1';
        }
    }

    onMouseLeave() {
        this.element.style.transition = 'transform 0.5s ease-out'; // Smooth return
        this.element.style.transform = `perspective(${this.settings.perspective}px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        if (this.glareEl) {
            this.glareEl.style.opacity = '0';
        }
    }
}

// 2. THREE.JS ANIMATION (Wholesale Banner)
const visualApp = {
    init: () => {
        // Init Tilt on startup elements
        visualApp.applyTilt();

        // Init Three.js if banner exists
        if (document.getElementById('wholesale-canvas')) {
            visualApp.initThreeJS();
        }

        // Observer for new elements (Product Cards added dynamically)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.classList && node.classList.contains('product-card')) {
                            new VanillaTilt(node);
                        }
                    });
                }
            });
        });

        const productContainer = document.getElementById('products-grid');
        if (productContainer) {
            observer.observe(productContainer, { childList: true });
        }
    },

    applyTilt: () => {
        const targets = document.querySelectorAll('.hero-side, .auth-card, .feature-item');
        targets.forEach(el => new VanillaTilt(el));
    },

    initThreeJS: () => {
        const container = document.getElementById('wholesale-banner');
        const canvas = document.getElementById('wholesale-canvas');

        if (!container || !canvas) return;

        // Scene Setup
        const scene = new THREE.Scene();
        // background handled by CSS transparent

        // Camera
        const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Geometries
        // 1. Wireframe Torus
        const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xd4af37, // Gold
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        const torus = new THREE.Mesh(geometry, material);
        torus.scale.set(0.2, 0.2, 0.2);
        scene.add(torus);

        // 2. Particles
        const particlesGeom = new THREE.BufferGeometry();
        const particlesCount = 200;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 15;
        }

        particlesGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMat = new THREE.PointsMaterial({
            size: 0.05,
            color: 0xffffff,
            transparent: true,
            opacity: 0.5
        });
        const particlesMesh = new THREE.Points(particlesGeom, particlesMat);
        scene.add(particlesMesh);

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);

            torus.rotation.x += 0.005;
            torus.rotation.y += 0.005;

            particlesMesh.rotation.y -= 0.002;

            // Mouse interaction (optional parallax)
            // ...

            renderer.render(scene, camera);
        };

        animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        });
    }
};

// Start when content loads
document.addEventListener('DOMContentLoaded', visualApp.init);
