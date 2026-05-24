import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import appIcon from '@assets/icon/app_icon_circular_sm.png';

interface Props {
  data: string;
  size: number;
  iconSize?: number;
}

export default function QrCode({ data, size, iconSize = 28 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    // Clear previous
    el.innerHTML = '';

    // Use massive internal resolution scale to fix mobile blurriness natively
    const scale = 4;

    new QRCodeStyling({
      width: size * scale,
      height: size * scale,
      data: data || '000000',
      type: 'canvas',
      shape: 'square',
      qrOptions: { errorCorrectionLevel: 'H', typeNumber: 3 },
      dotsOptions: { type: 'dots', color: '#FFFFFF' },
      cornersSquareOptions: { type: 'dot', color: '#FFFFFF' },
      cornersDotOptions: { type: 'dot', color: '#FFFFFF' },
      backgroundOptions: { color: '#1B5E3D' },
      image: appIcon,
      imageOptions: { crossOrigin: 'anonymous', imageSize: iconSize / size, margin: 4 * scale },
    }).append(el);

    // Force Canvas to shrink back down to the CSS size for ultra-sharp Retina rendering
    setTimeout(() => {
      const canvas = el.querySelector('canvas');
      if (canvas) {
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        canvas.style.display = 'block'; // Prevents flex baseline descender space
      }
    }, 0);
  }, [data, size, iconSize]);

  return (
    <div 
      ref={ref} 
      style={{ 
        width: size, 
        height: size, 
        flexShrink: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'hidden' // Hard stop to prevent any flexbox explosion
      }} 
    />
  );
}
