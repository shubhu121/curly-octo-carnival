import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PlanetSettings } from '@/react-app/pages/Terraformer';
import { NoiseGenerator } from '@/react-app/utils/NoiseGenerator';
import { ColorPalettes } from '@/react-app/utils/ColorPalettes';
import { BackgroundGenerator } from '@/react-app/utils/BackgroundGenerator';
import { AudioSystem } from '@/react-app/utils/AudioSystem';
import { VideoRecorder, VideoExportOptions } from '@/react-app/utils/VideoRecorder';
import { CameraSystem } from '@/react-app/utils/CameraSystem';
import { TemporalEvolution, TemporalSettings } from '@/react-app/utils/TemporalEvolution';
import { WeatherSystem } from '@/react-app/utils/WeatherSystem';

interface PlanetRendererProps {
  settings: PlanetSettings;
}

export default function PlanetRenderer({ settings }: PlanetRendererProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const planetRef = useRef<THREE.Mesh | null>(null);
  const atmosphereRef = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const ringsRef = useRef<THREE.Mesh | null>(null);
  const moonRef = useRef<THREE.Mesh | null>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const isAnimatingRef = useRef<boolean>(true);
  const lightRef = useRef<THREE.DirectionalLight | null>(null);
  const dayNightTimeRef = useRef<number>(0);
  const backgroundObjectsRef = useRef<THREE.Object3D[]>([]);
  const moonOrbitAngleRef = useRef<number>(0);
  const audioSystemRef = useRef<AudioSystem | null>(null);
  const videoRecorderRef = useRef<VideoRecorder | null>(null);
  const cameraSystemRef = useRef<CameraSystem | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const temporalEvolutionRef = useRef<TemporalEvolution | null>(null);
  const weatherSystemRef = useRef<WeatherSystem | null>(null);
  const temporalEffectsRef = useRef<THREE.Object3D[]>([]);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const temporalDisplayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Initialize camera system
    cameraSystemRef.current = new CameraSystem(camera);

    // Enhanced renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Initialize audio system
    audioSystemRef.current = new AudioSystem();

    // Initialize video recorder
    videoRecorderRef.current = new VideoRecorder();

    // Initialize temporal evolution system
    temporalEvolutionRef.current = new TemporalEvolution(settings);
    
    // Initialize weather system
    weatherSystemRef.current = new WeatherSystem(settings.seed);

    // Create temporal display overlay
    createTemporalDisplay();

    // Create background
    backgroundObjectsRef.current = BackgroundGenerator.createBackground(scene, settings.backgroundType);

    // Create particle system
    createParticleSystem(scene);

    // Create planet
    createPlanet(scene);

    // Create atmosphere
    createAtmosphere(scene);

    // Create clouds
    createClouds(scene);

    // Create rings if enabled
    if (settings.hasRings) {
      createRings(scene);
    }

    // Create moon if enabled
    if (settings.hasMoon) {
      createMoon(scene);
    }

    mountRef.current.appendChild(renderer.domElement);

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      if (!isAnimatingRef.current) return;
      
      frameRef.current = requestAnimationFrame(animate);
      
      // Update temporal systems
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastUpdateTimeRef.current) / 1000; // Convert to seconds
      lastUpdateTimeRef.current = currentTime;
      
      if (temporalEvolutionRef.current && weatherSystemRef.current && !settings.temporalPaused) {
        const temporalSettings: TemporalSettings = {
          geologicalTime: settings.geologicalTime,
          weatherCycle: settings.weatherCycle,
          climaticShift: settings.climaticShift,
          erosionLevel: settings.erosionLevel,
          timeSpeed: settings.timeSpeed,
          isPaused: settings.temporalPaused,
          showTemporalEffects: settings.showTemporalEffects,
          tectonicActivity: settings.tectonicActivity,
          oceanLevel: settings.oceanLevel,
          atmosphericEvolution: settings.atmosphericEvolution
        };
        
        temporalEvolutionRef.current.updateTime(deltaTime, temporalSettings);
        weatherSystemRef.current.update(deltaTime, temporalSettings.timeSpeed);
        
        // Update temporal display
        updateTemporalDisplay();
        
        // Update temporal effects
        if (settings.showTemporalEffects && sceneRef.current) {
          updateTemporalEffects(temporalSettings);
        }
      }
      
      // Only animate if not paused
      if (!settings.animationPaused) {
        // Rotate planet
        if (planetRef.current) {
          planetRef.current.rotation.y += 0.005 * settings.rotationSpeed;
        }
        
        // Rotate clouds faster
        if (cloudsRef.current) {
          cloudsRef.current.rotation.y += 0.008 * settings.rotationSpeed;
        }
        
        // Rotate rings
        if (ringsRef.current && settings.hasRings) {
          ringsRef.current.rotation.z += 0.003 * settings.rotationSpeed;
        }
        
        // Animate moon orbit
        if (moonRef.current && settings.hasMoon) {
          moonOrbitAngleRef.current += 0.02 * settings.rotationSpeed;
          const moonDistance = 4 + settings.moonSize * 2;
          moonRef.current.position.x = Math.cos(moonOrbitAngleRef.current) * moonDistance;
          moonRef.current.position.z = Math.sin(moonOrbitAngleRef.current) * moonDistance;
          moonRef.current.rotation.y += 0.01 * settings.rotationSpeed;
        }
        
        // Day/night cycle
        if (settings.dayNightCycle && lightRef.current) {
          dayNightTimeRef.current += 0.01;
          const lightX = Math.cos(dayNightTimeRef.current) * 5;
          const lightZ = Math.sin(dayNightTimeRef.current) * 5;
          lightRef.current.position.set(lightX, 3, lightZ);
        }

        // Animate background objects
        backgroundObjectsRef.current.forEach((obj, index) => {
          if (obj.userData.isBackground) {
            obj.rotation.y += 0.001 * (index % 3 + 1) * settings.rotationSpeed;
          }
        });

        // Animate particles
        if (particleSystemRef.current && settings.particleEffects) {
          particleSystemRef.current.rotation.y += 0.0005 * settings.rotationSpeed;
          particleSystemRef.current.rotation.x += 0.0002 * settings.rotationSpeed;
        }
      }
      
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    
    // Start animation
    isAnimatingRef.current = true;
    animate();

    // Export functionality
    const handleExport = () => {
      if (!renderer || !scene || !camera) return;
      
      // Render at high resolution
      const originalSize = renderer.getSize(new THREE.Vector2());
      const exportWidth = 2560;
      const exportHeight = 1440;
      
      renderer.setSize(exportWidth, exportHeight);
      camera.aspect = exportWidth / exportHeight;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      
      // Create download link
      const canvas = renderer.domElement;
      const link = document.createElement('a');
      link.download = `terraformer-planet-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      // Restore original size
      renderer.setSize(originalSize.x, originalSize.y);
      camera.aspect = originalSize.x / originalSize.y;
      camera.updateProjectionMatrix();
    };

    // Video export functionality
    const handleVideoExport = async () => {
      if (!renderer || !videoRecorderRef.current) return;
      
      try {
        const canvas = renderer.domElement;
        const videoOptions: VideoExportOptions = {
          duration: 10,
          quality: 'high',
          fps: 30,
          format: 'webm'
        };

        await videoRecorderRef.current.startRecording(canvas, videoOptions);
      } catch (error) {
        console.error('Error starting video recording:', error);
      }
    };

    window.addEventListener('exportPlanet', handleExport);
    window.addEventListener('exportVideo', handleVideoExport);
    
    // Temporal control handlers
    const handleFastForward = () => {
      if (temporalEvolutionRef.current) {
        temporalEvolutionRef.current.fastForward(1000000); // Fast forward 1M years
      }
    };
    
    const handleResetTime = () => {
      if (temporalEvolutionRef.current) {
        temporalEvolutionRef.current.resetTime();
      }
      if (weatherSystemRef.current) {
        weatherSystemRef.current.reset();
      }
    };
    
    window.addEventListener('fastForward', handleFastForward);
    window.addEventListener('resetTime', handleResetTime);

    return () => {
      isAnimatingRef.current = false;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('exportPlanet', handleExport);
      window.removeEventListener('exportVideo', handleVideoExport);
      window.removeEventListener('fastForward', handleFastForward);
      window.removeEventListener('resetTime', handleResetTime);
      
      // Clean up audio system
      if (audioSystemRef.current) {
        audioSystemRef.current.stopCurrentTrack();
      }

      // Clean up camera system auto orbit
      if (cameraSystemRef.current) {
        cameraSystemRef.current.disableAutoOrbit();
      }

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update planet when settings change
  useEffect(() => {
    if (sceneRef.current && planetRef.current && atmosphereRef.current && cloudsRef.current) {
      // Get temporally evolved settings if temporal evolution is active
      let effectiveSettings = settings;
      if (temporalEvolutionRef.current && settings.geologicalTime > 0) {
        const temporalSettings: TemporalSettings = {
          geologicalTime: settings.geologicalTime,
          weatherCycle: settings.weatherCycle,
          climaticShift: settings.climaticShift,
          erosionLevel: settings.erosionLevel,
          timeSpeed: settings.timeSpeed,
          isPaused: settings.temporalPaused,
          showTemporalEffects: settings.showTemporalEffects,
          tectonicActivity: settings.tectonicActivity,
          oceanLevel: settings.oceanLevel,
          atmosphericEvolution: settings.atmosphericEvolution
        };
        effectiveSettings = temporalEvolutionRef.current.getTemporallyEvolvedSettings(temporalSettings);
      }
      
      updatePlanet(effectiveSettings);
      updateAudioSystem();
      updateCameraSystem();
      updateVisualEffects();
    }
    
    // Reinitialize temporal systems if seed changed
    if (temporalEvolutionRef.current && weatherSystemRef.current) {
      temporalEvolutionRef.current = new TemporalEvolution(settings);
      weatherSystemRef.current = new WeatherSystem(settings.seed);
    }
  }, [settings]);

  const createParticleSystem = (scene: THREE.Scene) => {
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Create particles in a sphere around the planet
      const radius = 8 + Math.random() * 20;
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;

      positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.cos(theta);

      // Random colors for cosmic dust
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.3 + 0.6, 0.8, 0.5 + Math.random() * 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData.isParticleSystem = true;
    particleSystemRef.current = particles;
    scene.add(particles);
  };

  const updateAudioSystem = () => {
    if (!audioSystemRef.current) return;

    if (settings.audioEnabled) {
      audioSystemRef.current.setVolume(settings.audioVolume);
      if (!audioSystemRef.current.isPlayingStatus()) {
        audioSystemRef.current.playTrack(settings.audioTrack);
      } else if (audioSystemRef.current.getCurrentTrackIndex() !== settings.audioTrack) {
        audioSystemRef.current.playTrack(settings.audioTrack);
      }
    } else {
      audioSystemRef.current.stopCurrentTrack();
    }
  };

  const updateCameraSystem = () => {
    if (!cameraSystemRef.current) return;

    // Apply camera preset
    cameraSystemRef.current.applyPreset(settings.cameraPreset);

    // Handle auto orbit
    if (settings.autoOrbit) {
      cameraSystemRef.current.enableAutoOrbit(0.005);
    } else {
      cameraSystemRef.current.disableAutoOrbit();
    }
  };

  const updateVisualEffects = () => {
    if (!sceneRef.current) return;

    // Update particle visibility
    if (particleSystemRef.current) {
      particleSystemRef.current.visible = settings.particleEffects;
    }

    // Update planet scale
    if (planetRef.current) {
      planetRef.current.scale.setScalar(settings.planetSize);
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.scale.setScalar(settings.planetSize);
    }
    if (cloudsRef.current) {
      cloudsRef.current.scale.setScalar(settings.planetSize);
    }
    if (ringsRef.current) {
      ringsRef.current.scale.setScalar(settings.planetSize);
    }
  };

  const createPlanet = (scene: THREE.Scene) => {
    // Higher resolution geometry for better quality
    const geometry = new THREE.SphereGeometry(1.5, 128, 64);
    const material = new THREE.MeshPhongMaterial({ 
      map: generatePlanetTexture(),
      shininess: 5,
      specular: 0x111111
    });
    
    const planet = new THREE.Mesh(geometry, material);
    planet.castShadow = true;
    planet.receiveShadow = true;
    planetRef.current = planet;
    scene.add(planet);

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 3, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    lightRef.current = directionalLight;
    scene.add(directionalLight);

    // Rim lighting
    const rimLight = new THREE.DirectionalLight(0x4499ff, 0.5);
    rimLight.position.set(-3, 2, -3);
    scene.add(rimLight);
  };

  const createAtmosphere = (scene: THREE.Scene) => {
    const geometry = new THREE.SphereGeometry(1.58, 64, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    
    const atmosphere = new THREE.Mesh(geometry, material);
    atmosphereRef.current = atmosphere;
    scene.add(atmosphere);
  };

  const createClouds = (scene: THREE.Scene) => {
    const geometry = new THREE.SphereGeometry(1.52, 64, 32);
    const material = new THREE.MeshLambertMaterial({
      map: generateCloudTexture(),
      transparent: true,
      opacity: 0.6
    });
    
    const clouds = new THREE.Mesh(geometry, material);
    clouds.castShadow = true;
    clouds.receiveShadow = true;
    cloudsRef.current = clouds;
    scene.add(clouds);
  };

  const createRings = (scene: THREE.Scene) => {
    const ringGeometry = new THREE.RingGeometry(2.2, 3.5, 64);
    const ringMaterial = new THREE.MeshLambertMaterial({
      map: generateRingTexture(),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    const rings = new THREE.Mesh(ringGeometry, ringMaterial);
    rings.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    rings.castShadow = true;
    rings.receiveShadow = true;
    ringsRef.current = rings;
    scene.add(rings);
  };

  const createMoon = (scene: THREE.Scene) => {
    const moonRadius = 0.2 + settings.moonSize * 0.3;
    const geometry = new THREE.SphereGeometry(moonRadius, 32, 16);
    const material = new THREE.MeshPhongMaterial({ 
      map: generateMoonTexture(),
      shininess: 1
    });
    
    const moon = new THREE.Mesh(geometry, material);
    const moonDistance = 4 + settings.moonSize * 2;
    moon.position.set(moonDistance, 0, 0);
    moon.castShadow = true;
    moon.receiveShadow = true;
    moonRef.current = moon;
    scene.add(moon);
  };

  const generatePlanetTexture = (planetSettings: PlanetSettings = settings) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; // Higher resolution
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const noise = new NoiseGenerator(planetSettings.seed);
    const palette = ColorPalettes.getPalette(planetSettings.climate);
    
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const u = x / canvas.width;
        const v = y / canvas.height;
        
        // Convert to spherical coordinates
        const theta = u * Math.PI * 2;
        const phi = v * Math.PI;
        
        const sphereX = Math.sin(phi) * Math.cos(theta);
        const sphereY = Math.sin(phi) * Math.sin(theta);
        const sphereZ = Math.cos(phi);
        
        // Generate base terrain noise with more detail
        const scale1 = planetSettings.coastlineComplexity * 4 + 1;
        const scale2 = planetSettings.coastlineComplexity * 8 + 2;
        const scale3 = planetSettings.mountainDensity * 16 + 4;
        const scale4 = planetSettings.mountainDensity * 32 + 8;
        
        let height = 0;
        height += noise.noise(sphereX * scale1, sphereY * scale1, sphereZ * scale1) * 0.4;
        height += noise.noise(sphereX * scale2, sphereY * scale2, sphereZ * scale2) * 0.25;
        height += noise.noise(sphereX * scale3, sphereY * scale3, sphereZ * scale3) * 0.15 * planetSettings.mountainDensity;
        height += noise.noise(sphereX * scale4, sphereY * scale4, sphereZ * scale4) * 0.1 * planetSettings.mountainDensity;
        
        // Adjust for land/water ratio
        height = (height + 1) / 2; // Normalize to 0-1
        
        const seaLevel = 1 - planetSettings.landWaterRatio;
        const color = palette.getColor(height, seaLevel);
        
        const index = (y * canvas.width + x) * 4;
        imageData.data[index] = color.r;
        imageData.data[index + 1] = color.g;
        imageData.data[index + 2] = color.b;
        imageData.data[index + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  };

  const generateCloudTexture = (planetSettings: PlanetSettings = settings) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; // Higher resolution
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const noise = new NoiseGenerator(planetSettings.seed + 1000);
    
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const u = x / canvas.width;
        const v = y / canvas.height;
        
        const theta = u * Math.PI * 2;
        const phi = v * Math.PI;
        
        const sphereX = Math.sin(phi) * Math.cos(theta);
        const sphereY = Math.sin(phi) * Math.sin(theta);
        const sphereZ = Math.cos(phi);
        
        let cloudDensity = 0;
        cloudDensity += noise.noise(sphereX * 3, sphereY * 3, sphereZ * 3) * 0.5;
        cloudDensity += noise.noise(sphereX * 6, sphereY * 6, sphereZ * 6) * 0.25;
        cloudDensity += noise.noise(sphereX * 12, sphereY * 12, sphereZ * 12) * 0.125;
        cloudDensity += noise.noise(sphereX * 24, sphereY * 24, sphereZ * 24) * 0.0625;
        
        cloudDensity = Math.max(0, (cloudDensity + 0.3) * 1.5);
        const alpha = Math.min(255, cloudDensity * 255 * planetSettings.clouds);
        
        const index = (y * canvas.width + x) * 4;
        imageData.data[index] = 255;
        imageData.data[index + 1] = 255;
        imageData.data[index + 2] = 255;
        imageData.data[index + 3] = alpha;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  };

  const generateRingTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const noise = new NoiseGenerator(settings.seed + 2000);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy) / centerX;
        const angle = Math.atan2(dy, dx);
        
        if (distance < 0.4 || distance > 0.9) {
          // Transparent areas
          const index = (y * canvas.width + x) * 4;
          imageData.data[index] = 0;
          imageData.data[index + 1] = 0;
          imageData.data[index + 2] = 0;
          imageData.data[index + 3] = 0;
        } else {
          // Ring material
          const ringNoise = noise.noise(Math.cos(angle) * 10, Math.sin(angle) * 10, distance * 20);
          const density = (ringNoise + 1) / 2 * settings.ringDensity;
          
          const baseColor = settings.climate < 0.5 ? 
            { r: 150, g: 130, b: 100 } : 
            { r: 180, g: 160, b: 140 };
          
          const index = (y * canvas.width + x) * 4;
          imageData.data[index] = baseColor.r * density;
          imageData.data[index + 1] = baseColor.g * density;
          imageData.data[index + 2] = baseColor.b * density;
          imageData.data[index + 3] = density * 255;
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  const generateMoonTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const noise = new NoiseGenerator(settings.seed + 3000);
    
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const u = x / canvas.width;
        const v = y / canvas.height;
        
        const theta = u * Math.PI * 2;
        const phi = v * Math.PI;
        
        const sphereX = Math.sin(phi) * Math.cos(theta);
        const sphereY = Math.sin(phi) * Math.sin(theta);
        const sphereZ = Math.cos(phi);
        
        let height = 0;
        height += noise.noise(sphereX * 4, sphereY * 4, sphereZ * 4) * 0.5;
        height += noise.noise(sphereX * 8, sphereY * 8, sphereZ * 8) * 0.25;
        height += noise.noise(sphereX * 16, sphereY * 16, sphereZ * 16) * 0.125;
        
        height = (height + 1) / 2;
        
        // Moon-like grayscale coloring
        const brightness = 0.3 + height * 0.4;
        const color = Math.floor(brightness * 255);
        
        const index = (y * canvas.width + x) * 4;
        imageData.data[index] = color;
        imageData.data[index + 1] = color;
        imageData.data[index + 2] = color;
        imageData.data[index + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  };

  const createTemporalDisplay = () => {
    if (mountRef.current) {
      const display = document.createElement('div');
      display.className = 'absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white p-3 rounded-lg text-xs font-mono z-10';
      display.style.minWidth = '200px';
      temporalDisplayRef.current = display;
      mountRef.current.appendChild(display);
    }
  };

  const updateTemporalDisplay = () => {
    if (!temporalDisplayRef.current || !temporalEvolutionRef.current || !weatherSystemRef.current) return;
    
    const timeDescription = temporalEvolutionRef.current.getTimeDescription();
    const epochName = temporalEvolutionRef.current.getEpochName();
    const weatherStats = weatherSystemRef.current.getWeatherStats();
    
    temporalDisplayRef.current.innerHTML = `
      <div class="space-y-1">
        <div class="text-cyan-300 font-bold">4D Evolution Status</div>
        <div>Time: ${timeDescription}</div>
        <div>Era: ${epochName}</div>
        <div>Storms: ${weatherStats.activeStorms}</div>
        <div>Clouds: ${Math.round(weatherStats.averageCloudCover * 100)}%</div>
        <div>Wind: ${Math.round(weatherStats.globalWindSpeed * 100)}%</div>
      </div>
    `;
  };

  const updateTemporalEffects = (temporalSettings: TemporalSettings) => {
    if (!sceneRef.current || !weatherSystemRef.current || !temporalEvolutionRef.current) return;
    
    // Clear existing temporal effects
    temporalEffectsRef.current.forEach(effect => {
      sceneRef.current!.remove(effect);
    });
    temporalEffectsRef.current = [];
    
    // Create weather effects
    const weatherEffects = weatherSystemRef.current.createStormVisualEffects(sceneRef.current);
    temporalEffectsRef.current.push(...weatherEffects);
    
    // Create temporal evolution effects
    const temporalEffects = temporalEvolutionRef.current.getTemporalEffects(temporalSettings);
    
    if (temporalEffects.auroras) {
      createAuroraEffect();
    }
    
    if (temporalEffects.meteorShowers) {
      createMeteorShowerEffect();
    }
    
    if (temporalEffects.lightningStorms) {
      createLightningEffect();
    }
  };

  const createAuroraEffect = () => {
    if (!sceneRef.current) return;
    
    const auroraGeometry = new THREE.PlaneGeometry(1, 2);
    const auroraMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.4 + Math.random() * 0.3, 0.8, 0.6),
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    
    const aurora = new THREE.Mesh(auroraGeometry, auroraMaterial);
    aurora.position.set(0, 2.2, 0);
    aurora.rotation.x = Math.PI / 2;
    aurora.userData.isTemporalEffect = true;
    sceneRef.current.add(aurora);
    temporalEffectsRef.current.push(aurora);
  };

  const createMeteorShowerEffect = () => {
    if (!sceneRef.current) return;
    
    for (let i = 0; i < 5; i++) {
      const meteorGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const meteorMaterial = new THREE.MeshPhongMaterial({
        color: 0xffaa44,
        emissive: 0xffaa44,
        emissiveIntensity: 0.5
      });
      
      const meteor = new THREE.Mesh(meteorGeometry, meteorMaterial);
      meteor.position.set(
        (Math.random() - 0.5) * 10,
        5 + Math.random() * 5,
        (Math.random() - 0.5) * 10
      );
      
      // Add trail effect
      const trailGeometry = new THREE.CylinderGeometry(0.001, 0.01, 0.5);
      const trailMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa44,
        transparent: true,
        opacity: 0.6
      });
      
      const trail = new THREE.Mesh(trailGeometry, trailMaterial);
      meteor.add(trail);
      
      meteor.userData.isTemporalEffect = true;
      sceneRef.current.add(meteor);
      temporalEffectsRef.current.push(meteor);
    }
  };

  const createLightningEffect = () => {
    if (!sceneRef.current) return;
    
    const lightningGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.5, 3);
    const lightningMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      emissive: 0xaaccff,
      emissiveIntensity: 0.5
    });
    
    const lightning = new THREE.Mesh(lightningGeometry, lightningMaterial);
    lightning.position.set(
      (Math.random() - 0.5) * 3,
      1.8,
      (Math.random() - 0.5) * 3
    );
    
    lightning.userData.isTemporalEffect = true;
    sceneRef.current.add(lightning);
    temporalEffectsRef.current.push(lightning);
    
    // Remove lightning after brief flash
    setTimeout(() => {
      if (sceneRef.current && lightning) {
        sceneRef.current.remove(lightning);
        const index = temporalEffectsRef.current.indexOf(lightning);
        if (index > -1) {
          temporalEffectsRef.current.splice(index, 1);
        }
      }
    }, 200);
  };

  const updatePlanet = (effectiveSettings: PlanetSettings = settings) => {
    if (!sceneRef.current) return;
    if (!planetRef.current || !atmosphereRef.current || !cloudsRef.current) return;
    
    // Update background
    backgroundObjectsRef.current = BackgroundGenerator.createBackground(sceneRef.current, settings.backgroundType);
    
    // Update planet texture using effective settings
    const planetMaterial = planetRef.current.material as THREE.MeshPhongMaterial;
    const oldTexture = planetMaterial.map;
    planetMaterial.map = generatePlanetTexture(effectiveSettings);
    planetMaterial.needsUpdate = true;
    if (oldTexture) oldTexture.dispose();
    
    // Update cloud texture using effective settings
    const cloudMaterial = cloudsRef.current.material as THREE.MeshLambertMaterial;
    const oldCloudTexture = cloudMaterial.map;
    cloudMaterial.map = generateCloudTexture(effectiveSettings);
    cloudMaterial.opacity = effectiveSettings.clouds;
    cloudMaterial.needsUpdate = true;
    if (oldCloudTexture) oldCloudTexture.dispose();
    
    // Update atmosphere using effective settings
    const atmosphereMaterial = atmosphereRef.current.material as THREE.MeshBasicMaterial;
    const palette = ColorPalettes.getPalette(effectiveSettings.climate);
    atmosphereMaterial.color.setHex(palette.atmosphereColor);
    atmosphereMaterial.opacity = effectiveSettings.atmosphere * 0.3;
    
    // Scale atmosphere using effective settings
    atmosphereRef.current.scale.setScalar(1 + effectiveSettings.atmosphere * 0.1);

    // Handle rings
    if (settings.hasRings && !ringsRef.current) {
      createRings(sceneRef.current);
    } else if (!settings.hasRings && ringsRef.current) {
      sceneRef.current.remove(ringsRef.current);
      ringsRef.current = null;
    } else if (ringsRef.current) {
      // Update ring texture
      const ringMaterial = ringsRef.current.material as THREE.MeshLambertMaterial;
      const oldRingTexture = ringMaterial.map;
      ringMaterial.map = generateRingTexture();
      ringMaterial.needsUpdate = true;
      if (oldRingTexture) oldRingTexture.dispose();
    }

    // Handle moon
    if (settings.hasMoon && !moonRef.current) {
      createMoon(sceneRef.current);
    } else if (!settings.hasMoon && moonRef.current) {
      sceneRef.current.remove(moonRef.current);
      moonRef.current = null;
    } else if (moonRef.current) {
      // Update moon size and texture
      sceneRef.current.remove(moonRef.current);
      createMoon(sceneRef.current);
    }
  };

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full bg-black relative"
    />
  );
}
