import { PlanetSettings } from '@/react-app/pages/Terraformer';
import { NoiseGenerator } from '@/react-app/utils/NoiseGenerator';

export interface TemporalSettings {
  geologicalTime: number; // 0-1, represents billions of years
  weatherCycle: number; // 0-1, seasonal weather patterns
  climaticShift: number; // 0-1, long-term climate change
  erosionLevel: number; // 0-1, how much erosion has occurred
  timeSpeed: number; // 0.1-10, how fast time passes
  isPaused: boolean; // whether temporal evolution is paused
  showTemporalEffects: boolean; // whether to show time-based visual effects
  tectonicActivity: number; // 0-1, how active the tectonic plates are
  oceanLevel: number; // -0.5 to 0.5, sea level change over time
  atmosphericEvolution: number; // 0-1, how the atmosphere has evolved
}

export interface TemporalSnapshot {
  landWaterRatio: number;
  mountainDensity: number;
  coastlineComplexity: number;
  climate: number;
  atmosphere: number;
  clouds: number;
  timestamp: number;
}

export class TemporalEvolution {
  private baseSettings: PlanetSettings;
  private temporalNoise: NoiseGenerator;
  private weatherNoise: NoiseGenerator;
  private snapshots: TemporalSnapshot[] = [];
  private currentTime: number = 0;

  constructor(planetSettings: PlanetSettings) {
    this.baseSettings = { ...planetSettings };
    this.temporalNoise = new NoiseGenerator(planetSettings.seed + 50000);
    this.weatherNoise = new NoiseGenerator(planetSettings.seed + 60000);
  }

