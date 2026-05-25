import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useStoriesStore } from '../stores/stories';

const DURATION_IMAGE = 5000; // 5 seconds for images

export default function StoryViewer() {
  const { stories, activeStoryId, closeStory, markAsSeen } = useStoriesStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Track pointer down time to distinguish tap from hold
  const pointerDownTime = useRef<number>(0);
  const reqAnimRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const pausedProgressRef = useRef<number>(0);

  const [mediaDuration, setMediaDuration] = useState(DURATION_IMAGE);

  // Sync index with activeStoryId initially
  useEffect(() => {
    if (activeStoryId) {
      const idx = stories.findIndex((s) => s.id === activeStoryId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setProgress(0);
        setIsPaused(false);
        setMediaDuration(stories[idx].videoUrl ? DURATION_IMAGE : DURATION_IMAGE);
        pausedProgressRef.current = 0;
        markAsSeen(stories[idx].id);
      }
    }
  }, [activeStoryId, stories, markAsSeen]);

  const currentStory = stories[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
      setMediaDuration(stories[currentIndex + 1].videoUrl ? DURATION_IMAGE : DURATION_IMAGE);
      pausedProgressRef.current = 0;
      markAsSeen(stories[currentIndex + 1].id);
    } else {
      closeStory();
    }
  }, [currentIndex, stories, closeStory, markAsSeen]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
      setMediaDuration(stories[currentIndex - 1].videoUrl ? DURATION_IMAGE : DURATION_IMAGE);
      pausedProgressRef.current = 0;
      markAsSeen(stories[currentIndex - 1].id);
    }
  }, [currentIndex, stories, markAsSeen]);

  // Main progress loop
  useEffect(() => {
    if (!activeStoryId || !currentStory) return;

    if (isPaused) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      return;
    }

    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    let start: number | null = null;
    
    const animate = (timestamp: number) => {
      // If it's a video, rely on video's current time for accuracy
      if (currentStory.videoUrl && videoRef.current && videoRef.current.duration) {
        const v = videoRef.current;
        const currentProgress = v.currentTime / v.duration;
        setProgress(currentProgress);
        
        if (currentProgress >= 1 || v.ended) {
          goNext();
        } else {
          reqAnimRef.current = requestAnimationFrame(animate);
        }
      } else {
        // If it's an image or video duration is not loaded yet, use timer
        const duration = DURATION_IMAGE;
        if (!start) {
          start = timestamp - (pausedProgressRef.current * duration);
        }
        
        const elapsed = timestamp - start;
        const currentProgress = elapsed / duration;
        
        // Only advance if it's an image. If it's a video, wait for video duration to load
        if (currentProgress >= 1 && !currentStory.videoUrl) {
          goNext();
        } else if (!currentStory.videoUrl) {
          setProgress(currentProgress);
          pausedProgressRef.current = currentProgress;
          reqAnimRef.current = requestAnimationFrame(animate);
        } else {
          // It's a video but duration not loaded yet, just keep looping
          reqAnimRef.current = requestAnimationFrame(animate);
        }
      }
    };
    
    reqAnimRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (reqAnimRef.current) {
        cancelAnimationFrame(reqAnimRef.current);
      }
    };
  }, [activeStoryId, currentStory, isPaused, goNext, currentIndex]);

  // Video duration load handler
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setMediaDuration(videoRef.current.duration * 1000);
      if (!isPaused) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownTime.current = Date.now();
    setIsPaused(true);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const holdDuration = Date.now() - pointerDownTime.current;
    setIsPaused(false);
    
    // If held for less than 200ms, consider it a tap
    if (holdDuration < 200) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      // Standard requirement: Right -> Next, Left -> Back
      if (x > rect.width / 2) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  if (!activeStoryId || !currentStory) return null;

  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        touchAction: 'none',
      }}
    >
      {/* Media container */}
      <div 
        style={{ flex: 1, position: 'relative' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setIsPaused(false)}
        onPointerLeave={() => setIsPaused(false)}
      >
        {currentStory.videoUrl ? (
          <video
            ref={videoRef}
            src={currentStory.videoUrl}
            onLoadedMetadata={handleVideoLoadedMetadata}
            playsInline
            loop={false}
            style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
          />
        ) : (
          <img 
            src={currentStory.imageUrl} 
            alt={currentStory.title}
            style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
          />
        )}

        {/* Overlay gradient for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 120,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Progress Bars */}
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          display: 'flex',
          gap: 4,
          zIndex: 2,
        }}>
          {stories.map((s, idx) => {
            let p = 0;
            if (idx < currentIndex) p = 1;
            else if (idx === currentIndex) p = progress;
            
            return (
              <div key={s.id} style={{
                flex: 1,
                height: 3,
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${p * 100}%`,
                  backgroundColor: '#FFF',
                }} />
              </div>
            );
          })}
        </div>

        {/* Header / Close button */}
        <div style={{
          position: 'absolute',
          top: 24,
          left: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 2,
          pointerEvents: 'none', // let clicks pass through to media container
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 'clamp(32px, 8.2vw, 45px)', height: 'clamp(32px, 8.2vw, 45px)', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(16px, 4vw, 22px)' }}>
              {currentStory.category === 'promo' ? '🏷️' : '☕'}
            </div>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 'clamp(14px, 3.6vw, 20px)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              {currentStory.title}
            </span>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); closeStory(); }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#fff', 
              fontSize: 'clamp(24px, 6.1vw, 34px)', 
              padding: 8,
              pointerEvents: 'auto', // enable clicks for close button
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
