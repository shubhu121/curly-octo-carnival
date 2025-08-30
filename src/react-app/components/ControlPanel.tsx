import { useState } from 'react';
import { PlanetSettings } from '@/react-app/pages/Terraformer';
import { RefreshCw, Download, Sliders, Play, Pause, Sun, Moon, Shuffle, BarChart3, ChevronDown, ChevronUp, Image, Orbit, Sparkles, Video, Volume2, VolumeX, Camera, Maximize, RotateCcw, Zap, Clock, FastForward, History, Layers, Wind } from 'lucide-react';
import { PLANET_PRESETS } from '@/react-app/utils/PlanetPresets';
import { calculatePlanetStats } from '@/react-app/utils/PlanetStats';
import { BackgroundGenerator } from '@/react-app/utils/BackgroundGenerator';
import { AudioSystem } from '@/react-app/utils/AudioSystem';
import { CameraSystem } from '@/react-app/utils/CameraSystem';
import { VideoRecorder } from '@/react-app/utils/VideoRecorder';

interface ControlPanelProps {
  settings: PlanetSettings;
  onUpdateSetting: (key: keyof PlanetSettings, value: number | boolean) => void;
  onGenerateNewPlanet: () => void;
  onGenerateRandomPlanet: () => void;
  onApplyPreset: (presetIndex: number) => void;
  onExportPlanet: () => void;
  onExportVideo: () => void;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  description?: string;
}