  public updateTime(deltaTime: number, temporalSettings: TemporalSettings): void {
    if (!temporalSettings.isPaused) {
      this.currentTime += deltaTime * temporalSettings.timeSpeed;
    }
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getTemporallyEvolvedSettings(temporalSettings: TemporalSettings): PlanetSettings {
    const evolved = { ...this.baseSettings };
    const time = this.currentTime;

    // Geological evolution over billions of years
    if (temporalSettings.geologicalTime > 0) {
      const geoScale = temporalSettings.geologicalTime * 10;
      
      // Mountain building and erosion cycles
      const mountainCycle = this.temporalNoise.noise(time * 0.001, 0, geoScale) * 0.3;
      evolved.mountainDensity = Math.max(0, Math.min(1, 
        this.baseSettings.mountainDensity + mountainCycle * temporalSettings.tectonicActivity
      ));

      // Coastline evolution through erosion
      const erosionFactor = Math.pow(temporalSettings.erosionLevel, 2);
      const coastlineSmoothing = erosionFactor * 0.4;
      evolved.coastlineComplexity = Math.max(0, Math.min(1,
        this.baseSettings.coastlineComplexity - coastlineSmoothing +
        this.temporalNoise.noise(time * 0.0005, geoScale, 0) * 0.2
      ));

      // Ocean level changes due to ice ages and warming
      const oceanCycle = this.temporalNoise.noise(time * 0.0008, geoScale * 2, 0) * 0.3;
      evolved.landWaterRatio = Math.max(0, Math.min(1,
        this.baseSettings.landWaterRatio + oceanCycle + temporalSettings.oceanLevel
      ));
    }

    // Climatic shifts over geological time
    if (temporalSettings.climaticShift > 0) {
      const climateNoise = this.temporalNoise.noise(time * 0.0002, temporalSettings.climaticShift * 5, 0);
      evolved.climate = Math.max(0, Math.min(1,
        this.baseSettings.climate + climateNoise * temporalSettings.climaticShift * 0.5
      ));
    }

    // Atmospheric evolution
    if (temporalSettings.atmosphericEvolution > 0) {
      const atmoNoise = this.temporalNoise.noise(time * 0.0001, 0, temporalSettings.atmosphericEvolution * 3);
      evolved.atmosphere = Math.max(0, Math.min(1,
        this.baseSettings.atmosphere + atmoNoise * temporalSettings.atmosphericEvolution * 0.4
      ));
    }

    // Weather cycles (seasonal and short-term)
    if (temporalSettings.weatherCycle > 0) {
      const seasonalCycle = Math.sin(time * 0.01 * temporalSettings.weatherCycle) * 0.3;
      const weatherNoise = this.weatherNoise.noise(time * 0.02, temporalSettings.weatherCycle * 2, 0) * 0.4;
      
      evolved.clouds = Math.max(0, Math.min(1,
        this.baseSettings.clouds + seasonalCycle + weatherNoise * temporalSettings.weatherCycle
      ));

      // Seasonal atmosphere thickness changes
      evolved.atmosphere = Math.max(0, Math.min(1,
        evolved.atmosphere + seasonalCycle * 0.1
      ));
    }

    return evolved;
  }

  public getTemporalEffects(temporalSettings: TemporalSettings): {
    auroras: boolean;
    meteorShowers: boolean;
    solarFlares: boolean;
    lightningStorms: boolean;
    dustStorms: boolean;
    polarIceCaps: boolean;
  } {
    const time = this.currentTime;
    
    return {
      auroras: this.weatherNoise.noise(time * 0.03, 1, 0) > 0.7 && temporalSettings.showTemporalEffects,
      meteorShowers: this.weatherNoise.noise(time * 0.02, 2, 0) > 0.8 && temporalSettings.showTemporalEffects,
      solarFlares: this.weatherNoise.noise(time * 0.01, 3, 0) > 0.85 && temporalSettings.showTemporalEffects,
      lightningStorms: this.weatherNoise.noise(time * 0.05, 4, 0) > 0.6 && temporalSettings.weatherCycle > 0.5,
      dustStorms: this.weatherNoise.noise(time * 0.04, 5, 0) > 0.7 && temporalSettings.weatherCycle > 0.3,
      polarIceCaps: temporalSettings.geologicalTime > 0.3 && this.baseSettings.climate < 0.6
    };
  }

  public saveSnapshot(): void {
    const snapshot: TemporalSnapshot = {
      landWaterRatio: this.baseSettings.landWaterRatio,
      mountainDensity: this.baseSettings.mountainDensity,
      coastlineComplexity: this.baseSettings.coastlineComplexity,
      climate: this.baseSettings.climate,
      atmosphere: this.baseSettings.atmosphere,
      clouds: this.baseSettings.clouds,
      timestamp: this.currentTime
    };
    
    this.snapshots.push(snapshot);
    if (this.snapshots.length > 100) {
      this.snapshots.shift(); // Keep only last 100 snapshots
    }
  }

  public getTemporalHistory(): TemporalSnapshot[] {
    return [...this.snapshots];
  }

  public resetTime(): void {
    this.currentTime = 0;
    this.snapshots = [];
  }

  public fastForward(duration: number): void {
    this.currentTime += duration;
  }

  public rewind(duration: number): void {
    this.currentTime = Math.max(0, this.currentTime - duration);
  }

  public getTimeDescription(): string {
    const time = this.currentTime;
    
    if (time < 100) {
      return `${Math.floor(time)} years`;
    } else if (time < 100000) {
      return `${Math.floor(time / 1000)}K years`;
    } else if (time < 1000000) {
      return `${Math.floor(time / 100000) / 10}M years`;
    } else {
      return `${Math.floor(time / 100000000) / 10}B years`;
    }
  }

  public getEpochName(): string {
    const time = this.currentTime;
    
    if (time < 1000) {
      return "Present Era";
    } else if (time < 10000) {
      return "Recent Holocene";
    } else if (time < 100000) {
      return "Pleistocene";
    } else if (time < 1000000) {
      return "Quaternary";
    } else if (time < 10000000) {
      return "Neogene";
    } else if (time < 100000000) {
      return "Paleogene";
    } else if (time < 500000000) {
      return "Mesozoic";
    } else {
      return "Paleozoic";
    }
  }

  public getTemporalVisualizationData(): {
    timeProgress: number;
    erosionProgress: number;
    climateHistory: number[];
    mountainHistory: number[];
    oceanHistory: number[];
  } {
    const maxTime = 1000000000; // 1 billion years max
    const timeProgress = Math.min(1, this.currentTime / maxTime);
    
    const erosionProgress = Math.min(1, this.currentTime / 100000000); // 100M years for full erosion
    
    // Generate historical data
    const historyLength = 50;
    const climateHistory: number[] = [];
    const mountainHistory: number[] = [];
    const oceanHistory: number[] = [];
    
    for (let i = 0; i < historyLength; i++) {
      const historicalTime = (this.currentTime * i) / historyLength;
      climateHistory.push(this.baseSettings.climate + 
        this.temporalNoise.noise(historicalTime * 0.0002, 1, 0) * 0.3);
      mountainHistory.push(this.baseSettings.mountainDensity + 
        this.temporalNoise.noise(historicalTime * 0.001, 2, 0) * 0.4);
      oceanHistory.push(this.baseSettings.landWaterRatio + 
        this.temporalNoise.noise(historicalTime * 0.0008, 3, 0) * 0.3);
    }
    
    return {
      timeProgress,
      erosionProgress,
      climateHistory,
      mountainHistory,
      oceanHistory
    };
  }
}
