interface RGB {
  r: number;
  g: number;
  b: number;
}

interface ColorPalette {
  deepOcean: RGB;
  shallowWater: RGB;
  beach: RGB;
  lowland: RGB;
  highland: RGB;
  mountain: RGB;
  peak: RGB;
  polar: RGB;
  atmosphereColor: number;
}

export class ColorPalettes {
  private static palettes: ColorPalette[] = [
    // Icy
    {
      deepOcean: { r: 25, g: 25, b: 112 },
      shallowWater: { r: 65, g: 105, b: 225 },
      beach: { r: 176, g: 196, b: 222 },
      lowland: { r: 230, g: 230, b: 250 },
      highland: { r: 255, g: 250, b: 240 },
      mountain: { r: 248, g: 248, b: 255 },
      peak: { r: 255, g: 255, b: 255 },
      polar: { r: 255, g: 255, b: 255 },
      atmosphereColor: 0x87CEEB
    },
    // Temperate
    {
      deepOcean: { r: 25, g: 25, b: 112 },
      shallowWater: { r: 65, g: 105, b: 225 },
      beach: { r: 238, g: 203, b: 173 },
      lowland: { r: 34, g: 139, b: 34 },
      highland: { r: 107, g: 142, b: 35 },
      mountain: { r: 160, g: 82, b: 45 },
      peak: { r: 139, g: 69, b: 19 },
      polar: { r: 255, g: 255, b: 255 },
      atmosphereColor: 0x87CEEB
    },
    // Arid
    {
      deepOcean: { r: 25, g: 25, b: 112 },
      shallowWater: { r: 65, g: 105, b: 225 },
      beach: { r: 244, g: 164, b: 96 },
      lowland: { r: 210, g: 180, b: 140 },
      highland: { r: 205, g: 133, b: 63 },
      mountain: { r: 160, g: 82, b: 45 },
      peak: { r: 139, g: 69, b: 19 },
      polar: { r: 255, g: 228, b: 181 },
      atmosphereColor: 0xFFA500
    },
    // Verdant
    {
      deepOcean: { r: 0, g: 100, b: 100 },
      shallowWater: { r: 0, g: 150, b: 150 },
      beach: { r: 238, g: 203, b: 173 },
      lowland: { r: 0, g: 100, b: 0 },
      highland: { r: 34, g: 139, b: 34 },
      mountain: { r: 107, g: 142, b: 35 },
      peak: { r: 85, g: 107, b: 47 },
      polar: { r: 144, g: 238, b: 144 },
      atmosphereColor: 0x90EE90
    }
  ];

  public static getPalette(climate: number): ColorPalette & { getColor: (height: number, seaLevel: number) => RGB } {
    // Interpolate between palettes based on climate value
    const scaledClimate = climate * (this.palettes.length - 1);
    const index = Math.floor(scaledClimate);
    const fraction = scaledClimate - index;
    
    let palette1, palette2;
    
    if (index >= this.palettes.length - 1) {
      palette1 = palette2 = this.palettes[this.palettes.length - 1];
    } else {
      palette1 = this.palettes[index];
      palette2 = this.palettes[index + 1];
    }
    
    // Interpolate colors
    const interpolatedPalette: ColorPalette = {
      deepOcean: this.interpolateColor(palette1.deepOcean, palette2.deepOcean, fraction),
      shallowWater: this.interpolateColor(palette1.shallowWater, palette2.shallowWater, fraction),
      beach: this.interpolateColor(palette1.beach, palette2.beach, fraction),
      lowland: this.interpolateColor(palette1.lowland, palette2.lowland, fraction),
      highland: this.interpolateColor(palette1.highland, palette2.highland, fraction),
      mountain: this.interpolateColor(palette1.mountain, palette2.mountain, fraction),
      peak: this.interpolateColor(palette1.peak, palette2.peak, fraction),
      polar: this.interpolateColor(palette1.polar, palette2.polar, fraction),
      atmosphereColor: palette1.atmosphereColor // Use discrete atmosphere colors
    };
    
    return {
      ...interpolatedPalette,
      getColor: (height: number, seaLevel: number) => this.getColorForHeight(interpolatedPalette, height, seaLevel)
    };
  }
  
  private static interpolateColor(color1: RGB, color2: RGB, factor: number): RGB {
    return {
      r: Math.round(color1.r + (color2.r - color1.r) * factor),
      g: Math.round(color1.g + (color2.g - color1.g) * factor),
      b: Math.round(color1.b + (color2.b - color1.b) * factor)
    };
  }
  
  private static getColorForHeight(palette: ColorPalette, height: number, seaLevel: number): RGB {
    if (height < seaLevel * 0.7) {
      return palette.deepOcean;
    } else if (height < seaLevel) {
      const factor = (height - seaLevel * 0.7) / (seaLevel * 0.3);
      return this.interpolateColor(palette.deepOcean, palette.shallowWater, factor);
    } else if (height < seaLevel + 0.05) {
      const factor = (height - seaLevel) / 0.05;
      return this.interpolateColor(palette.shallowWater, palette.beach, factor);
    } else if (height < seaLevel + 0.3) {
      const factor = (height - seaLevel - 0.05) / 0.25;
      return this.interpolateColor(palette.beach, palette.lowland, factor);
    } else if (height < seaLevel + 0.5) {
      const factor = (height - seaLevel - 0.3) / 0.2;
      return this.interpolateColor(palette.lowland, palette.highland, factor);
    } else if (height < seaLevel + 0.7) {
      const factor = (height - seaLevel - 0.5) / 0.2;
      return this.interpolateColor(palette.highland, palette.mountain, factor);
    } else if (height < seaLevel + 0.9) {
      const factor = (height - seaLevel - 0.7) / 0.2;
      return this.interpolateColor(palette.mountain, palette.peak, factor);
    } else {
      return palette.polar;
    }
  }
}
