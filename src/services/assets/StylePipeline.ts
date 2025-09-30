interface StylePipelineOptions {
  width?: number;
  height?: number;
  saturation?: number;
  contrast?: number;
  brightness?: number;
  grain?: number;
}

const DEFAULT_OPTIONS: Required<Omit<StylePipelineOptions, 'width' | 'height'>> = {
  saturation: 1.1,
  contrast: 1.05,
  brightness: 1.05,
  grain: 0.08,
};

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = error => reject(error);
    image.src = url;
  });
}

function applyFilmGrain(ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 255 * intensity;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imageData, 0, 0);
}

export async function runStylePipeline(url: string, options: StylePipelineOptions = {}): Promise<string> {
  if (typeof window === 'undefined') {
    return url;
  }

  const image = await loadImage(url);
  const width = options.width ?? image.width;
  const height = options.height ?? image.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return url;
  }

  const saturation = options.saturation ?? DEFAULT_OPTIONS.saturation;
  const contrast = options.contrast ?? DEFAULT_OPTIONS.contrast;
  const brightness = options.brightness ?? DEFAULT_OPTIONS.brightness;
  ctx.filter = `saturate(${saturation}) contrast(${contrast}) brightness(${brightness})`;
  ctx.drawImage(image, 0, 0, width, height);

  const grain = options.grain ?? DEFAULT_OPTIONS.grain;
  if (grain > 0) {
    applyFilmGrain(ctx, width, height, grain);
  }

  return canvas.toDataURL('image/png');
}
