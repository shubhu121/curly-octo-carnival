import * as THREE from 'three';

export interface CameraPreset {
  name: string;
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
}

export class CameraSystem {
  private camera: THREE.PerspectiveCamera;
  private originalTarget: THREE.Vector3;
  private currentPresetIndex: number = 0;

  private static presets: CameraPreset[] = [
    {
      name: "Default View",
      position: new THREE.Vector3(0, 0, 5),
      target: new THREE.Vector3(0, 0, 0),
      fov: 50
    },
    {
      name: "Close-up",
      position: new THREE.Vector3(0, 0, 3),
      target: new THREE.Vector3(0, 0, 0),
      fov: 45
    },
    {
      name: "Wide Angle",
      position: new THREE.Vector3(0, 0, 8),
      target: new THREE.Vector3(0, 0, 0),
      fov: 65
    },
    {
      name: "Top View",
      position: new THREE.Vector3(0, 6, 2),
      target: new THREE.Vector3(0, 0, 0),
      fov: 50
    },
    {
      name: "Side Profile",
      position: new THREE.Vector3(6, 0, 0),
      target: new THREE.Vector3(0, 0, 0),
      fov: 50
    },
    {
      name: "Dramatic Angle",
      position: new THREE.Vector3(4, 3, 4),
      target: new THREE.Vector3(0, 0, 0),
      fov: 40
    },
    {
      name: "Ring Focus",
      position: new THREE.Vector3(2, 0.2, 3),
      target: new THREE.Vector3(0, 0, 0),
      fov: 35
    },
    {
      name: "Moon Perspective",
      position: new THREE.Vector3(8, 2, 8),
      target: new THREE.Vector3(0, 0, 0),
      fov: 55
    }
  ];

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.originalTarget = new THREE.Vector3(0, 0, 0);
  }

  public static getPresetNames(): string[] {
    return this.presets.map(preset => preset.name);
  }

  public applyPreset(presetIndex: number): void {
    if (presetIndex < 0 || presetIndex >= CameraSystem.presets.length) {
      return;
    }

    const preset = CameraSystem.presets[presetIndex];
    this.currentPresetIndex = presetIndex;

    // Smooth transition to new camera position
    this.smoothTransition(preset);
  }

  public getCurrentPresetIndex(): number {
    return this.currentPresetIndex;
  }

  public zoomIn(factor: number = 0.1): void {
    const direction = new THREE.Vector3()
      .subVectors(this.originalTarget, this.camera.position)
      .normalize()
      .multiplyScalar(factor);
    
    this.camera.position.add(direction);
  }

  public zoomOut(factor: number = 0.1): void {
    const direction = new THREE.Vector3()
      .subVectors(this.camera.position, this.originalTarget)
      .normalize()
      .multiplyScalar(factor);
    
    this.camera.position.add(direction);
  }

  public orbitHorizontal(angle: number): void {
    const radius = this.camera.position.distanceTo(this.originalTarget);
    const currentAngle = Math.atan2(this.camera.position.z, this.camera.position.x);
    const newAngle = currentAngle + angle;
    
    this.camera.position.x = Math.cos(newAngle) * radius;
    this.camera.position.z = Math.sin(newAngle) * radius;
    this.camera.lookAt(this.originalTarget);
  }

  public orbitVertical(angle: number): void {
    const distance = this.camera.position.distanceTo(this.originalTarget);
    const currentElevation = Math.asin(this.camera.position.y / distance);
    const newElevation = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, currentElevation + angle));
    
    const horizontalDistance = distance * Math.cos(newElevation);
    const currentHorizontalAngle = Math.atan2(this.camera.position.z, this.camera.position.x);
    
    this.camera.position.x = Math.cos(currentHorizontalAngle) * horizontalDistance;
    this.camera.position.y = distance * Math.sin(newElevation);
    this.camera.position.z = Math.sin(currentHorizontalAngle) * horizontalDistance;
    this.camera.lookAt(this.originalTarget);
  }

  public setFOV(fov: number): void {
    this.camera.fov = Math.max(10, Math.min(120, fov));
    this.camera.updateProjectionMatrix();
  }

  public getFOV(): number {
    return this.camera.fov;
  }

  public resetToDefault(): void {
    this.applyPreset(0);
  }

  private smoothTransition(preset: CameraPreset): void {
    const startPosition = this.camera.position.clone();
    const startFov = this.camera.fov;
    const duration = 1000; // 1 second transition
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-in-out)
      const eased = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - 2 * (1 - progress) * (1 - progress);

      // Interpolate position
      this.camera.position.lerpVectors(startPosition, preset.position, eased);
      
      // Interpolate FOV
      this.camera.fov = startFov + (preset.fov - startFov) * eased;
      this.camera.updateProjectionMatrix();
      
      // Always look at target
      this.camera.lookAt(preset.target);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  public enableAutoOrbit(speed: number = 0.01): void {
    const autoOrbitInterval = setInterval(() => {
      this.orbitHorizontal(speed);
    }, 16); // ~60fps

    // Store interval ID for potential cleanup
    (this as any).autoOrbitInterval = autoOrbitInterval;
  }

  public disableAutoOrbit(): void {
    if ((this as any).autoOrbitInterval) {
      clearInterval((this as any).autoOrbitInterval);
      (this as any).autoOrbitInterval = null;
    }
  }

  public screenToWorld(x: number, y: number, renderer: THREE.WebGLRenderer): THREE.Vector3 {
    const mouse = new THREE.Vector2();
    const rect = renderer.domElement.getBoundingClientRect();
    
    mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((y - rect.top) / rect.height) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    
    // Return point at planet distance
    const planetDistance = 5;
    return raycaster.ray.at(planetDistance, new THREE.Vector3());
  }
}
