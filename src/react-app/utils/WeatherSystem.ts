import * as THREE from 'three';
import { NoiseGenerator } from '@/react-app/utils/NoiseGenerator';

export interface WeatherPattern {
  cloudDensity: number;
  stormIntensity: number;
  windSpeed: number;
  precipitation: number;
  temperature: number;
  pressure: number;
}

export interface StormSystem {
  position: THREE.Vector3;
  radius: number;
  intensity: number;
  rotation: number;
  type: 'thunderstorm' | 'cyclone' | 'dust' | 'aurora';
  lifespan: number;
  age: number;
}

export class WeatherSystem {
  private noise: NoiseGenerator;
  private stormSystems: StormSystem[] = [];
  private globalWindPattern: THREE.Vector3[] = [];
  private temperatureMap: number[][] = [];
  private currentTime: number = 0;

  constructor(seed: number) {
    this.noise = new NoiseGenerator(seed + 70000);
    this.generateGlobalWindPattern();
    this.generateTemperatureMap();
  }

  private generateGlobalWindPattern(): void {
    this.globalWindPattern = [];
    
    // Generate wind patterns based on planetary circulation
    for (let lat = -90; lat <= 90; lat += 10) {
      for (let lon = -180; lon <= 180; lon += 10) {
        const latRad = (lat * Math.PI) / 180;
        
        // Coriolis effect simulation
        const coriolisStrength = Math.sin(latRad) * 0.8;
        const tradeWinds = Math.cos(latRad * 3) * 0.6;
        
        const windVector = new THREE.Vector3(
          tradeWinds + this.noise.noise(lon * 0.01, lat * 0.01, 0) * 0.4,
          coriolisStrength,
          this.noise.noise(lon * 0.02, lat * 0.02, 1) * 0.3
        ).normalize();
        
        this.globalWindPattern.push(windVector);
      }
    }
  }

  private generateTemperatureMap(): void {
    this.temperatureMap = [];
    
    for (let lat = 0; lat < 180; lat += 5) {
      const row: number[] = [];
      for (let lon = 0; lon < 360; lon += 5) {
        const latNorm = (lat - 90) / 90; // -1 to 1
        
        // Base temperature based on latitude
        const baseTemp = Math.cos(latNorm * Math.PI * 0.5);
        
        // Add noise for terrain variation
        const terrainVariation = this.noise.noise(lon * 0.02, lat * 0.02, 2) * 0.3;
        
        row.push(Math.max(0, Math.min(1, baseTemp + terrainVariation)));
      }
      this.temperatureMap.push(row);
    }
  }

  public update(deltaTime: number, timeSpeed: number): void {
    this.currentTime += deltaTime * timeSpeed;
    
    // Update existing storms
    this.stormSystems = this.stormSystems.filter(storm => {
      storm.age += deltaTime * timeSpeed;
      storm.rotation += deltaTime * timeSpeed * storm.intensity;
      
      // Move storms based on wind patterns
      const windIndex = Math.floor((storm.position.x + 1) * 18) + 
                       Math.floor((storm.position.y + 1) * 18) * 36;
      if (windIndex >= 0 && windIndex < this.globalWindPattern.length) {
        const wind = this.globalWindPattern[windIndex];
        storm.position.add(wind.clone().multiplyScalar(deltaTime * 0.01));
      }
      
      // Storm lifecycle
      if (storm.age < storm.lifespan * 0.2) {
        // Growing phase
        storm.intensity = (storm.age / (storm.lifespan * 0.2)) * storm.intensity;
      } else if (storm.age > storm.lifespan * 0.8) {
        // Dissipating phase
        const dissipationFactor = 1 - ((storm.age - storm.lifespan * 0.8) / (storm.lifespan * 0.2));
        storm.intensity *= dissipationFactor;
      }
      
      return storm.age < storm.lifespan && storm.intensity > 0.1;
    });
    
    // Spawn new storms randomly
    if (Math.random() < 0.02) { // 2% chance per update
      this.spawnRandomStorm();
    }
  }

