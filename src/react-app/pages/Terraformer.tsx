import { useState } from 'react';
import PlanetRenderer from '@/react-app/components/PlanetRenderer';
import ControlPanel from '@/react-app/components/ControlPanel';
import { PLANET_PRESETS, generateRandomSettings } from '@/react-app/utils/PlanetPresets';

export interface PlanetSettings {
  seed: number;
  landWaterRatio: number;
  coastlineComplexity: number;
  mountainDensity: number;
  climate: number;
  atmosphere: number;
  clouds: number;
  rotationSpeed: number;
  dayNightCycle: boolean;
  animationPaused: boolean;
  backgroundType: number;
  hasRings: boolean;
  ringDensity: number;
  hasMoon: boolean;
  moonSize: number;
  // New features
  audioEnabled: boolean;
  audioTrack: number;
  audioVolume: number;
  cameraPreset: number;
  particleEffects: boolean;
  planetSize: number;
  autoOrbit: boolean;
  // 4D Temporal Features
  geologicalTime: number;
  weatherCycle: number;
  climaticShift: number;
  erosionLevel: number;
  timeSpeed: number;
  temporalPaused: boolean;
  showTemporalEffects: boolean;
  tectonicActivity: number;
  oceanLevel: number;
  atmosphericEvolution: number;
}

const defaultSettings: PlanetSettings = {
  seed: Math.random() * 10000,
  landWaterRatio: 0.4,
  coastlineComplexity: 0.5,
  mountainDensity: 0.3,
  climate: 0.5,
  atmosphere: 0.4,
  clouds: 0.6,
  rotationSpeed: 1,
  dayNightCycle: false,
  animationPaused: false,
  backgroundType: 0,
  hasRings: false,
  ringDensity: 0.5,
  hasMoon: false,
  moonSize: 0.3,
  // New features
  audioEnabled: false,
  audioTrack: 0,
  audioVolume: 0.5,
  cameraPreset: 0,
  particleEffects: true,
  planetSize: 1.0,
  autoOrbit: false,
  // 4D Temporal Features
  geologicalTime: 0,
  weatherCycle: 0,
  climaticShift: 0,
  erosionLevel: 0,
  timeSpeed: 1,
  temporalPaused: true,
  showTemporalEffects: true,
  tectonicActivity: 0.5,
  oceanLevel: 0,
  atmosphericEvolution: 0,
};

export default function Terraformer() {
  const [settings, setSettings] = useState<PlanetSettings>(defaultSettings);

  const updateSetting = (key: keyof PlanetSettings, value: number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const generateNewPlanet = () => {
    setSettings(prev => ({ ...prev, seed: Math.random() * 10000 }));
  };

  const generateRandomPlanet = () => {
    const randomSettings = generateRandomSettings();
    setSettings({
      ...randomSettings,
      seed: Math.random() * 10000
    });
  };

  const applyPreset = (presetIndex: number) => {
    const preset = PLANET_PRESETS[presetIndex];
    setSettings({
      ...preset.settings,
      seed: Math.random() * 10000
    });
  };

  const exportPlanet = async () => {
    // This will be handled by the PlanetRenderer component
    const event = new CustomEvent('exportPlanet');
    window.dispatchEvent(event);
  };

  const exportVideo = async () => {
    // This will be handled by the PlanetRenderer component
    const event = new CustomEvent('exportVideo');
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row">
      {/* Planet Render Area - Mobile: full screen height, Desktop: 2/3 */}
      <div className="flex-1 relative overflow-hidden h-96 sm:h-[60vh] lg:h-screen">
        <PlanetRenderer settings={settings} />
      </div>
      
      {/* Control Panel - Mobile: bottom section, Desktop: right sidebar */}
      <div className="w-full lg:w-80 bg-slate-800 border-t lg:border-t-0 lg:border-l border-slate-700 max-h-none lg:max-h-screen">
        <ControlPanel 
          settings={settings}
          onUpdateSetting={updateSetting}
          onGenerateNewPlanet={generateNewPlanet}
          onGenerateRandomPlanet={generateRandomPlanet}
          onApplyPreset={applyPreset}
          onExportPlanet={exportPlanet}
          onExportVideo={exportVideo}
        />
      </div>
    </div>
  );
}