function Slider({ label, value, min, max, step, onChange, description }: SliderProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-slate-200 font-medium text-sm">{label}</label>
        <span className="text-slate-400 text-xs">{Math.round(value * 100)}%</span>
      </div>
      {description && (
        <p className="text-slate-500 text-xs mb-2 hidden sm:block">{description}</p>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  );
}

export default function ControlPanel({ 
  settings, 
  onUpdateSetting, 
  onGenerateNewPlanet, 
  onGenerateRandomPlanet, 
  onApplyPreset, 
  onExportPlanet,
  onExportVideo 
}: ControlPanelProps) {
  const [showStats, setShowStats] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [showTemporal, setShowTemporal] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  
  const planetStats = calculatePlanetStats(settings);
  const backgroundNames = BackgroundGenerator.getBackgroundNames();
  const audioTrackNames = AudioSystem.getTrackNames();
  const cameraPresetNames = CameraSystem.getPresetNames();
  const videoSupported = VideoRecorder.isSupported();

  return (
    <div className="p-4 sm:p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sliders className="w-5 h-5 text-blue-400" />
          <h1 className="text-xl font-bold text-white">Terraformer</h1>
        </div>
        <p className="text-slate-400 text-sm hidden sm:block">
          Craft unique worlds with procedural generation
        </p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onGenerateNewPlanet}
            className="px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            New Planet
          </button>
          
          <button
            onClick={onGenerateRandomPlanet}
            className="px-3 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm"
          >
            <Shuffle className="w-4 h-4" />
            Random
          </button>
        </div>

        {/* Animation Controls */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onUpdateSetting('animationPaused', !settings.animationPaused)}
            className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1 text-sm ${
              settings.animationPaused
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
            }`}
          >
            {settings.animationPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {settings.animationPaused ? 'Play' : 'Pause'}
          </button>
          
          <button
            onClick={() => onUpdateSetting('dayNightCycle', !settings.dayNightCycle)}
            className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1 text-sm ${
              settings.dayNightCycle
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
            }`}
          >
            {settings.dayNightCycle ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            Day/Night
          </button>
        </div>

        {/* Speed Control - Fixed Layout */}
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-200 font-medium">Animation Speed</span>
            <span className="text-xs text-slate-400">{(settings.rotationSpeed * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={3}
            step={0.1}
            value={settings.rotationSpeed}
            onChange={(e) => onUpdateSetting('rotationSpeed', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Background Selection */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Image className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-slate-200">Space Background</span>
        </div>
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="mb-2">
            <span className="text-xs text-slate-400">{backgroundNames[Math.floor(settings.backgroundType * 7.99)]}</span>
          </div>
          <input
            type="range"
            min={0}
            max={0.999}
            step={0.125}
            value={settings.backgroundType}
            onChange={(e) => onUpdateSetting('backgroundType', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Planet Presets */}
      <div className="mb-6">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="w-full flex items-center justify-between p-2 bg-slate-700 rounded-lg text-slate-200 hover:bg-slate-600 transition-colors"
        >
          <span className="text-sm font-medium">Planet Presets</span>
          {showPresets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showPresets && (
          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
            {PLANET_PRESETS.map((preset, index) => (
              <button
                key={index}
                onClick={() => onApplyPreset(index)}
                className="w-full text-left p-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors"
              >
                <div className="font-medium text-slate-200">{preset.name}</div>
                <div className="text-slate-400 text-xs">{preset.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Features */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-2 bg-slate-700 rounded-lg text-slate-200 hover:bg-slate-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Advanced Features</span>
          </div>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showAdvanced && (
          <div className="mt-2 p-3 bg-slate-800 rounded-lg space-y-4">
            {/* Planetary Rings */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Orbit className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-slate-200">Planetary Rings</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.hasRings}
                    onChange={(e) => onUpdateSetting('hasRings', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-600 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {settings.hasRings && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400">Ring Density</span>
                    <span className="text-xs text-slate-400">{Math.round(settings.ringDensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={settings.ringDensity}
                    onChange={(e) => onUpdateSetting('ringDensity', parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Moon */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-slate-400"></div>
                  <span className="text-sm text-slate-200">Moon</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.hasMoon}
                    onChange={(e) => onUpdateSetting('hasMoon', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-600 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {settings.hasMoon && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400">Moon Size</span>
                    <span className="text-xs text-slate-400">{Math.round(settings.moonSize * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.01}
                    value={settings.moonSize}
                    onChange={(e) => onUpdateSetting('moonSize', parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Planet Statistics */}
      <div className="mb-6">
        <button
          onClick={() => setShowStats(!showStats)}
          className="w-full flex items-center justify-between p-2 bg-slate-700 rounded-lg text-slate-200 hover:bg-slate-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Planet Statistics</span>
          </div>
          {showStats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showStats && (
          <div className="mt-2 p-3 bg-slate-800 rounded-lg text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Land Coverage:</span>
              <span className="text-emerald-400">{planetStats.landPercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Water Coverage:</span>
              <span className="text-blue-400">{planetStats.waterPercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Climate:</span>
              <span className="text-slate-200">{planetStats.climateType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Terrain:</span>
              <span className="text-slate-200">{planetStats.terrainComplexity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Atmosphere:</span>
              <span className="text-slate-200">{planetStats.atmosphericConditions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Clouds:</span>
              <span className="text-slate-200">{planetStats.cloudCoverage}</span>
            </div>
            {settings.hasRings && (
              <div className="flex justify-between">
                <span className="text-slate-400">Ring System:</span>
                <span className="text-orange-400">Present</span>
              </div>
            )}
            {settings.hasMoon && (
              <div className="flex justify-between">
                <span className="text-slate-400">Natural Satellites:</span>
                <span className="text-slate-400">1 Moon</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-x-4 space-y-1">
        <Slider
          label="Land / Water Ratio"
          value={settings.landWaterRatio}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onUpdateSetting('landWaterRatio', value)}
          description="Controls the sea level - left for more ocean, right for more land"
        />

        <Slider
          label="Coastline Complexity"
          value={settings.coastlineComplexity}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onUpdateSetting('coastlineComplexity', value)}
          description="Adjusts terrain detail - low for smooth continents, high for fractal coasts"
        />

        <Slider
          label="Mountain Density"
          value={settings.mountainDensity}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onUpdateSetting('mountainDensity', value)}
          description="Controls elevation variation - low for flat terrain, high for rugged mountains"
        />

        <Slider
          label="Climate"
          value={settings.climate}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onUpdateSetting('climate', value)}
          description="Icy → Temperate → Arid → Verdant"
        />

        <Slider
          label="Atmosphere"
          value={settings.atmosphere}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onUpdateSetting('atmosphere', value)}
          description="Controls atmospheric glow intensity and radius"
        />

        <Slider
          label="Clouds"
          value={settings.clouds}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onUpdateSetting('clouds', value)}
          description="Adjusts cloud layer opacity and coverage"
        />
      </div>

      {/* Audio Controls */}
      <div className="mb-6">
        <button
          onClick={() => setShowAudio(!showAudio)}
          className="w-full flex items-center justify-between p-2 bg-slate-700 rounded-lg text-slate-200 hover:bg-slate-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            {settings.audioEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="text-sm font-medium">Ambient Audio</span>
          </div>
          {showAudio ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showAudio && (
          <div className="mt-2 p-3 bg-slate-800 rounded-lg space-y-4">
            {/* Audio Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-200">Enable Audio</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.audioEnabled}
                  onChange={(e) => onUpdateSetting('audioEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-600 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {settings.audioEnabled && (
              <>
                {/* Track Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-200">Audio Track</span>
                    <span className="text-xs text-slate-400">{audioTrackNames[settings.audioTrack]}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={audioTrackNames.length - 1}
                    step={1}
                    value={settings.audioTrack}
                    onChange={(e) => onUpdateSetting('audioTrack', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                {/* Volume Control */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-200">Volume</span>
                    <span className="text-xs text-slate-400">{Math.round(settings.audioVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={settings.audioVolume}
                    onChange={(e) => onUpdateSetting('audioVolume', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Camera Controls */}
      <div className="mb-6">
        <button
          onClick={() => setShowCamera(!showCamera)}
          className="w-full flex items-center justify-between p-2 bg-slate-700 rounded-lg text-slate-200 hover:bg-slate-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium">Camera Controls</span>
          </div>
          {showCamera ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showCamera && (
          <div className="mt-2 p-3 bg-slate-800 rounded-lg space-y-4">
            {/* Camera Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-200">Camera Angle</span>
                <span className="text-xs text-slate-400">{cameraPresetNames[settings.cameraPreset]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={cameraPresetNames.length - 1}
                step={1}
                value={settings.cameraPreset}
                onChange={(e) => onUpdateSetting('cameraPreset', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Auto Orbit */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-slate-200">Auto Orbit</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoOrbit}
                  onChange={(e) => onUpdateSetting('autoOrbit', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-600 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 4D Temporal Evolution */}
      <div className="mb-6">
        <button
          onClick={() => setShowTemporal(!showTemporal)}
          className="w-full flex items-center justify-between p-2 bg-gradient-to-r from-purple-700 to-pink-700 rounded-lg text-white hover:from-purple-800 hover:to-pink-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-300" />
            <span className="text-sm font-medium">4D Time Evolution</span>
          </div>
          {showTemporal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showTemporal && (
          <div className="mt-2 p-3 bg-slate-800 rounded-lg space-y-4">
            {/* Temporal Controls */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => onUpdateSetting('temporalPaused', !settings.temporalPaused)}
                className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1 text-xs ${
                  settings.temporalPaused
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                }`}
              >
                {settings.temporalPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                Time
              </button>
              
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('fastForward'))}
                className="px-2 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-1 text-xs"
              >
                <FastForward className="w-3 h-3" />
                Fast
              </button>
              
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('resetTime'))}
                className="px-2 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all duration-200 flex items-center justify-center gap-1 text-xs"
              >
                <History className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Time Speed */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-200">Time Speed</span>
                <span className="text-xs text-slate-400">{settings.timeSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={10}
                step={0.1}
                value={settings.timeSpeed}
                onChange={(e) => onUpdateSetting('timeSpeed', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Geological Time */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-slate-200">Geological Age</span>
                </div>
                <span className="text-xs text-slate-400">{Math.round(settings.geologicalTime * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={settings.geologicalTime}
                onChange={(e) => onUpdateSetting('geologicalTime', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Tectonic Activity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-200">Tectonic Activity</span>
                <span className="text-xs text-slate-400">{Math.round(settings.tectonicActivity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={settings.tectonicActivity}
                onChange={(e) => onUpdateSetting('tectonicActivity', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Erosion Level */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-200">Erosion Level</span>
                <span className="text-xs text-slate-400">{Math.round(settings.erosionLevel * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={settings.erosionLevel}
                onChange={(e) => onUpdateSetting('erosionLevel', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Climatic Shift */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-200">Climate Evolution</span>
                <span className="text-xs text-slate-400">{Math.round(settings.climaticShift * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={settings.climaticShift}
                onChange={(e) => onUpdateSetting('climaticShift', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Ocean Level Change */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-200">Sea Level Change</span>
                <span className="text-xs text-slate-400">{settings.oceanLevel > 0 ? '+' : ''}{Math.round(settings.oceanLevel * 100)}%</span>
              </div>
              <input
                type="range"
                min={-0.5}
                max={0.5}
                step={0.01}
                value={settings.oceanLevel}
                onChange={(e) => onUpdateSetting('oceanLevel', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        )}
      </div>

      {/* Weather System */}
      <div className="mb-6">
        <button
          onClick={() => setShowWeather(!showWeather)}
          className="w-full flex items-center justify-between p-2 bg-slate-700 rounded-lg text-slate-200 hover:bg-slate-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">Dynamic Weather</span>
          </div>
          {showWeather ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showWeather && (
          <div className="mt-2 p-3 bg-slate-800 rounded-lg space-y-4">
            {/* Weather Cycles */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-200">Weather Intensity</span>
                <span className="text-xs text-slate-400">{Math.round(settings.weatherCycle * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={settings.weatherCycle}
                onChange={(e) => onUpdateSetting('weatherCycle', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Temporal Effects Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-slate-200">Storm Effects</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showTemporalEffects}
                  onChange={(e) => onUpdateSetting('showTemporalEffects', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-600 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Visual Effects */}
      <div className="mb-6">
        <button
          onClick={() => setShowEffects(!showEffects)}
          className="w-full flex items-center justify-between p-2 bg-slate-700 rounded-lg text-slate-200 hover:bg-slate-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Visual Effects</span>
          </div>
          {showEffects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showEffects && (
          <div className="mt-2 p-3 bg-slate-800 rounded-lg space-y-4">
            {/* Particle Effects */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-slate-200">Particle Effects</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.particleEffects}
                  onChange={(e) => onUpdateSetting('particleEffects', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-600 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Planet Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Maximize className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-slate-200">Planet Size</span>
                </div>
                <span className="text-xs text-slate-400">{Math.round(settings.planetSize * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.1}
                value={settings.planetSize}
                onChange={(e) => onUpdateSetting('planetSize', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        )}
      </div>

      {/* Export Buttons */}
      <div className="space-y-3 mb-6">
        <button
          onClick={onExportPlanet}
          className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
        >
          <Download className="w-4 h-4" />
          Export HD PNG
        </button>
        
        {videoSupported && (
          <button
            onClick={() => {
              setIsExportingVideo(true);
              onExportVideo();
              setTimeout(() => setIsExportingVideo(false), 11000); // 10s recording + 1s buffer
            }}
            disabled={isExportingVideo}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
              isExportingVideo
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
            }`}
          >
            <Video className="w-4 h-4" />
            {isExportingVideo ? 'Recording...' : 'Export 10s Video'}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 sm:mt-8 p-4 bg-gradient-to-r from-purple-700/30 to-pink-700/30 rounded-lg border border-purple-500/30 hidden sm:block">
        <p className="text-slate-300 text-xs leading-relaxed">
          <strong>4D Experience:</strong> Watch planets evolve over geological time! Control weather systems, tectonic activity, erosion, and climate change. Experience storms, auroras, and seasonal cycles in real-time temporal evolution.
        </p>
      </div>
    </div>
  );
}