  private spawnRandomStorm(): void {
    const stormTypes: StormSystem['type'][] = ['thunderstorm', 'cyclone', 'dust', 'aurora'];
    const type = stormTypes[Math.floor(Math.random() * stormTypes.length)];
    
    const storm: StormSystem = {
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 0.2 + 1.6 // Above planet surface
      ),
      radius: 0.1 + Math.random() * 0.3,
      intensity: 0.5 + Math.random() * 0.5,
      rotation: 0,
      type,
      lifespan: 50 + Math.random() * 200, // 50-250 time units
      age: 0
    };
    
    // Adjust properties based on type
    switch (type) {
      case 'cyclone':
        storm.radius *= 1.5;
        storm.lifespan *= 2;
        storm.intensity *= 1.2;
        break;
      case 'dust':
        storm.radius *= 2;
        storm.intensity *= 0.8;
        storm.position.z = 1.55; // Close to surface
        break;
      case 'aurora':
        storm.radius *= 0.5;
        storm.position.z = 2.0; // High in atmosphere
        storm.position.x = Math.random() > 0.5 ? 1.2 : -1.2; // Near poles
        break;
    }
    
    this.stormSystems.push(storm);
  }

  public getCurrentWeatherPattern(position: THREE.Vector3): WeatherPattern {
    // Sample noise at current position and time
    const cloudNoise = this.noise.noise(
      position.x * 3 + this.currentTime * 0.01,
      position.y * 3 + this.currentTime * 0.01,
      position.z * 3
    );
    
    const stormNoise = this.noise.noise(
      position.x * 8 + this.currentTime * 0.02,
      position.y * 8 + this.currentTime * 0.02,
      position.z * 8 + 1
    );
    
    const windNoise = this.noise.noise(
      position.x * 5 + this.currentTime * 0.015,
      position.y * 5 + this.currentTime * 0.015,
      position.z * 5 + 2
    );
    
    // Find nearest storms
    let stormInfluence = 0;
    this.stormSystems.forEach(storm => {
      const distance = position.distanceTo(storm.position);
      if (distance < storm.radius) {
        const influence = (1 - distance / storm.radius) * storm.intensity;
        stormInfluence = Math.max(stormInfluence, influence);
      }
    });
    
    return {
      cloudDensity: Math.max(0, Math.min(1, (cloudNoise + 1) / 2 + stormInfluence * 0.3)),
      stormIntensity: Math.max(0, Math.min(1, (stormNoise + 1) / 2 + stormInfluence)),
      windSpeed: Math.max(0, Math.min(1, (windNoise + 1) / 2 + stormInfluence * 0.4)),
      precipitation: Math.max(0, Math.min(1, stormInfluence * 0.8 + (cloudNoise + 1) / 4)),
      temperature: this.getTemperatureAt(position),
      pressure: 0.5 + (cloudNoise + stormNoise) * 0.25 + stormInfluence * 0.2
    };
  }

  private getTemperatureAt(position: THREE.Vector3): number {
    // Convert 3D position to lat/lon
    const lat = Math.asin(position.y) * 180 / Math.PI + 90; // 0-180
    const lon = Math.atan2(position.z, position.x) * 180 / Math.PI + 180; // 0-360
    
    const latIndex = Math.floor(lat / 5);
    const lonIndex = Math.floor(lon / 5);
    
    if (latIndex >= 0 && latIndex < this.temperatureMap.length &&
        lonIndex >= 0 && lonIndex < this.temperatureMap[0].length) {
      return this.temperatureMap[latIndex][lonIndex];
    }
    
    return 0.5; // Default temperature
  }

  public getActiveStorms(): StormSystem[] {
    return [...this.stormSystems];
  }

  public createStormVisualEffects(scene: THREE.Scene): THREE.Object3D[] {
    const effects: THREE.Object3D[] = [];
    
    this.stormSystems.forEach(storm => {
      switch (storm.type) {
        case 'thunderstorm':
          effects.push(...this.createThunderstormEffect(scene, storm));
          break;
        case 'cyclone':
          effects.push(...this.createCycloneEffect(scene, storm));
          break;
        case 'dust':
          effects.push(...this.createDustStormEffect(scene, storm));
          break;
        case 'aurora':
          effects.push(...this.createAuroraEffect(scene, storm));
          break;
      }
    });
    
    return effects;
  }

  private createThunderstormEffect(scene: THREE.Scene, storm: StormSystem): THREE.Object3D[] {
    const effects: THREE.Object3D[] = [];
    
    // Lightning flashes
    if (Math.random() < 0.1 * storm.intensity) {
      const lightningGeometry = new THREE.CylinderGeometry(0.001, 0.001, storm.radius, 3);
      const lightningMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
      });
      
      const lightning = new THREE.Mesh(lightningGeometry, lightningMaterial);
      lightning.position.copy(storm.position);
      lightning.position.y = 1.5 + 0.1;
      lightning.userData.isTemporalEffect = true;
      scene.add(lightning);
      effects.push(lightning);
      
      // Remove lightning after brief flash
      setTimeout(() => {
        scene.remove(lightning);
      }, 100);
    }
    
    return effects;
  }

  private createCycloneEffect(scene: THREE.Scene, storm: StormSystem): THREE.Object3D[] {
    const effects: THREE.Object3D[] = [];
    
    // Spiral cloud formation
    const spiralGeometry = new THREE.RingGeometry(storm.radius * 0.3, storm.radius, 16);
    const spiralMaterial = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.3 * storm.intensity,
      side: THREE.DoubleSide
    });
    
    const spiral = new THREE.Mesh(spiralGeometry, spiralMaterial);
    spiral.position.copy(storm.position);
    spiral.rotation.z = storm.rotation;
    spiral.userData.isTemporalEffect = true;
    scene.add(spiral);
    effects.push(spiral);
    
    return effects;
  }

  private createDustStormEffect(scene: THREE.Scene, storm: StormSystem): THREE.Object3D[] {
    const effects: THREE.Object3D[] = [];
    
    // Dust cloud
    const dustGeometry = new THREE.SphereGeometry(storm.radius, 16, 8);
    const dustMaterial = new THREE.MeshBasicMaterial({
      color: 0xcc9966,
      transparent: true,
      opacity: 0.4 * storm.intensity,
    });
    
    const dustCloud = new THREE.Mesh(dustGeometry, dustMaterial);
    dustCloud.position.copy(storm.position);
    dustCloud.userData.isTemporalEffect = true;
    scene.add(dustCloud);
    effects.push(dustCloud);
    
    return effects;
  }

  private createAuroraEffect(scene: THREE.Scene, storm: StormSystem): THREE.Object3D[] {
    const effects: THREE.Object3D[] = [];
    
    // Aurora curtains
    const auroraGeometry = new THREE.PlaneGeometry(storm.radius * 2, storm.radius * 4);
    const auroraMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.3 + Math.random() * 0.4, 0.8, 0.6),
      transparent: true,
      opacity: 0.5 * storm.intensity,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    
    const aurora = new THREE.Mesh(auroraGeometry, auroraMaterial);
    aurora.position.copy(storm.position);
    aurora.lookAt(0, 0, 0); // Face planet center
    aurora.userData.isTemporalEffect = true;
    scene.add(aurora);
    effects.push(aurora);
    
    return effects;
  }

  public reset(): void {
    this.stormSystems = [];
    this.currentTime = 0;
  }

  public getWeatherStats(): {
    activeStorms: number;
    averageCloudCover: number;
    globalWindSpeed: number;
    temperatureRange: { min: number; max: number };
  } {
    const activeStorms = this.stormSystems.length;
    
    // Sample weather at multiple points for averages
    const samplePoints = 100;
    let totalCloudCover = 0;
    let totalWindSpeed = 0;
    let minTemp = 1, maxTemp = 0;
    
    for (let i = 0; i < samplePoints; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        1.6
      ).normalize().multiplyScalar(1.6);
      
      const weather = this.getCurrentWeatherPattern(position);
      totalCloudCover += weather.cloudDensity;
      totalWindSpeed += weather.windSpeed;
      minTemp = Math.min(minTemp, weather.temperature);
      maxTemp = Math.max(maxTemp, weather.temperature);
    }
    
    return {
      activeStorms,
      averageCloudCover: totalCloudCover / samplePoints,
      globalWindSpeed: totalWindSpeed / samplePoints,
      temperatureRange: { min: minTemp, max: maxTemp }
    };
  }
}
