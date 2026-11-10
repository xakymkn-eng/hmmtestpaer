import React from 'react';
import { DroneData } from '../game/drones';

interface DroneGraphicProps {
  drone: DroneData;
  size?: number; // size in px (square box)
  showAura?: boolean;
  className?: string;
}

/**
 * Procedural SVG Sci-Fi Drone Illustration
 * Renders authentic mechanical details, thrusters, glowing sensor eyes,
 * and hardpoint weapons tailored to each drone ID.
 */
export const DroneGraphic: React.FC<DroneGraphicProps> = ({
  drone,
  size = 64,
  showAura = true,
  className = '',
}) => {
  const { id, tier, color, accentColor } = drone;
  const isS = tier === 'S';
  const isA = tier === 'A';

  // Base tier accent
  const tierGlow = isS ? '#f59e0b' : isA ? '#c084fc' : '#38bdf8';
  const gradId = `drone-grad-${id}`;
  const coreGradId = `core-grad-${id}`;
  const glowFilterId = `glow-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="-40 -40 80 80"
      className={`overflow-visible select-none pointer-events-none ${className}`}
      style={{ filter: `drop-shadow(0 0 ${isS ? 8 : 4}px ${tierGlow}55)` }}
    >
      <defs>
        {/* Hull Metallic Gradient */}
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
          <stop offset="35%" stopColor={color} />
          <stop offset="85%" stopColor="#0a101f" />
          <stop offset="100%" stopColor="#030712" />
        </linearGradient>

        {/* Reactor Core Glow */}
        <radialGradient id={coreGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor={accentColor} />
          <stop offset="100%" stopColor={color} stopOpacity={0.2} />
        </radialGradient>

        {/* Soft Glow Filter */}
        <filter id={glowFilterId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={isS ? '2.5' : '1.5'} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Tier Halo Ring (for Tier S and A) */}
      {showAura && isS && (
        <circle
          cx="0"
          cy="0"
          r="34"
          fill="none"
          stroke={tierGlow}
          strokeWidth="1.2"
          strokeDasharray="4 4"
          opacity="0.6"
          className="animate-spin"
          style={{ transformOrigin: '0 0', animationDuration: '14s' }}
        />
      )}

      {showAura && isA && (
        <circle
          cx="0"
          cy="0"
          r="32"
          fill="none"
          stroke={tierGlow}
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.4"
        />
      )}

      {/* 2. Thruster Flame Trails (bottom exhaust) */}
      <g opacity="0.9">
        <path
          d="M -5 18 L 0 32 L 5 18 Z"
          fill={accentColor}
          filter={`url(#${glowFilterId})`}
        />
        <path d="M -2.5 18 L 0 26 L 2.5 18 Z" fill="#ffffff" />
      </g>

      {/* 3. Drone Hull Model based on Drone ID */}
      {renderDroneHull(id, gradId, color, accentColor, coreGradId, glowFilterId)}

      {/* 4. Optical Sensor Lens / Core Eye */}
      <circle
        cx="0"
        cy={getCoreY(id)}
        r={isS ? 4.5 : 3.5}
        fill={`url(#${coreGradId})`}
        stroke="#ffffff"
        strokeWidth="1"
        filter={`url(#${glowFilterId})`}
      />

      {/* 5. Glint Highlight */}
      <circle
        cx="-1"
        cy={getCoreY(id) - 1}
        r="1"
        fill="#ffffff"
        opacity="0.9"
      />
    </svg>
  );
};

function getCoreY(id: string): number {
  if (id === 'drone_vampiric_s') return -2;
  if (id === 'drone_aegis_s') return 0;
  if (id === 'drone_chrono_s') return 0;
  if (id === 'drone_graviton_a') return 0;
  if (id === 'drone_supernova_s') return 2;
  return -4;
}

