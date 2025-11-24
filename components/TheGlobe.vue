<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, nextTick } from 'vue';
import { LOCATIONS } from './locations';

const globeDiv = ref<HTMLElement | null>(null);
let globeInstance: any = null;
let composer: any = null;
let animationId: number | null = null;
let satelliteGroup: any = null;
let blinkLight: any = null;

onMounted(async () => {
    await nextTick();
    if (!globeDiv.value) return;

    const globeModule = await import('globe.gl');
    const THREE = await import('three');
    const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
    const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
    const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');

    const Globe = globeModule.default || globeModule;

    const CONFIG = {
        dayUrl: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
        bumpUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
        waterUrl: '//unpkg.com/three-globe/example/img/earth-water.png',
    };

    // Initialize Globe
    globeInstance = new Globe(globeDiv.value)
        .width(globeDiv.value.offsetWidth)
        .height(globeDiv.value.offsetHeight)
        .globeImageUrl(CONFIG.dayUrl)
        .bumpImageUrl(CONFIG.bumpUrl)
        .backgroundImageUrl(null)
        .backgroundColor('rgba(0,0,0,0)')
        .showAtmosphere(true)
        .atmosphereColor('rgba(0, 122, 255, 0.15)')
        .atmosphereAltitude(0.09)
        .onGlobeReady(() => {
            if (globeDiv.value) globeDiv.value.style.opacity = '1';
        });
    
    // Set initial view to Middle East (centered on Iran/Persian Gulf region)
    globeInstance.pointOfView({ 
        lat: 27.1832,  // Latitude (Bandar Abbas - your home)
        lng: 56.2666,  // Longitude
        altitude: 2.5  // Camera distance
    }, 0); // 0ms = instant, no animation

    const renderer = globeInstance.renderer();
    const scene = globeInstance.scene();
    const camera = globeInstance.camera();

    // High-quality rendering settings
    renderer.setPixelRatio(window.devicePixelRatio); // Use full device pixel ratio for sharpness
    renderer.antialias = true;
    renderer.setClearColor(0x000000, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace; // Better color reproduction
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Cinematic tone mapping
    renderer.toneMappingExposure = 1.0;

    const globeMaterial = globeInstance.globeMaterial();
    
    // Load the Water Mask with enhanced properties
    new THREE.TextureLoader().load(CONFIG.waterUrl, (texture) => {
        globeMaterial.specularMap = texture;
        globeMaterial.specular = new THREE.Color(0x444444); // Slightly brighter for more definition
        globeMaterial.shininess = 8; // Subtle shine
        
        // Enhanced material properties for realism
        globeMaterial.roughness = 0.6; // Natural surface roughness
        globeMaterial.metalness = 0.1; // Slight metallic quality
        
        globeMaterial.needsUpdate = true;
    });

    globeMaterial.color = new THREE.Color(0xffffff);

    // 💡 PROFESSIONAL 3-POINT LIGHTING 💡
    // Key Light (Main directional light from upper-left)
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(-1, 0.5, 1);
    scene.add(keyLight);

    // Fill Light (Soft fill from opposite side)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(1, 0, -1);
    scene.add(fillLight);

    // Ambient Light (Subtle overall illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    addStarfield(THREE, scene);
    createSatellite(THREE, scene);
    addLocationMarkers();

    const controls = globeInstance.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2; // Smooth, deliberate rotation
    controls.enableDamping = true;
    controls.dampingFactor = 0.05; // Organic inertia
    controls.enableZoom = false;
    controls.enablePan = false;
    
    // Polar angle limits (prevents awkward top/bottom views)
    controls.minPolarAngle = Math.PI * 0.3; // 54 degrees from top
    controls.maxPolarAngle = Math.PI * 0.7; // 126 degrees from top
    
    // Smooth rotation limits
    controls.rotateSpeed = 0.5;
    controls.minDistance = 150;
    controls.maxDistance = 300;

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.3, 0.4, 0.9
    );
    composer.addPass(bloomPass);

    // Animation Loop
    function animate() {
        controls.update();

        if (satelliteGroup) {
            const time = Date.now() * 0.0005;
            const radius = 115;
            
            satelliteGroup.position.x = radius * Math.sin(time);
            satelliteGroup.position.y = radius * Math.cos(time);
            satelliteGroup.position.z = radius * Math.sin(time * 0.5);
            satelliteGroup.lookAt(0, 0, 0);

            if (blinkLight) {
                blinkLight.intensity = Math.sin(Date.now() * 0.005) > 0 ? 2 : 0;
            }
        }

        composer.render();
        animationId = requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', onResize);
});

// --- HELPER FUNCTIONS ---
function createSatellite(THREE: any, scene: any) {
    satelliteGroup = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(2, 2, 4);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.2, metalness: 1.0 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    satelliteGroup.add(body);

    const panelGeo = new THREE.BoxGeometry(12, 0.2, 3);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x111199, emissive: 0x111199, emissiveIntensity: 0.2, roughness: 0.1, metalness: 0.9 });
    const panels = new THREE.Mesh(panelGeo, panelMat);
    satelliteGroup.add(panels);

    const lightGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    blinkLight = new THREE.Mesh(lightGeo, lightMat);
    blinkLight.position.set(0, 2, 0);
    satelliteGroup.add(blinkLight);

    const pointLight = new THREE.PointLight(0xff0000, 1, 10);
    pointLight.position.set(0, 2, 0);
    satelliteGroup.add(pointLight);

    scene.add(satelliteGroup);
}

