import { useEffect, useRef, useState } from 'react';
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
  const qrRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  // Visual display size — scales with container via rem (1rem = 1% of min(100vw, 430px))
  // At 390px reference: (size / 3.9)rem = size px — exact match
  const displaySize = `clamp(${Math.round(size * 0.85)}px, ${(size / 3.9).toFixed(1)}rem, ${Math.round(size * 1.25)}px)`;

  useEffect(() => {
    // If no data or loading state, don't generate QR
    if (!data || data === '000000') {
      setIsGenerating(true);
      if (qrRef.current) qrRef.current.innerHTML = '';
      return;
    }

    setIsGenerating(true);

    const tempContainer = document.createElement('div');

    new QRCodeStyling({
      width: size,
      height: size,
      data: data,
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
    }).append(tempContainer);

    // Poll until the SVG is generated (async due to image loading)
    const checkInterval = setInterval(() => {
      const svg = tempContainer.querySelector('svg');
      if (svg) {
        clearInterval(checkInterval);
        
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.maxWidth = displaySize;
        svg.style.maxHeight = displaySize;
        svg.style.display = 'block';

        if (qrRef.current) {
          qrRef.current.innerHTML = '';
          qrRef.current.appendChild(svg);
        }
        
        // Slight delay to ensure DOM updates before fading in
        setTimeout(() => setIsGenerating(false), 50);
      }
    }, 50);

    return () => clearInterval(checkInterval);
  }, [data, size, iconSize, color, backgroundColor, displaySize]);

  const showPreloader = (!data || data === '000000') || isGenerating;

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        maxWidth: displaySize,
        maxHeight: displaySize,
        flexShrink: 0, 
        position: 'relative',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'hidden' // Hard stop to prevent any flexbox explosion
      }} 
    >
      <div 
        ref={qrRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          opacity: showPreloader ? 0 : 1, 
          transition: 'opacity 0.3s ease-in-out' 
        }} 
      />
      
      {showPreloader && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div 
            className="animate-spin" 
            style={{ 
              width: 32, height: 32, 
              border: `3px solid rgba(0,0,0,0.1)`, 
              borderTopColor: color, 
              borderRadius: '50%' 
            }}
          />
        </div>
      )}
    </div>
  );
}
