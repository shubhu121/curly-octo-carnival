import * as THREE from 'three';

export class BackgroundGenerator {
  static getBackgroundNames(): string[] {
    return [
      'Deep Space',
      'Nebula Field',
      'Galaxy Core',
      'Star Cluster',
      'Cosmic Dust',
      'Binary System',
      'Asteroid Belt',
      'Solar Flare'
    ];
  }

  static createBackground(scene: THREE.Scene, backgroundType: number): THREE.Object3D[] {
    // Remove existing backgrounds
    const objectsToRemove: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (child.userData.isBackground) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach(obj => scene.remove(obj));

    const backgroundObjects: THREE.Object3D[] = [];
    const normalizedType = Math.floor(backgroundType * 7.99); // 0-7

    switch (normalizedType) {
      case 0:
        backgroundObjects.push(...this.createDeepSpaceBackground(scene));
        break;
      case 1:
        backgroundObjects.push(...this.createNebulaBackground(scene));
        break;
      case 2:
        backgroundObjects.push(...this.createGalaxyCoreBackground(scene));
        break;
      case 3:
        backgroundObjects.push(...this.createStarClusterBackground(scene));
        break;
      case 4:
        backgroundObjects.push(...this.createCosmicDustBackground(scene));
        break;
      case 5:
        backgroundObjects.push(...this.createBinarySystemBackground(scene));
        break;
      case 6:
        backgroundObjects.push(...this.createAsteroidBeltBackground(scene));
        break;
      case 7:
        backgroundObjects.push(...this.createSolarFlareBackground(scene));
        break;
    }

    return backgroundObjects;
  }

