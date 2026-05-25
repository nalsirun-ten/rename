import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import appIcon from '@assets/icon/app_icon_circular_sm.png';

const qrCanvasCache = new Map<string, HTMLCanvasElement>();

interface Props {
  data: string;
  size: number;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
}

export default function QrCode({ data, size, iconSize = 28, color = '#FFFFFF', backgroundColor = '#1B5E3D' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    // Clear previous
    el.innerHTML = '';

    const cacheKey = `${data}-${size}-${iconSize}-${color}-${backgroundColor}`;
    if (qrCanvasCache.has(cacheKey)) {
      const cached = qrCanvasCache.get(cacheKey)!;
      el.appendChild(cached);
      return;
    }

    // Use massive internal resolution scale to fix mobile blurriness natively
    const scale = 4;

    new QRCodeStyling({
      width: size * scale,
      height: size * scale,
      data: data || '000000',
      type: 'canvas',
      shape: 'square',
      qrOptions: { errorCorrectionLevel: 'H', typeNumber: 3 },
      dotsOptions: { type: 'dots', color: color },
      cornersSquareOptions: { type: 'dot', color: color },
      cornersDotOptions: { type: 'dot', color: color },
      backgroundOptions: { color: backgroundColor },
      image: appIcon,
      imageOptions: { crossOrigin: 'anonymous', imageSize: iconSize / size, margin: 4 * scale },
    }).append(el);

    // Force Canvas to shrink back down to the CSS size for ultra-sharp Retina rendering
    setTimeout(() => {
      const canvas = el.querySelector('canvas');
      if (canvas) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.maxWidth = `${size}px`; // max natural size
        canvas.style.maxHeight = `${size}px`;
        canvas.style.display = 'block'; // Prevents flex baseline descender space
        qrCanvasCache.set(cacheKey, canvas);
      }
    }, 0);
  }, [data, size, iconSize, color, backgroundColor]);

  return (
    <div 
      ref={ref} 
      style={{ 
        width: '100%', 
        height: '100%', 
        maxWidth: size,
        maxHeight: size,
        flexShrink: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'hidden' // Hard stop to prevent any flexbox explosion
      }} 
    />
  );
}
