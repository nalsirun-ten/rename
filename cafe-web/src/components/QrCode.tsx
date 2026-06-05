import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import appIcon from '@assets/icon/app_icon_circular_sm.png';

interface Props {
  data: string;
  size: number;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
}

export default function QrCode({ data, size, iconSize = 28, color = '#FFFFFF', backgroundColor = '#1B5E3D' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Visual display size — scales with container via rem (1rem = 1% of min(100vw, 430px))
  // At 390px reference: (size / 3.9)rem = size px — exact match
  const displaySize = `clamp(${Math.round(size * 0.85)}px, ${(size / 3.9).toFixed(1)}rem, ${Math.round(size * 1.25)}px)`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    // Clear previous
    el.innerHTML = '';

    new QRCodeStyling({
      width: size,
      height: size,
      data: data || '000000',
      type: 'svg',
      shape: 'square',
      qrOptions: { errorCorrectionLevel: 'H', typeNumber: 3 },
      dotsOptions: { type: 'dots', color: color },
      cornersSquareOptions: { type: 'dot', color: color },
      cornersDotOptions: { type: 'dot', color: color },
      backgroundOptions: { color: backgroundColor },
      ...(iconSize > 0 ? {
        image: appIcon,
        imageOptions: { crossOrigin: 'anonymous', imageSize: iconSize / size, margin: 4 },
      } : {}),
    }).append(el);

    // Make SVG responsive
    setTimeout(() => {
      const svg = el.querySelector('svg');
      if (svg) {
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.maxWidth = displaySize;
        svg.style.maxHeight = displaySize;
        svg.style.display = 'block';
      }
    }, 0);
  }, [data, size, iconSize, color, backgroundColor, displaySize]);

  return (
    <div 
      ref={ref} 
      style={{ 
        width: '100%', 
        height: '100%', 
        maxWidth: displaySize,
        maxHeight: displaySize,
        flexShrink: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'hidden' // Hard stop to prevent any flexbox explosion
      }} 
    />
  );
}