  private static createDeepSpaceBackground(scene: THREE.Scene): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    
    // Dense star field
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      sizeAttenuation: false
    });

    const starVertices: number[] = [];
    for (let i = 0; i < 15000; i++) {
      const radius = 500 + Math.random() * 1500;
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    stars.userData.isBackground = true;
    scene.add(stars);
    objects.push(stars);

    return objects;
  }

  private static createNebulaBackground(scene: THREE.Scene): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    
    // Nebula clouds
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.SphereGeometry(300, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.7 + Math.random() * 0.3, 0.8, 0.3),
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
      });
      
      const nebula = new THREE.Mesh(geometry, material);
      nebula.position.set(
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000
      );
      nebula.userData.isBackground = true;
      scene.add(nebula);
      objects.push(nebula);
    }

    // Bright stars
    objects.push(...this.createStarField(scene, 8000, 2));
    
    return objects;
  }

  private static createGalaxyCoreBackground(scene: THREE.Scene): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    
    // Bright galactic center
    const coreGeometry = new THREE.SphereGeometry(200, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.2,
    });
    
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.set(0, 0, -800);
    core.userData.isBackground = true;
    scene.add(core);
    objects.push(core);

    // Spiral arms (simplified)
    for (let arm = 0; arm < 4; arm++) {
      const armGeometry = new THREE.BufferGeometry();
      const armVertices: number[] = [];
      
      for (let i = 0; i < 2000; i++) {
        const t = i / 2000;
        const angle = arm * Math.PI / 2 + t * Math.PI * 6;
        const radius = 300 + t * 500;
        
        const x = Math.cos(angle) * radius;
        const y = (Math.random() - 0.5) * 100;
        const z = Math.sin(angle) * radius - 800;
        
        armVertices.push(x, y, z);
      }
      
      armGeometry.setAttribute('position', new THREE.Float32BufferAttribute(armVertices, 3));
      const armMaterial = new THREE.PointsMaterial({
        color: 0xffffaa,
        size: 1,
        sizeAttenuation: false
      });
      
      const armStars = new THREE.Points(armGeometry, armMaterial);
      armStars.userData.isBackground = true;
      scene.add(armStars);
      objects.push(armStars);
    }
    
    return objects;
  }

  private static createStarClusterBackground(scene: THREE.Scene): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    
    // Multiple star clusters
    for (let cluster = 0; cluster < 5; cluster++) {
      const clusterCenter = new THREE.Vector3(
        (Math.random() - 0.5) * 1500,
        (Math.random() - 0.5) * 1500,
        (Math.random() - 0.5) * 1500
      );
      
      const clusterGeometry = new THREE.BufferGeometry();
      const clusterVertices: number[] = [];
      
      for (let i = 0; i < 1000; i++) {
        const distance = Math.random() * 200;
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        
        const x = clusterCenter.x + distance * Math.sin(theta) * Math.cos(phi);
        const y = clusterCenter.y + distance * Math.sin(theta) * Math.sin(phi);
        const z = clusterCenter.z + distance * Math.cos(theta);
        
        clusterVertices.push(x, y, z);
      }
      
      clusterGeometry.setAttribute('position', new THREE.Float32BufferAttribute(clusterVertices, 3));
      const clusterMaterial = new THREE.PointsMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.5, 0.8),
        size: 2 + Math.random() * 2,
        sizeAttenuation: false
      });
      
      const clusterStars = new THREE.Points(clusterGeometry, clusterMaterial);
      clusterStars.userData.isBackground = true;
      scene.add(clusterStars);
      objects.push(clusterStars);
    }
    
    return objects;
  }

  private static createCosmicDustBackground(scene: THREE.Scene): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    
    // Dust clouds
    const dustGeometry = new THREE.BufferGeometry();
    const dustVertices: number[] = [];
    const dustColors: number[] = [];
    
    for (let i = 0; i < 20000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      dustVertices.push(x, y, z);
      
      const color = new THREE.Color().setHSL(0.1, 0.8, 0.3 + Math.random() * 0.3);
      dustColors.push(color.r, color.g, color.b);
    }
    
    dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dustVertices, 3));
    dustGeometry.setAttribute('color', new THREE.Float32BufferAttribute(dustColors, 3));
    
    const dustMaterial = new THREE.PointsMaterial({
      size: 0.5,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });
    
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    dust.userData.isBackground = true;
    scene.add(dust);
    objects.push(dust);
    
    return objects;
  }

  private static createBinarySystemBackground(scene: THREE.Scene): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    
    // Two bright stars
    const star1Geometry = new THREE.SphereGeometry(50, 16, 16);
    const star1Material = new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.8
    });
    
    const star1 = new THREE.Mesh(star1Geometry, star1Material);
    star1.position.set(-600, 200, -1000);
    star1.userData.isBackground = true;
    scene.add(star1);
    objects.push(star1);
    
    const star2Geometry = new THREE.SphereGeometry(40, 16, 16);
    const star2Material = new THREE.MeshBasicMaterial({
      color: 0x4499ff,
      transparent: true,
      opacity: 0.8
    });
    
    const star2 = new THREE.Mesh(star2Geometry, star2Material);
    star2.position.set(600, -200, -1000);
    star2.userData.isBackground = true;
    scene.add(star2);
    objects.push(star2);
    
    // Normal star field
    objects.push(...this.createStarField(scene, 8000, 1.5));
    
    return objects;
  }

  private static createAsteroidBeltBackground(scene: THREE.Scene): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    
    // Asteroid belt
    for (let i = 0; i < 200; i++) {
      const geometry = new THREE.DodecahedronGeometry(2 + Math.random() * 8, 0);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.1, 0.3, 0.2 + Math.random() * 0.3),
        wireframe: Math.random() > 0.7
      });
      
      const asteroid = new THREE.Mesh(geometry, material);
      
      const angle = Math.random() * Math.PI * 2;
      const radius = 800 + Math.random() * 400;
      const height = (Math.random() - 0.5) * 200;
      
      asteroid.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      
      asteroid.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      asteroid.userData.isBackground = true;
      scene.add(asteroid);
      objects.push(asteroid);
    }
    
    objects.push(...this.createStarField(scene, 6000, 1));
    
    return objects;
  }

  private static createSolarFlareBackground(scene: THREE.Scene): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    
    // Bright sun
    const sunGeometry = new THREE.SphereGeometry(100, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff44,
      transparent: true,
      opacity: 0.9
    });
    
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(800, 300, -1200);
    sun.userData.isBackground = true;
    scene.add(sun);
    objects.push(sun);
    
    // Solar flares
    for (let i = 0; i < 8; i++) {
      const flareGeometry = new THREE.ConeGeometry(20, 200, 8);
      const flareMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.1, 1, 0.8),
        transparent: true,
        opacity: 0.6
      });
      
      const flare = new THREE.Mesh(flareGeometry, flareMaterial);
      flare.position.copy(sun.position);
      
      const angle = (i / 8) * Math.PI * 2;
      flare.position.x += Math.cos(angle) * 120;
      flare.position.z += Math.sin(angle) * 120;
      
      flare.lookAt(
        sun.position.x + Math.cos(angle) * 400,
        sun.position.y,
        sun.position.z + Math.sin(angle) * 400
      );
      
      flare.userData.isBackground = true;
      scene.add(flare);
      objects.push(flare);
    }
    
    objects.push(...this.createStarField(scene, 5000, 1));
    
    return objects;
  }

  private static createStarField(scene: THREE.Scene, count: number, size: number): THREE.Object3D[] {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: size,
      sizeAttenuation: false
    });

    const starVertices: number[] = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    stars.userData.isBackground = true;
    scene.add(stars);
    
    return [stars];
  }
}