function addStarfield(THREE: any, scene: any) {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 10000;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const colors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2000;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
        sizes[i] = Math.random() * 1.5;
        
        // Natural color variations (white to slight blue/yellow tint)
        const colorVariation = 0.8 + Math.random() * 0.2;
        colors[i * 3] = colorVariation; // R
        colors[i * 3 + 1] = colorVariation; // G
        colors[i * 3 + 2] = colorVariation + Math.random() * 0.1; // B (slight blue tint)
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Create circular texture to make stars round instead of square
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.7,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        map: texture
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

function addLocationMarkers() {
    if (!globeInstance) return;

    globeInstance
        .htmlElementsData(LOCATIONS)
        .htmlAltitude(-0.035) // Negative value to push markers into the surface
        .htmlElement((d: any) => {
            const el = document.createElement('div');
            el.className = 'location-marker';
            
            if (d.type === 'current') {
                el.innerHTML = `
                    <div class="marker-container">
                        <div class="pin-wrapper">
                            <div class="radar-ring"></div>
                            <div class="pin-head current">
                                <svg viewBox="0 0 24 24" fill="currentColor" class="icon">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                                </svg>
                            </div>
                        </div>
                        <div class="label">${d.name}</div>
                    </div>`;
            } else if (d.type === 'home') {
                el.innerHTML = `
                    <div class="marker-container">
                        <div class="pin-head home">
                            <svg viewBox="0 0 24 24" fill="currentColor" class="icon">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                        </div>
                        <div class="label">${d.name}</div>
                    </div>`;
            } else {
                el.innerHTML = `
                    <div class="marker-container group">
                        <div class="star-dot"></div>
                        <div class="label small group-hover:opacity-100">${d.name}</div>
                    </div>`;
            }
            
            return el;
        });
}

onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
    if (animationId) cancelAnimationFrame(animationId);
    if (globeInstance) globeInstance._destructor?.();
    if (composer) composer.dispose?.();
});

function onResize() {
    if (globeInstance && globeDiv.value) {
        globeInstance.width(globeDiv.value.offsetWidth);
        globeInstance.height(globeDiv.value.offsetHeight);
        if (composer) composer.setSize(globeDiv.value.offsetWidth, globeDiv.value.offsetHeight);
    }
}
</script>

<template>
    <div class="absolute inset-0 z-0 bg-deep-space">
        <div ref="globeDiv"
            class="w-full h-full cursor-grab active:cursor-grabbing opacity-0 transition-opacity duration-1000 ease-in-out">
        </div>
        <div class="absolute inset-0 pointer-events-none bg-vignette"></div>
    </div>
</template>

<style scoped>
.bg-deep-space {
    background:
        radial-gradient(circle at 50% 50%, #1c1c1e 0%, #000000 90%),
        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
}
.bg-vignette {
    background: radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.4) 80%, rgba(0, 0, 0, 0.8) 100%);
}
</style>

<style>
/* ⚠️ GLOBAL STYLES FOR HTML MARKERS ⚠️ 
*/

.marker-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: auto;
    position: relative;
    cursor: pointer;
}

.marker-container:hover .label,
.marker-container:active .label {
    opacity: 1 !important;
}

/* Wrapper for pin with pulse */
.pin-wrapper {
    position: relative;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* --- ICONS --- */
.pin-head {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.2);
    transition: transform 0.2s ease;
}

.marker-container:hover .pin-head,
.marker-container:active .pin-head {
    transform: scale(1.15);
}

.pin-head .icon {
    width: 18px;
    height: 18px;
}

/* Home Color */
.pin-head.home {
    background: rgba(0, 122, 255, 0.8); /* Apple Blue */
}

/* Current Color */
.pin-head.current {
    background: rgba(255, 59, 48, 0.85); /* Apple Red */
}

/* Visited Star */
.star-dot {
    width: 6px;
    height: 6px;
    background-color: #ffd700; /* Gold */
    border-radius: 50%;
    box-shadow: 0 0 8px #ffd700;
    transition: transform 0.2s ease;
}

.marker-container:hover .star-dot,
.marker-container:active .star-dot {
    transform: scale(1.5);
}

/* --- LABELS --- */
.label {
    margin-top: 6px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(10px);
    padding: 4px 10px;
    border-radius: 10px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.label.small {
    font-size: 10px;
}

/* Show labels on hover and tap for mobile */
.marker-container:hover .label,
.marker-container:active .label {
    opacity: 1;
}

/* Mobile: Keep label visible after tap */
@media (hover: none) and (pointer: coarse) {
    .marker-container:active .label {
        opacity: 1;
    }
}

/* --- ANIMATION: RADAR PULSE (FOR BARCELONA) --- */
.radar-ring {
    position: absolute;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid rgba(255, 59, 48, 0.8);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pulse-ring 2s infinite ease-out;
}

@keyframes pulse-ring {
    0% { 
        transform: translate(-50%, -50%) scale(1); 
        opacity: 1; 
    }
    100% { 
        transform: translate(-50%, -50%) scale(2.5); 
        opacity: 0; 
    }
}
</style>