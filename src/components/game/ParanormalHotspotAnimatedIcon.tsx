import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type HotspotKind = 'ufo' | 'cryptid' | 'ghost' | 'normal' | 'elvis';

interface ParanormalHotspotAnimatedIconProps {
  kind: HotspotKind;
  icon: string;
  centroidX: number;
  centroidY: number;
  stateId: string;
  svgRef: React.RefObject<SVGSVGElement>;
}

export const ParanormalHotspotAnimatedIcon: React.FC<ParanormalHotspotAnimatedIconProps> = ({
  kind,
  icon,
  centroidX,
  centroidY,
  stateId,
  svgRef
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const getAnimatedPosition = () => {
    const radians = (animationPhase * Math.PI) / 180;
    
    switch (kind) {
      case 'ufo':
        // UFO hovers up and down gently
        return {
          x: centroidX,
          y: centroidY + Math.sin(radians) * 8,
          rotation: Math.sin(radians * 2) * 3 // Slight wobble
        };
      
      case 'cryptid':
        // Bigfoot moves in a figure-8 pattern around the state
        const radius = 15;
        return {
          x: centroidX + Math.sin(radians) * radius,
          y: centroidY + Math.sin(radians * 2) * radius * 0.5,
          rotation: Math.sin(radians) * 10 // Slight walking motion
        };
      
      case 'ghost':
        // Ghost floats in a circular pattern
        const ghostRadius = 12;
        return {
          x: centroidX + Math.cos(radians) * ghostRadius,
          y: centroidY + Math.sin(radians) * ghostRadius,
          rotation: animationPhase // Continuous slow rotation
        };
      
      case 'elvis':
        // Elvis does a little dance
        return {
          x: centroidX + Math.sin(radians * 2) * 5,
          y: centroidY + Math.abs(Math.sin(radians * 4)) * 6,
          rotation: Math.sin(radians * 3) * 15
        };
      
      default:
        return {
          x: centroidX,
          y: centroidY + Math.sin(radians) * 4,
          rotation: 0
        };
    }
  };

  const pos = getAnimatedPosition();

  // Render directly into SVG if we have a ref
  if (!svgRef.current) return null;

  const iconElement = (
    <g
      key={`animated-hotspot-${stateId}`}
      className="paranormal-animated-icon"
      transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotation})`}
      style={{
        transition: 'transform 0.05s linear'
      }}
    >
      <circle
        className="paranormal-hotspot-animated-glow"
        r="22"
        fill="rgba(34, 197, 94, 0.15)"
        style={{
          animation: 'hotspotPulse 3s ease-in-out infinite'
        }}
      />
      
      <text
        className="paranormal-hotspot-animated-icon"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: '20px',
          fontWeight: 600,
          fill: '#ecfdf5',
          filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.8))'
        }}
      >
        {icon}
      </text>
      
      {/* Add kind-specific visual effects */}
      {kind === 'ufo' && (
        <>
          <circle
            r="18"
            fill="none"
            stroke="rgba(96, 165, 250, 0.6)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            style={{
              animation: 'ufoRingRotate 4s linear infinite'
            }}
          />
          <circle
            r="12"
            fill="none"
            stroke="rgba(96, 165, 250, 0.4)"
            strokeWidth="1"
            style={{
              animation: 'ufoRingPulse 2s ease-in-out infinite'
            }}
          />
        </>
      )}
      
      {kind === 'cryptid' && (
        <>
          {/* Footprint trail */}
          <circle
            cx="-8"
            cy="8"
            r="2"
            fill="rgba(76, 128, 92, 0.6)"
            style={{
              animation: 'fadeInOut 2s ease-in-out infinite',
              animationDelay: '0s'
            }}
          />
          <circle
            cx="8"
            cy="12"
            r="2"
            fill="rgba(76, 128, 92, 0.6)"
            style={{
              animation: 'fadeInOut 2s ease-in-out infinite',
              animationDelay: '0.5s'
            }}
          />
          <circle
            cx="-6"
            cy="16"
            r="2"
            fill="rgba(76, 128, 92, 0.6)"
            style={{
              animation: 'fadeInOut 2s ease-in-out infinite',
              animationDelay: '1s'
            }}
          />
        </>
      )}
      
      {kind === 'ghost' && (
        <>
          <circle
            r="20"
            fill="none"
            stroke="rgba(196, 181, 253, 0.5)"
            strokeWidth="2"
            style={{
              animation: 'ghostEthereal 3s ease-in-out infinite'
            }}
          />
          <circle
            r="14"
            fill="rgba(196, 181, 253, 0.1)"
            style={{
              animation: 'ghostEthereal 3s ease-in-out infinite reverse'
            }}
          />
        </>
      )}
    </g>
  );

  return iconElement;
};

// CSS animations as a style tag
export const ParanormalHotspotAnimationStyles = () => (
  <style>{`
    @keyframes ufoRingRotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes ufoRingPulse {
      0%, 100% { 
        r: 12;
        opacity: 0.4;
      }
      50% { 
        r: 16;
        opacity: 0.7;
      }
    }
    
    @keyframes fadeInOut {
      0%, 100% { opacity: 0; }
      50% { opacity: 1; }
    }
    
    @keyframes ghostEthereal {
      0%, 100% { 
        opacity: 0.3;
        transform: scale(1);
      }
      50% { 
        opacity: 0.6;
        transform: scale(1.15);
      }
    }
    
    @media (prefers-reduced-motion: reduce) {
      .paranormal-animated-icon {
        animation: none !important;
        transition: none !important;
      }
      .paranormal-animated-icon * {
        animation: none !important;
      }
    }
  `}</style>
);
