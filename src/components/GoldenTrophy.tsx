import React from 'react';

interface GoldenTrophyProps {
  className?: string;
}

export const GoldenTrophy: React.FC<GoldenTrophyProps> = ({
  className = 'w-24 h-24 sm:w-28 sm:h-28',
}) => {
  return (
    <svg
      viewBox="0 0 120 120"
      className={`${className} drop-shadow-[0_8px_20px_rgba(245,158,11,0.35)] select-none`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Main Golden Sheen Gradient for Bowl */}
        <linearGradient id="gt_goldBowl" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="18%" stopColor="#F59E0B" />
          <stop offset="42%" stopColor="#FEF08A" />
          <stop offset="65%" stopColor="#FBBF24" />
          <stop offset="85%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Cup Inner Depth Gradient */}
        <linearGradient id="gt_innerDepth" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#451A03" />
          <stop offset="60%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Golden Rim & Highlights */}
        <linearGradient id="gt_goldHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="30%" stopColor="#FEF08A" />
          <stop offset="70%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Handle Gradient Left */}
        <linearGradient id="gt_handleLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Handle Gradient Right */}
        <linearGradient id="gt_handleRight" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Pedestal Base Gradient */}
        <linearGradient id="gt_pedestalBase" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#292524" />
          <stop offset="40%" stopColor="#1C1917" />
          <stop offset="100%" stopColor="#0C0A09" />
        </linearGradient>

        {/* Plaque Gold */}
        <linearGradient id="gt_plaqueGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="35%" stopColor="#FEF08A" />
          <stop offset="70%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Soft Gold Glow behind cup */}
        <radialGradient id="gt_cupAura" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
          <stop offset="65%" stopColor="#D97706" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Glow immediately hugging the trophy silhouette (no circle) */}
      <ellipse cx="60" cy="52" rx="46" ry="40" fill="url(#gt_cupAura)" />

      {/* LEFT HANDLE */}
      <g>
        {/* Outer Handle Arc */}
        <path
          d="
            M 34 26
            C 16 26, 12 40, 12 50
            C 12 62, 24 70, 42 66
            L 40 60
            C 28 62, 19 56, 19 49
            C 19 41, 23 32, 35 32
            Z
          "
          fill="url(#gt_handleLeft)"
          stroke="#92400E"
          strokeWidth="0.8"
        />
        {/* Handle specular shine */}
        <path
          d="M 33 28 C 19 28, 15 39, 15 48 C 15 57, 23 63, 37 61"
          stroke="#FFFBEB"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>

      {/* RIGHT HANDLE */}
      <g>
        {/* Outer Handle Arc */}
        <path
          d="
            M 86 26
            C 104 26, 108 40, 108 50
            C 108 62, 96 70, 78 66
            L 80 60
            C 92 62, 101 56, 101 49
            C 101 41, 97 32, 85 32
            Z
          "
          fill="url(#gt_handleRight)"
          stroke="#92400E"
          strokeWidth="0.8"
        />
        {/* Handle specular shine */}
        <path
          d="M 87 28 C 101 28, 105 39, 105 48 C 105 57, 97 63, 83 61"
          stroke="#FFFBEB"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>

      {/* CUP STEM & CONNECTIONS */}
      {/* Lower Stem Flare */}
      <path
        d="M 52 76 C 52 82, 47 86, 45 88 L 75 88 C 73 86, 68 82, 68 76 Z"
        fill="url(#gt_goldBowl)"
        stroke="#92400E"
        strokeWidth="0.8"
      />
      {/* Stem Bead / Sphere */}
      <circle cx="60" cy="74" r="6" fill="url(#gt_goldHighlight)" stroke="#92400E" strokeWidth="0.8" />
      <ellipse cx="58" cy="72.5" rx="2" ry="1.2" fill="#FFFBEB" opacity="0.9" />

      {/* CUP MAIN BOWL BODY */}
      <path
        d="
          M 31 22
          C 31 46, 41 68, 60 68
          C 79 68, 89 46, 89 22
          Z
        "
        fill="url(#gt_goldBowl)"
        stroke="#92400E"
        strokeWidth="1"
      />

      {/* Light Sheen Reflection on Bowl */}
      <path
        d="
          M 38 23
          C 38 43, 46 61, 55 64
          C 50 56, 44 41, 44 23
          Z
        "
        fill="#FFFFFF"
        opacity="0.28"
      />

      {/* Elegant Curved Horizontal Body Trim / Ribbon Line */}
      <path
        d="M 36 38 Q 60 48 84 38"
        stroke="#FDE047"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M 39 42 Q 60 51 81 42"
        stroke="#B45309"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* CUP INNER OPENING & TOP RIM */}
      {/* Inside of Cup */}
      <ellipse cx="60" cy="22" rx="29" ry="5.5" fill="url(#gt_innerDepth)" stroke="#78350F" strokeWidth="0.8" />
      {/* Outer Rim Lip */}
      <ellipse cx="60" cy="21.5" rx="29" ry="4.5" fill="none" stroke="url(#gt_goldHighlight)" strokeWidth="1.8" />
      {/* Front rim highlight reflection */}
      <path
        d="M 33 22 Q 60 27 87 22"
        stroke="#FFFBEB"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* PEDESTAL BASE */}
      {/* Base Golden Collar Tier */}
      <rect
        x="43"
        y="88"
        width="34"
        height="5"
        rx="1.5"
        fill="url(#gt_plaqueGold)"
        stroke="#92400E"
        strokeWidth="0.8"
      />
      <rect x="44" y="89" width="32" height="1" fill="#FFFBEB" opacity="0.7" />

      {/* Main Base Block (Heavy Stone / Walnut Stand) */}
      <rect
        x="36"
        y="93"
        width="48"
        height="15"
        rx="2.5"
        fill="url(#gt_pedestalBase)"
        stroke="#44403C"
        strokeWidth="1"
      />
      {/* Base Bevel Highlight */}
      <line x1="38" y1="94" x2="82" y2="94" stroke="#78716C" strokeWidth="0.8" opacity="0.6" />

      {/* Golden Champion Plaque on Base */}
      <rect
        x="42"
        y="96"
        width="36"
        height="9"
        rx="1.5"
        fill="url(#gt_plaqueGold)"
        stroke="#78350F"
        strokeWidth="0.6"
      />
      <rect x="43" y="97" width="34" height="1" fill="#FFFBEB" opacity="0.6" />
      {/* Plaque Screws/Rivets */}
      <circle cx="44.5" cy="100.5" r="0.75" fill="#78350F" />
      <circle cx="75.5" cy="100.5" r="0.75" fill="#78350F" />
      {/* Engraved Plaque Bar */}
      <rect x="48" y="99.5" width="24" height="2" rx="0.5" fill="#78350F" opacity="0.75" />

      {/* Bottom Base Trim */}
      <rect
        x="32"
        y="108"
        width="56"
        height="4"
        rx="1.5"
        fill="url(#gt_plaqueGold)"
        stroke="#78350F"
        strokeWidth="0.8"
      />
      <line x1="34" y1="109" x2="86" y2="109" stroke="#FFFBEB" strokeWidth="0.8" opacity="0.8" />

      {/* SPARKLING STAR GLINTS (floating in air, not on the cup) */}
      {/* Top right sparkle */}
      <g transform="translate(98, 18)">
        <path d="M 0 -5 Q 0 0 5 0 Q 0 0 0 5 Q 0 0 -5 0 Q 0 0 0 -5 Z" fill="#FEF08A" />
        <circle cx="0" cy="0" r="1.2" fill="#FFFFFF" />
      </g>
      {/* Bottom left sparkle */}
      <g transform="translate(18, 76)">
        <path d="M 0 -4 Q 0 0 4 0 Q 0 0 0 4 Q 0 0 -4 0 Q 0 0 0 -4 Z" fill="#FDE047" opacity="0.85" />
        <circle cx="0" cy="0" r="0.9" fill="#FFFFFF" />
      </g>
      {/* Small glint near rim */}
      <circle cx="34" cy="20" r="1.5" fill="#FFFBEB" />
    </svg>
  );
};
