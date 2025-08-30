import { PlanetSettings } from '@/react-app/pages/Terraformer';
import { NoiseGenerator } from '@/react-app/utils/NoiseGenerator';

export interface PlanetStats {
  landPercentage: number;
  waterPercentage: number;
  climateType: string;
  terrainComplexity: 'Low' | 'Medium' | 'High' | 'Extreme';
  atmosphericConditions: 'Thin' | 'Normal' | 'Dense' | 'Thick';
  cloudCoverage: 'Clear' | 'Light' | 'Moderate' | 'Heavy' | 'Overcast';
  approximateSize: string;
}

export function calculatePlanetStats(settings: PlanetSettings): PlanetStats {
  // Calculate actual land/water percentages by sampling the noise
  const noise = new NoiseGenerator(settings.seed);
  let landCount = 0;
  const totalSamples = 1000;
  const seaLevel = 1 - settings.landWaterRatio;
  
  for (let i = 0; i < totalSamples; i++) {
    // Random point on sphere
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * 2 * Math.PI;
    
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);
    
    // Sample height at this point
    const scale1 = settings.coastlineComplexity * 4 + 1;
    const scale2 = settings.coastlineComplexity * 8 + 2;
    const scale3 = settings.mountainDensity * 16 + 4;
    
    let height = 0;
    height += noise.noise(x * scale1, y * scale1, z * scale1) * 0.5;
    height += noise.noise(x * scale2, y * scale2, z * scale2) * 0.25;
    height += noise.noise(x * scale3, y * scale3, z * scale3) * 0.125 * settings.mountainDensity;
    
    height = (height + 1) / 2; // Normalize to 0-1
    
    if (height >= seaLevel) {
      landCount++;
    }
  }
  
  const actualLandPercentage = (landCount / totalSamples) * 100;
  const actualWaterPercentage = 100 - actualLandPercentage;
  
  // Determine climate type
  let climateType: string;
  if (settings.climate < 0.2) {
    climateType = 'Frozen Arctic';
  } else if (settings.climate < 0.4) {
    climateType = 'Cold Temperate';
  } else if (settings.climate < 0.6) {
    climateType = 'Temperate';
  } else if (settings.climate < 0.8) {
    climateType = 'Warm Arid';
  } else {
    climateType = 'Tropical Verdant';
  }
  
  // Terrain complexity
  let terrainComplexity: 'Low' | 'Medium' | 'High' | 'Extreme';
  const complexityScore = (settings.coastlineComplexity + settings.mountainDensity) / 2;
  if (complexityScore < 0.25) {
    terrainComplexity = 'Low';
  } else if (complexityScore < 0.5) {
    terrainComplexity = 'Medium';
  } else if (complexityScore < 0.75) {
    terrainComplexity = 'High';
  } else {
    terrainComplexity = 'Extreme';
  }
  
  // Atmospheric conditions
  let atmosphericConditions: 'Thin' | 'Normal' | 'Dense' | 'Thick';
  if (settings.atmosphere < 0.25) {
    atmosphericConditions = 'Thin';
  } else if (settings.atmosphere < 0.5) {
    atmosphericConditions = 'Normal';
  } else if (settings.atmosphere < 0.75) {
    atmosphericConditions = 'Dense';
  } else {
    atmosphericConditions = 'Thick';
  }
  
  // Cloud coverage
  let cloudCoverage: 'Clear' | 'Light' | 'Moderate' | 'Heavy' | 'Overcast';
  if (settings.clouds < 0.2) {
    cloudCoverage = 'Clear';
  } else if (settings.clouds < 0.4) {
    cloudCoverage = 'Light';
  } else if (settings.clouds < 0.6) {
    cloudCoverage = 'Moderate';
  } else if (settings.clouds < 0.8) {
    cloudCoverage = 'Heavy';
  } else {
    cloudCoverage = 'Overcast';
  }
  
  // Approximate size (based on atmosphere thickness)
  let approximateSize: string;
  if (settings.atmosphere < 0.3) {
    approximateSize = 'Small (Mars-like)';
  } else if (settings.atmosphere < 0.7) {
    approximateSize = 'Medium (Earth-like)';
  } else {
    approximateSize = 'Large (Super-Earth)';
  }
  
  return {
    landPercentage: Math.round(actualLandPercentage),
    waterPercentage: Math.round(actualWaterPercentage),
    climateType,
    terrainComplexity,
    atmosphericConditions,
    cloudCoverage,
    approximateSize
  };
}
