import React, { useEffect, useState } from 'react';
import { soundManager } from '../sound';

interface CrossedAxesProps {
  className?: string;
  size?: number;
  autoPlaySound?: boolean;
}

export const CrossedAxes: React.FC<CrossedAxesProps> = ({
  className = 'w-24 h-24 sm:w-28 sm:h-28',
  autoPlaySound = true,
}) => {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (autoPlaySound) {
      soundManager.playAxeClashSound();
    }
  }, [animKey, autoPlaySound]);

  const handleReplay = () => {
    setAnimKey((prev) => prev + 1);
  };

  return (
    <div
      key={animKey}
      onClick={handleReplay}
      title="Натисніть для повтору анімації та дзенькоту сокир"
      className="cursor-pointer relative inline-flex items-center justify-center group active:scale-95 transition-transform"
    >
      <svg
        viewBox="-56 -56 112 112"
        className={`${className} drop-shadow-[0_14px_28px_rgba(0,0,0,0.75)] select-none`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>
          {`
            /* Анімація польоту лівої сокири (влітає згори-зліва) */
            @keyframes flyInLeftAxe {
              0% {
                opacity: 0;
                transform: translate(-70px, -45px) rotate(-70deg) scale(0.6);
              }
              50% {
                opacity: 1;
                transform: scale(-1, 1) rotate(40deg);
              }
              75% {
                transform: scale(-1, 1) rotate(32deg);
              }
              100% {
                opacity: 1;
                transform: scale(-1, 1) rotate(35deg);
              }
            }

            /* Анімація польоту правої сокири (влітає згори-справа і б'є навхрест) */
            @keyframes flyInRightAxe {
              0%, 35% {
                opacity: 0;
                transform: translate(75px, -50px) rotate(70deg) scale(0.6);
              }
              45% {
                opacity: 0.9;
              }
              70% {
                opacity: 1;
                transform: rotate(42deg);
              }
              85% {
                transform: rotate(32deg);
              }
              100% {
                opacity: 1;
                transform: rotate(35deg);
              }
            }

            /* Іскри від перехресного зіткнення лез */
            @keyframes sparksBurst {
              0%, 65% {
                opacity: 0;
                transform: scale(0);
              }
              72% {
                opacity: 1;
                transform: scale(1.4);
              }
              100% {
                opacity: 0;
                transform: scale(2.2);
              }
            }

            /* Здригання від важкого удару */
            @keyframes clashShudder {
              0%, 66% {
                transform: translate(0, 0);
              }
              70% {
                transform: translate(-2px, -3px) rotate(-1deg);
              }
              75% {
                transform: translate(3px, 2px) rotate(1.2deg);
              }
              82% {
                transform: translate(-1px, 1px) rotate(-0.5deg);
              }
              100% {
                transform: translate(0, 0) rotate(0deg);
              }
            }

            .axe-container-shudder {
              transform-origin: 0px 5px;
              animation: clashShudder 0.65s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            }

            .left-axe-fly {
              transform-origin: 0px 5px;
              animation: flyInLeftAxe 0.45s cubic-bezier(0.18, 0.89, 0.32, 1.25) forwards;
            }

            .right-axe-fly {
              transform-origin: 0px 5px;
              animation: flyInRightAxe 0.55s cubic-bezier(0.18, 0.89, 0.32, 1.25) forwards;
            }

            .sparks-effect {
              transform-origin: 0px 5px;
              animation: sparksBurst 0.65s ease-out forwards;
            }
          `}
        </style>

        <defs>
          {/* Rich Warm Oak Wood Handle Gradient */}
          <linearGradient id="ca_wood" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#451A03" />
            <stop offset="20%" stopColor="#78350F" />
            <stop offset="45%" stopColor="#B45309" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="88%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#3B1705" />
          </linearGradient>

          {/* Heavy Forged Iron Head Gradient */}
          <linearGradient id="ca_steel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="35%" stopColor="#334155" />
            <stop offset="75%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Polished Sharp Razor Bevel Gradient */}
          <linearGradient id="ca_blade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="30%" stopColor="#94A3B8" />
            <stop offset="65%" stopColor="#E2E8F0" />
            <stop offset="90%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>

          {/* Warm Leather Handle Wrap Gradient */}
          <linearGradient id="ca_leather" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2E1005" />
            <stop offset="40%" stopColor="#5B2209" />
            <stop offset="80%" stopColor="#7C2D12" />
            <stop offset="100%" stopColor="#301004" />
          </linearGradient>

          {/* Sparks Golden Glow */}
          <radialGradient id="ca_sparkGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#FDE047" />
            <stop offset="70%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
          </radialGradient>

          {/* Realistic Drop Shadow between Crossed Axes */}
          <filter id="ca_depthShadow" x="-35%" y="-35%" width="170%" height="170%">
            <feDropShadow dx="2" dy="3.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.8" />
          </filter>

          {/* MASTER AXE: Complete, anatomically correct woodcutter axe with blade facing RIGHT */}
          <g id="masterAxe">
            {/* Top wooden wedge extending past the eye socket */}
            <path
              d="M -4 -38 C -4 -42, 4 -42, 4 -38 Z"
              fill="#92400E"
              stroke="#260D02"
              strokeWidth="0.9"
            />

            {/* Solid curved wooden handle */}
            <path
              d="
                M -4.5 -37
                L -4.5 10
                C -5 22, -7.5 33, -12 43
                C -10 47, -2 48, 1 43
                C 4.5 35, 5.5 22, 4.5 10
                L 4.5 -37
                Z
              "
              fill="url(#ca_wood)"
              stroke="#260D02"
              strokeWidth="1.2"
            />

            {/* Handle grain streaks */}
            <path
              d="M -1.5 -28 L -1.5 14 Q -1.5 28 -6 39"
              stroke="#FEF08A"
              strokeWidth="0.7"
              opacity="0.35"
              strokeLinecap="round"
            />
            <path
              d="M 1 -24 L 1 10 Q 1 23 -2 36"
              stroke="#361304"
              strokeWidth="0.9"
              opacity="0.55"
              strokeLinecap="round"
            />

            {/* Flared pommel knob at base */}
            <ellipse
              cx="-5.5"
              cy="44"
              rx="6.5"
              ry="2.8"
              transform="rotate(20 -5.5 44)"
              fill="#451A03"
              stroke="#260D02"
              strokeWidth="1"
            />

            {/* Leather wrapping under axe head with cross-laces */}
            <g>
              <rect
                x="-5.5"
                y="-21"
                width="11"
                height="14"
                rx="1.5"
                fill="url(#ca_leather)"
                stroke="#260D02"
                strokeWidth="0.9"
              />
              {/* Cross-lacing */}
              <path
                d="
                  M -5 -19 L 5 -15
                  M -5 -15 L 5 -11
                  M 5 -19 L -5 -15
                  M 5 -15 L -5 -11
                "
                stroke="#F59E0B"
                strokeWidth="0.9"
                opacity="0.8"
              />
              <rect x="-6" y="-22" width="12" height="1.8" rx="0.5" fill="#9A3412" stroke="#260D02" strokeWidth="0.5" />
              <rect x="-6" y="-8.5" width="12" height="1.8" rx="0.5" fill="#9A3412" stroke="#260D02" strokeWidth="0.5" />
            </g>

            {/* AXE HEAD: Heavy forged steel head with poll on left and sharp flared blade on right */}
            <path
              d="
                M -11 -24
                L -11 -38
                L 5 -38
                L 26 -43
                C 31 -31, 31 -17, 23 -7
                L 5 -23
                L 5 -24
                Z
              "
              fill="url(#ca_steel)"
              stroke="#0B1120"
              strokeWidth="1.2"
            />

            {/* Hammer Poll on back of axe head */}
            <rect
              x="-12"
              y="-38"
              width="17"
              height="14"
              rx="1.5"
              fill="#1E293B"
              stroke="#0B1120"
              strokeWidth="1"
            />
            <rect x="-10.5" y="-36.5" width="2.5" height="11" rx="0.5" fill="#475569" opacity="0.6" />

            {/* Polished Sharp Curved Blade (Facing RIGHT) */}
            <path
              d="
                M 15 -40
                L 26 -43
                C 31 -31, 31 -17, 23 -7
                L 11 -15
                C 17 -22, 18 -32, 15 -40
                Z
              "
              fill="url(#ca_blade)"
              stroke="#E2E8F0"
              strokeWidth="0.8"
            />

            {/* Brilliant Razor Sharp Blade Highlight */}
            <path
              d="M 26 -43 C 31 -31, 31 -17, 23 -7"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
            />

            {/* Steel Rivet on Axe Collar */}
            <circle cx="-2.5" cy="-31" r="1.4" fill="#94A3B8" stroke="#0B1120" strokeWidth="0.6" />
            <circle cx="-2.8" cy="-31.3" r="0.5" fill="#FFFFFF" />
          </g>
        </defs>

        {/* CONTAINER GROUP WITH IMPACT SHUDDER */}
        <g className="axe-container-shudder">
          {/* BACK AXE: Flies in from top-left, blade points OUTWARD to the left (⬅️) */}
          <g className="left-axe-fly">
            <use href="#masterAxe" />
          </g>

          {/* FRONT AXE: Flies in from top-right, blade points OUTWARD to the right (➡️), with drop shadow over back axe */}
          <g className="right-axe-fly" filter="url(#ca_depthShadow)">
            <use href="#masterAxe" />
          </g>

          {/* IMPACT SPARKS AT CROSSING POINT */}
          <g className="sparks-effect">
            <circle cx="0" cy="5" r="7" fill="url(#ca_sparkGlow)" />
            {/* Spark Rays */}
            <line x1="-8" y1="5" x2="-14" y2="3" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="8" y1="5" x2="14" y2="7" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="-3" x2="-2" y2="-10" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="0" y1="13" x2="2" y2="18" stroke="#F97316" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="-5" y1="0" x2="-11" y2="-5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="5" y1="10" x2="11" y2="15" stroke="#FDE047" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
};
