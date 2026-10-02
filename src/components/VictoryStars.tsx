import React from 'react';

interface VictoryStarsProps {
  className?: string;
}

export const VictoryStars: React.FC<VictoryStarsProps> = ({
  className = 'w-44 h-24 sm:w-52 sm:h-28',
}) => {
  return (
    <svg
      viewBox="-125 -75 250 150"
      className={`${className} drop-shadow-[0_12px_24px_rgba(234,138,0,0.45)] select-none overflow-visible`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Front Face Warm Golden-Yellow Gradient (exact from reference) */}
        <linearGradient id="gstar_front" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF97A" />
          <stop offset="25%" stopColor="#FFDE1A" />
          <stop offset="60%" stopColor="#FFAE00" />
          <stop offset="100%" stopColor="#FF7A00" />
        </linearGradient>

        {/* 3D Extrusion Side/Bottom Bevel Gradient (dark caramel/amber depth) */}
        <linearGradient id="gstar_3d" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9C4405" />
          <stop offset="50%" stopColor="#752E03" />
          <stop offset="100%" stopColor="#4A1B02" />
        </linearGradient>

        {/* Glossy Curved Highlight Overlay on the upper half */}
        <linearGradient id="gstar_gloss" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#FFF9A6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFEA38" stopOpacity="0" />
        </linearGradient>

        {/* Golden ambient backlight aura */}
        <radialGradient id="gstar_aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD54F" stopOpacity="0.45" />
          <stop offset="65%" stopColor="#FFA000" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FF8F00" stopOpacity="0" />
        </radialGradient>

        {/* Single Reusable Cartoon 3D Golden Star (exact matching uploaded reference) */}
        <g id="refCartoonStar">
          {/* 1. 3D Bottom Extrusion Shadow/Rim (shifted downward by +6px) */}
          <path
            d="
              M 0 -32
              C 3.5 -32, 10 -17, 13 -11
              C 16 -5, 32 -5, 36 -1
              C 39 3, 27 15, 24 20
              C 21 25, 26 40, 23 43
              C 20 46, 6 35, 0 35
              C -6 35, -20 46, -23 43
              C -26 40, -21 25, -24 20
              C -27 15, -39 3, -36 -1
              C -32 -5, -16 -5, -13 -11
              C -10 -17, -3.5 -32, 0 -32
              Z
            "
            transform="translate(0, 6.5)"
            fill="url(#gstar_3d)"
            stroke="#3D1501"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {/* 3D Side extrusion connectors to ensure solid 3D mass */}
          <path
            d="
              M -36 -1 L -36 5.5
              C -32 1.5, -16 1.5, -13 -4.5
              L -13 -11
              M 36 -1 L 36 5.5
              C 32 1.5, 16 1.5, 13 -4.5
              L 13 -11
              M 24 20 L 24 26.5
              C 21 31.5, 26 46.5, 23 49.5
              L 23 43
              M -24 20 L -24 26.5
              C -21 31.5, -26 46.5, -23 49.5
              L -23 43
              M 0 35 L 0 41.5
            "
            fill="url(#gstar_3d)"
            stroke="#3D1501"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {/* 2. Main Golden Front Star Face */}
          <path
            d="
              M 0 -32
              C 3.5 -32, 10 -17, 13 -11
              C 16 -5, 32 -5, 36 -1
              C 39 3, 27 15, 24 20
              C 21 25, 26 40, 23 43
              C 20 46, 6 35, 0 35
              C -6 35, -20 46, -23 43
              C -26 40, -21 25, -24 20
              C -27 15, -39 3, -36 -1
              C -32 -5, -16 -5, -13 -11
              C -10 -17, -3.5 -32, 0 -32
              Z
            "
            fill="url(#gstar_front)"
            stroke="#4A1901"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* 3. Glossy Specular Sheen on Upper Points (exact crescent arc from image) */}
          <path
            d="
              M -2 -28
              C 2 -28, 8 -15, 11 -10
              C 14 -5, 26 -5, 30 -2
              C 20 1, 10 3, 5 6
              C 0 9, -2 14, -3 18
              C -6 12, -9 6, -13 -6
              C -10 -17, -5 -28, -2 -28
              Z
            "
            fill="url(#gstar_gloss)"
          />

          {/* Crisp highlight edge along top curve */}
          <path
            d="M -2 -29 C 1 -29, 6 -17, 10 -11 C 14 -5, 24 -5, 29 -2"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      </defs>

      <style>{`
        /* Staggered Pop-In Bounces matching game victory feel */
        .gstar-left {
          transform-origin: -64px 10px;
          animation: gstarPopLeft 0.52s cubic-bezier(0.175, 0.885, 0.32, 1.32) 0.05s both, gstarFloatLeft 3.4s ease-in-out 0.6s infinite alternate;
        }
        .gstar-center {
          transform-origin: 0px -10px;
          animation: gstarPopCenter 0.58s cubic-bezier(0.175, 0.885, 0.32, 1.36) 0.2s both, gstarFloatCenter 2.8s ease-in-out 0.8s infinite alternate;
        }
        .gstar-right {
          transform-origin: 64px 10px;
          animation: gstarPopRight 0.52s cubic-bezier(0.175, 0.885, 0.32, 1.32) 0.35s both, gstarFloatRight 3.6s ease-in-out 0.9s infinite alternate;
        }

        /* Sparkle Twinkle Animations */
        .gstar-sp-1 {
          animation: gstarTwinkle 2.4s ease-in-out 0.6s infinite;
          transform-origin: 0px -54px;
        }
        .gstar-sp-2 {
          animation: gstarTwinkle 2.6s ease-in-out 0.9s infinite;
          transform-origin: -78px -18px;
        }
        .gstar-sp-3 {
          animation: gstarTwinkle 2.2s ease-in-out 1.2s infinite;
          transform-origin: 78px -18px;
        }

        @keyframes gstarPopLeft {
          0% { opacity: 0; transform: translate(-64px, 10px) scale(0) rotate(-35deg); }
          75% { opacity: 1; transform: translate(-64px, 10px) scale(1.1) rotate(-12deg); }
          100% { opacity: 1; transform: translate(-64px, 10px) scale(0.88) rotate(-15deg); }
        }
        @keyframes gstarPopCenter {
          0% { opacity: 0; transform: translate(0px, -10px) scale(0) rotate(15deg); }
          75% { opacity: 1; transform: translate(0px, -10px) scale(1.26) rotate(-2deg); }
          100% { opacity: 1; transform: translate(0px, -10px) scale(1.16) rotate(0deg); }
        }
        @keyframes gstarPopRight {
          0% { opacity: 0; transform: translate(64px, 10px) scale(0) rotate(35deg); }
          75% { opacity: 1; transform: translate(64px, 10px) scale(1.1) rotate(12deg); }
          100% { opacity: 1; transform: translate(64px, 10px) scale(0.88) rotate(15deg); }
        }

        @keyframes gstarFloatLeft {
          0% { transform: translate(-64px, 10px) scale(0.88) rotate(-15deg); }
          100% { transform: translate(-64px, 6px) scale(0.9) rotate(-12deg); }
        }
        @keyframes gstarFloatCenter {
          0% { transform: translate(0px, -10px) scale(1.16) rotate(0deg); }
          100% { transform: translate(0px, -16px) scale(1.18) rotate(1deg); }
        }
        @keyframes gstarFloatRight {
          0% { transform: translate(64px, 10px) scale(0.88) rotate(15deg); }
          100% { transform: translate(64px, 6px) scale(0.9) rotate(12deg); }
        }

        @keyframes gstarTwinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.4) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.15) rotate(45deg); filter: drop-shadow(0 0 5px #FFF); }
        }
      `}</style>

      {/* Warm Ambient Glow behind stars */}
      <ellipse cx="0" cy="0" rx="95" ry="42" fill="url(#gstar_aura)" />

      {/* 1. LEFT STAR: tilted -15°, scale 0.88, translated (-64, 10) */}
      <g className="gstar-left">
        <use href="#refCartoonStar" />
      </g>

      {/* 2. RIGHT STAR: tilted +15°, scale 0.88, translated (64, 10) */}
      <g className="gstar-right">
        <use href="#refCartoonStar" />
      </g>

      {/* 3. CENTER STAR: Largest (scale 1.16), elevated (-10px), upright */}
      <g className="gstar-center">
        <use href="#refCartoonStar" />
      </g>

      {/* Subtle celebratory glints in cartoon style */}
      <g className="gstar-sp-1" transform="translate(0, -54)">
        <path d="M 0 -8 Q 0 0 8 0 Q 0 0 0 8 Q 0 0 -8 0 Q 0 0 0 -8 Z" fill="#FFFFFF" />
        <circle cx="0" cy="0" r="2" fill="#FFE082" />
      </g>
      <g className="gstar-sp-2" transform="translate(-78, -18) scale(0.75)">
        <path d="M 0 -7 Q 0 0 7 0 Q 0 0 0 7 Q 0 0 -7 0 Q 0 0 0 -7 Z" fill="#FFFFFF" />
        <circle cx="0" cy="0" r="1.8" fill="#FFE082" />
      </g>
      <g className="gstar-sp-3" transform="translate(78, -18) scale(0.75)">
        <path d="M 0 -7 Q 0 0 7 0 Q 0 0 0 7 Q 0 0 -7 0 Q 0 0 0 -7 Z" fill="#FFFFFF" />
        <circle cx="0" cy="0" r="1.8" fill="#FFE082" />
      </g>
    </svg>
  );
};