function renderDroneHull(
  id: string,
  gradId: string,
  color: string,
  accentColor: string,
  coreGradId: string,
  glowFilterId: string
) {
  switch (id) {
    // ==========================================
    // --- TIER S ---
    // ==========================================
    case 'drone_thunder_storm_s':
      // DR-88: Lôi Vân Kích S (Trấn Phái RTS-88) - Dual Tesla Prongs & Lightning Capacitor Wings
      return (
        <g>
          {/* Forward-swept Lightning Aerodynamic Delta Wings */}
          <path
            d="M 0 -26 L 6 -14 L 28 -2 L 32 10 L 22 16 L 14 10 L 10 20 L 0 16 L -10 20 L -14 10 L -22 16 L -32 10 L -28 -2 L -6 -14 Z"
            fill={`url(#${gradId})`}
            stroke="#00f0ff"
            strokeWidth="1.6"
          />
          {/* Dual Nose Tesla Rods */}
          <line x1="-5" y1="-14" x2="-5" y2="-28" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="5" y1="-14" x2="5" y2="-28" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" />
          {/* Electric Micro-arc across rods */}
          <path d="M -5 -24 L 0 -27 L 5 -24" stroke="#ffffff" strokeWidth="1.2" fill="none" />
          {/* Wing Lightning Capacitors */}
          <polygon points="12,0 24,6 16,10" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
          <polygon points="-12,0 -24,6 -16,10" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
        </g>
      );

    case 'drone_vampiric_s':
      // DR-99: Vampiric Blood Moon Bat-Wing Reaper
      return (
        <g>
          {/* Outer Curved Scythe Wings */}
          <path
            d="M 0 -24 L 8 -12 L 28 -8 L 32 8 L 22 18 L 12 12 L 6 18 L 0 14 L -6 18 L -12 12 L -22 18 L -32 8 L -28 -8 L -8 -12 Z"
            fill={`url(#${gradId})`}
            stroke="#ef4444"
            strokeWidth="1.5"
          />
          {/* Blood Plating Ribs */}
          <path
            d="M -16 2 L -8 8 M 16 2 L 8 8"
            stroke="#f87171"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Crimson Energy Needles */}
          <line x1="-24" y1="-4" x2="-24" y2="12" stroke="#dc2626" strokeWidth="2.5" />
          <line x1="24" y1="-4" x2="24" y2="12" stroke="#dc2626" strokeWidth="2.5" />
        </g>
      );

    case 'drone_overclock_s':
      // DR-X: Hyper Overclock Apex Interceptor with Quad Tachyon Guns
      return (
        <g>
          <path
            d="M 0 -26 L 10 -10 L 26 -2 L 22 16 L 8 12 L 0 18 L -8 12 L -22 16 L -26 -2 L -10 -10 Z"
            fill={`url(#${gradId})`}
            stroke="#f59e0b"
            strokeWidth="1.5"
          />
          {/* Overclock Capacitors */}
          <rect x="-18" y="-12" width="3" height="14" fill="#fde047" rx="1.5" />
          <rect x="15" y="-12" width="3" height="14" fill="#fde047" rx="1.5" />
          {/* Gold Lightning Emblems */}
          <path
            d="M -6 -2 L -2 4 L -6 6 L -1 12"
            stroke="#fef08a"
            strokeWidth="1.2"
            fill="none"
          />
          <path
            d="M 6 -2 L 2 4 L 6 6 L 1 12"
            stroke="#fef08a"
            strokeWidth="1.2"
            fill="none"
          />
        </g>
      );

    case 'drone_aegis_s':
      // DR-00: Hexagonal Heavy Aegis Nano Fortress
      return (
        <g>
          {/* Heavy Hexagon Shield Chassis */}
          <path
            d="M 0 -24 L 20 -12 L 20 12 L 0 24 L -20 12 L -20 -12 Z"
            fill={`url(#${gradId})`}
            stroke="#06b6d4"
            strokeWidth="2"
          />
          {/* Interlocking Armor Honeycomb */}
          <path
            d="M -12 -6 L 0 -14 L 12 -6 L 12 6 L 0 14 L -12 6 Z"
            fill="none"
            stroke="#67e8f9"
            strokeWidth="1.2"
          />
          {/* Twin Hardlight Emitter Nodes */}
          <circle cx="-16" cy="0" r="3" fill="#38bdf8" />
          <circle cx="16" cy="0" r="3" fill="#38bdf8" />
        </g>
      );

    case 'drone_chrono_s':
      // DR-77: Chrono Stasis Gyroscopic Singularity
      return (
        <g>
          {/* Concentric Chrono Rings */}
          <ellipse cx="0" cy="0" rx="26" ry="14" fill="none" stroke="#818cf8" strokeWidth="1.5" />
          <ellipse cx="0" cy="0" rx="14" ry="26" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Diamond Central Core */}
          <polygon points="0,-18 16,0 0,18 -16,0" fill={`url(#${gradId})`} stroke="#c084fc" strokeWidth="1.5" />
          {/* Time Pointers */}
          <line x1="0" y1="-14" x2="0" y2="14" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" />
        </g>
      );

    case 'drone_supernova_s':
      // DR-88: Supernova Stellar Flare Drone
      return (
        <g>
          {/* Flaring Solar Wings */}
          <path
            d="M 0 -26 L 8 -14 L 28 -4 L 22 14 L 10 10 L 0 22 L -10 10 L -22 14 L -28 -4 L -8 -14 Z"
            fill={`url(#${gradId})`}
            stroke="#ea580c"
            strokeWidth="1.5"
          />
          {/* Solar Corona Plasma Spikes */}
          <path
            d="M 0 -26 L 4 -20 L 0 -16 L -4 -20 Z"
            fill="#fde047"
            filter={`url(#${glowFilterId})`}
          />
          <circle cx="-18" cy="2" r="3.5" fill="#f97316" />
          <circle cx="18" cy="2" r="3.5" fill="#f97316" />
        </g>
      );

    // ==========================================
    // --- TIER A ---
    // ==========================================
    case 'drone_laser_a':
      // DR-12: Focused Photon Striker
      return (
        <g>
          {/* Slender Prism Delta */}
          <path
            d="M 0 -28 L 7 -10 L 20 6 L 12 14 L 0 8 L -12 14 L -20 6 L -7 -10 Z"
            fill={`url(#${gradId})`}
            stroke="#a855f7"
            strokeWidth="1.4"
          />
          {/* Precision Laser Rail */}
          <line x1="0" y1="-28" x2="0" y2="-4" stroke="#c084fc" strokeWidth="2.5" />
          <circle cx="0" cy="-28" r="2" fill="#ffffff" />
        </g>
      );

    case 'drone_missile_a':
      // DR-15: Tactical Micro-Missile Pod Carrier
      return (
        <g>
          {/* Arrow Body */}
          <path
            d="M 0 -22 L 9 -8 L 18 10 L 6 12 L 0 16 L -6 12 L -18 10 L -9 -8 Z"
            fill={`url(#${gradId})`}
            stroke="#ef4444"
            strokeWidth="1.3"
          />
          {/* Dual Missile Racks (3 missiles each) */}
          <rect x="-22" y="-4" width="6" height="14" fill="#334155" stroke="#ef4444" strokeWidth="1" rx="1" />
          <circle cx="-19" cy="-1" r="1.5" fill="#f87171" />
          <circle cx="-19" cy="3" r="1.5" fill="#f87171" />
          <circle cx="-19" cy="7" r="1.5" fill="#f87171" />

          <rect x="16" y="-4" width="6" height="14" fill="#334155" stroke="#ef4444" strokeWidth="1" rx="1" />
          <circle cx="19" cy="-1" r="1.5" fill="#f87171" />
          <circle cx="19" cy="3" r="1.5" fill="#f87171" />
          <circle cx="19" cy="7" r="1.5" fill="#f87171" />
        </g>
      );

    case 'drone_cryo_a':
      // DR-18: Cryo Shard Ice Stealth Drone
      return (
        <g>
          {/* Sharp Ice Crystal Silhouette */}
          <path
            d="M 0 -26 L 14 -10 L 24 4 L 10 12 L 0 20 L -10 12 L -24 4 L -14 -10 Z"
            fill={`url(#${gradId})`}
            stroke="#38bdf8"
            strokeWidth="1.4"
          />
          {/* Sub-Zero Conduits */}
          <line x1="-12" y1="-4" x2="0" y2="4" stroke="#a5f3fc" strokeWidth="1.5" />
          <line x1="12" y1="-4" x2="0" y2="4" stroke="#a5f3fc" strokeWidth="1.5" />
        </g>
      );

    case 'drone_graviton_a':
      // DR-21: Graviton Void Pulsar
      return (
        <g>
          {/* Curved Magnetic Calipers */}
          <path
            d="M -18 -18 A 22 22 0 0 0 -18 18 L -12 12 A 16 16 0 0 1 -12 -12 Z"
            fill={`url(#${gradId})`}
            stroke="#c084fc"
            strokeWidth="1.2"
          />
          <path
            d="M 18 -18 A 22 22 0 0 1 18 18 L 12 12 A 16 16 0 0 0 12 -12 Z"
            fill={`url(#${gradId})`}
            stroke="#c084fc"
            strokeWidth="1.2"
          />
          {/* Graviton Singularity Sphere */}
          <circle cx="0" cy="0" r="11" fill="#090514" stroke="#a855f7" strokeWidth="1.8" />
          <circle cx="0" cy="0" r="6" fill="#ec4899" opacity="0.8" />
        </g>
      );

    case 'drone_arc_a':
      // DR-24: Tesla Arc Lightning Emitter
      return (
        <g>
          {/* Dual Electrodes Fork */}
          <path
            d="M -10 -26 L -6 -8 L -16 6 L -6 12 L 0 16 L 6 12 L 16 6 L 6 -8 L 10 -26 L 4 -20 L 0 -12 L -4 -20 Z"
            fill={`url(#${gradId})`}
            stroke="#60a5fa"
            strokeWidth="1.4"
          />
          {/* Electric Arc between prongs */}
          <path
            d="M -9 -24 L -3 -19 L 2 -23 L 9 -24"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      );

    // ==========================================
    // --- TIER B ---
    // ==========================================
    case 'drone_scout_b':
      // DR-01: Agile Kinetic Twin-Cannon Scout
      return (
        <g>
          <path
            d="M 0 -22 L 8 -6 L 16 8 L 8 12 L 0 8 L -8 12 L -16 8 L -8 -6 Z"
            fill={`url(#${gradId})`}
            stroke="#06b6d4"
            strokeWidth="1.2"
          />
          {/* Twin Kinetic Guns */}
          <rect x="-11" y="-8" width="2" height="12" fill="#94a3b8" />
          <rect x="9" y="-8" width="2" height="12" fill="#94a3b8" />
        </g>
      );

    case 'drone_armor_b':
      // DR-02: Steel Guard Bulwark Plating
      return (
        <g>
          {/* Shield Plating Shape */}
          <path
            d="M 0 -20 L 16 -8 L 14 10 L 0 18 L -14 10 L -16 -8 Z"
            fill={`url(#${gradId})`}
            stroke="#10b981"
            strokeWidth="1.8"
          />
          {/* Reinforced Titanium Cross */}
          <line x1="-10" y1="0" x2="10" y2="0" stroke="#34d399" strokeWidth="1.5" />
          <line x1="0" y1="-12" x2="0" y2="10" stroke="#34d399" strokeWidth="1.5" />
        </g>
      );

    case 'drone_rapid_b':
      // DR-03: Rapid Gatling Needle Drone
      return (
        <g>
          <path
            d="M 0 -20 L 7 -4 L 14 6 L 6 12 L 0 8 L -6 12 L -14 6 L -7 -4 Z"
            fill={`url(#${gradId})`}
            stroke="#f59e0b"
            strokeWidth="1.2"
          />
          {/* Quad Needle Micro Barrels */}
          <line x1="-5" y1="-22" x2="-5" y2="-4" stroke="#fbbf24" strokeWidth="1.5" />
          <line x1="-2" y1="-24" x2="-2" y2="-4" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="2" y1="-24" x2="2" y2="-4" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="5" y1="-22" x2="5" y2="-4" stroke="#fbbf24" strokeWidth="1.5" />
        </g>
      );

    case 'drone_piercer_b':
    default:
      // DR-04: Heavy Sabot Piercer AP
      return (
        <g>
          {/* Long Kinetic Dart Body */}
          <path
            d="M 0 -26 L 5 -8 L 12 8 L 4 12 L 0 6 L -4 12 L -12 8 L -5 -8 Z"
            fill={`url(#${gradId})`}
            stroke="#cbd5e1"
            strokeWidth="1.3"
          />
          {/* Tungsten Penetrator Spike */}
          <line x1="0" y1="-28" x2="0" y2="-6" stroke="#f1f5f9" strokeWidth="2" />
        </g>
      );
  }
}
