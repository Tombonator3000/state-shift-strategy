import React, { useEffect, useState, useMemo } from 'react';

interface EvidencePhoto {
  id: string;
  src: string;
  caption: string;
  timestamp: string;
  caseNumber: string;
}

interface EvidencePhotoGalleryProps {
  x: number;
  y: number;
  photos?: EvidencePhoto[];
  caseTitle: string;
  duration?: number;
  reducedMotion?: boolean;
  onComplete?: () => void;
}

const EvidencePhotoGallery: React.FC<EvidencePhotoGalleryProps> = ({
  x,
  y,
  photos,
  caseTitle,
  duration = 4500,
  reducedMotion = false,
  onComplete
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const defaultPhotos: EvidencePhoto[] = useMemo(() => [
    {
      id: 'evidence-001',
      src: '/card-art/GOV-006.jpg',
      caption: 'UNIDENTIFIED AERIAL PHENOMENON',
      timestamp: new Date().toLocaleString(),
      caseNumber: 'X-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    },
    {
      id: 'evidence-002', 
      src: '/card-art/GOV-011.jpg',
      caption: 'CLASSIFIED GOVERNMENT FACILITY',
      timestamp: new Date().toLocaleString(),
      caseNumber: 'X-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    },
    {
      id: 'evidence-003',
      src: '/placeholder-event.png',
      caption: 'SURVEILLANCE FOOTAGE - ENHANCED',
      timestamp: new Date().toLocaleString(),
      caseNumber: 'X-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    }
  ], []);

  const displayPhotos = photos || defaultPhotos;

  useEffect(() => {
    if (reducedMotion) {
      setTimeout(onComplete, 1000);
      return;
    }

    const photoInterval = setInterval(() => {
      setCurrentPhotoIndex(prev => {
        if (prev >= displayPhotos.length - 1) {
          clearInterval(photoInterval);
          setTimeout(onComplete, 1000);
          return prev;
        }
        
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 200);
        return prev + 1;
      });
    }, duration / displayPhotos.length);

    return () => clearInterval(photoInterval);
  }, [displayPhotos.length, duration, reducedMotion, onComplete]);

  const galleryStyle = useMemo(() => ({
    '--gallery-x': `${x}px`,
    '--gallery-y': `${y}px`,
  }) as React.CSSProperties, [x, y]);

  const currentPhoto = displayPhotos[currentPhotoIndex];

  if (reducedMotion) {
    return (
      <div
        className="evidence-gallery-simple"
        style={galleryStyle}
        role="dialog"
        aria-label={`Evidence gallery: ${caseTitle}`}
      >
        <div className="simple-evidence">
          📸 Evidence Review: {caseTitle}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`evidence-photo-gallery ${isTransitioning ? 'transitioning' : ''}`}
      style={galleryStyle}
      role="dialog"
      aria-live="polite"
      aria-label={`Evidence gallery: ${caseTitle}`}
    >
      <div className="evidence-frame">
        <div className="case-header">
          <div className="case-title">
            <span className="file-icon">📁</span>
            {caseTitle}
          </div>
          <div className="classification-level">
            EYES ONLY - CLASSIFIED
          </div>
        </div>

        <div className="photo-viewer">
          <div className="photo-container">
            <img
              src={currentPhoto.src}
              alt={currentPhoto.caption}
              className="evidence-photo"
              loading="lazy"
            />
            <div className="photo-overlay">
              <div className="timestamp-stamp">
                {currentPhoto.timestamp}
              </div>
              <div className="case-number">
                {currentPhoto.caseNumber}
              </div>
            </div>
          </div>

          <div className="photo-metadata">
            <div className="evidence-label">EVIDENCE #{currentPhotoIndex + 1}</div>
            <div className="photo-caption">{currentPhoto.caption}</div>
            <div className="analysis-status">
              <span className="status-indicator">🔍</span>
              ANALYSIS IN PROGRESS...
            </div>
          </div>
        </div>

        <div className="gallery-controls">
          <div className="photo-counter">
            {currentPhotoIndex + 1} / {displayPhotos.length}
          </div>
          <div className="progress-indicator">
            <div className="progress-bar-container">
              {displayPhotos.map((_, index) => (
                <div
                  key={index}
                  className={`progress-segment ${index <= currentPhotoIndex ? 'completed' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="security-watermark">
          <div className="watermark-text">
            CLASSIFIED - FOR AUTHORIZED PERSONNEL ONLY
          </div>
          <div className="agency-seal">🛡️</div>
        </div>
      </div>

      <div className="gallery-background" />
      <div className="film-grain" />
    </div>
  );
};

export default EvidencePhotoGallery;