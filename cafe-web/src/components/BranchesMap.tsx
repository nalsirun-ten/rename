import React, { useCallback, useEffect, useState } from 'react';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useBranchesStore, isBranchOpenNow } from '../stores/branches';
import { useT } from '../i18n/useT';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Default center: Bishkek coordinates
const DEFAULT_CENTER = { lat: 42.8746, lng: 74.5698 };
const DEFAULT_ZOOM = 12;

// Map controller to handle panning without causing re-renders
function MapController({ branchesWithCoords }: { branchesWithCoords: any[] }) {
  const map = useMap();
  const { activeBranchId, branches } = useBranchesStore();
  useEffect(() => {
    if (!map) return;
    
    if (activeBranchId) {
      const branch = branches.find(b => b.id === activeBranchId);
      if (branch && branch.latitude && branch.longitude) {
        // Save previous state if not already saved
        if (!(window as any).__prevMapState) {
          (window as any).__prevMapState = {
            center: map.getCenter(),
            zoom: map.getZoom()
          };
        }
        
        map.panTo({ lat: branch.latitude, lng: branch.longitude });
        map.setZoom(15);
        setTimeout(() => {
          map.panBy(0, window.innerHeight * 0.15);
        }, 150);
      }
    } else {
      // Restore previous state when modal closes
      if ((window as any).__prevMapState) {
        map.panTo((window as any).__prevMapState.center);
        map.setZoom((window as any).__prevMapState.zoom);
        (window as any).__prevMapState = null;
      }
    }
  }, [map, activeBranchId, branches]);

  return null;
}

// Custom Marker Component that scales with zoom
function BranchMarker({ branch, isActive, onClick }: { branch: any, isActive: boolean, onClick: () => void }) {
  const map = useMap();
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (!map) return;
    setZoom(map.getZoom() || 13);
    const listener = map.addListener('zoom_changed', () => {
      setZoom(map.getZoom() || 13);
    });
    return () => {
      if ((window as any).google) {
        (window as any).google.maps.event.removeListener(listener);
      }
    };
  }, [map]);

  // Scale marker size based on zoom. Base zoom is 13.
  const zoomScale = Math.max(0.6, Math.min(1.8, Math.pow(1.15, zoom - 13)));
  const baseSize = isActive ? 56 : 44;
  const scaledSize = baseSize * zoomScale;
  
  const isOpen = isBranchOpenNow(branch);

  return (
    <AdvancedMarker
      position={{ lat: branch.latitude!, lng: branch.longitude! }}
      onClick={onClick}
      zIndex={isActive ? 10 : 1}
    >
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: scaledSize,
        height: scaledSize + (10 * zoomScale), // extra height for the pin point visually
        transform: `translateY(-${(scaledSize / 2)}px)`, // offset to anchor at bottom point
      }}>
        {/* Teardrop shape */}
        <div style={{
          position: 'absolute',
          width: scaledSize,
          height: scaledSize,
          backgroundColor: '#262626',
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          boxShadow: isActive ? '0 8px 16px rgba(0,0,0,0.4)' : '0 4px 10px rgba(0,0,0,0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />

        {/* Inner Icon */}
        <div style={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          paddingBottom: scaledSize * 0.1, // optical center adjustment
          paddingRight: scaledSize * 0.1,
        }}>
          <span className="icon-material" style={{ 
            color: '#FFF', 
            fontSize: (isActive ? 28 : 22) * zoomScale,
            transition: 'all 0.3s'
          }}>
            local_cafe
          </span>
        </div>

        {/* Status Dot */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 14 * zoomScale,
          height: 14 * zoomScale,
          backgroundColor: isOpen ? '#10B981' : '#EF4444',
          border: `${2 * zoomScale}px solid #FFF`,
          borderRadius: '50%',
          zIndex: 2,
        }} />
      </div>
    </AdvancedMarker>
  );
}

import { MapErrorBoundary } from './MapErrorBoundary';

export default function BranchesMap() {
  const t = useT();
  const { branches, openBranch, activeBranchId } = useBranchesStore();
  const [mapError, setMapError] = useState(false);

  // Filter branches with valid coordinates (preventing crashes from invalid DB entries like lat: 6464646)
  const branchesWithCoords = branches.filter(b => 
    b.latitude && b.longitude && 
    b.latitude >= -90 && b.latitude <= 90 && 
    b.longitude >= -180 && b.longitude <= 180
  );
  const handleMarkerClick = useCallback((branchId: string) => {
    openBranch(branchId);
  }, [openBranch]);

  const fallbackUI = (
    <div className="flex-center" style={{ flex: 1, padding: '40px 16px', flexDirection: 'column', color: '#94A3B8' }}>
      <span className="icon-material" style={{ fontSize: 'clamp(48px, 12.3rem, 68px)', marginBottom: 16 }}>
        {mapError ? 'map' : 'warning'}
      </span>
      <p style={{ fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 600, textAlign: 'center', whiteSpace: 'pre-line' }}>
        {mapError ? t('map_load_error' as any) : t('map_no_api_key' as any)}
      </p>
      <button 
        className="btn-reset" 
        onClick={() => setMapError(false)} 
        style={{ marginTop: 24, padding: '12px 24px', backgroundColor: '#F1F5F9', borderRadius: 12, fontWeight: 600, color: '#475569' }}
      >
        Попробовать снова
      </button>
    </div>
  );

  if (!GOOGLE_MAPS_API_KEY || mapError) {
    return fallbackUI;
  }

  return (
    <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
      <MapErrorBoundary fallback={fallbackUI}>
        <Map
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          minZoom={10}
          maxZoom={18}
          mapId="DEMO_MAP_ID"
          id="main-map"
          colorScheme="LIGHT"
          keyboardShortcuts={false}
          disableDefaultUI={true}
          disableDoubleClickZoom={true}
          gestureHandling="greedy"
          style={{ width: '100%', height: '100%' }}
        >
          <MapController branchesWithCoords={branchesWithCoords} />
          {branchesWithCoords.map((branch) => (
            <BranchMarker
              key={branch.id}
              branch={branch}
              isActive={branch.id === activeBranchId}
              onClick={() => handleMarkerClick(branch.id)}
            />
          ))}
        </Map>
      </MapErrorBoundary>
    </div>
  );
}
